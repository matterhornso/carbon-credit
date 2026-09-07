// Orchestrates AI case-section generation: loads project/methodology/source
// context, assembles the right prompt for the section's content type,
// calls the LLM, validates citations against what was actually supplied,
// persists the result, and drives the CASE_GENERATING lifecycle transition.
// This is the usecase layer for generation — GenerationController stays thin.

import { IProjectRepository } from "../../repositories/IProjectRepository";
import { IMethodologyRepository } from "../../repositories/IMethodologyRepository";
import { ICaseDocumentRepository } from "../../repositories/ICaseDocumentRepository";
import { ISourceDocumentRepository } from "../../repositories/ISourceDocumentRepository";
import { IAuditEventRepository } from "../../repositories/IAuditEventRepository";
import { LLMService, LLMMessage } from "../../../interfaces/services/LLM.service";
import { ICaseDocumentInterface, ICaseSection } from "../../../domain/case_document/caseDocumentInterface";
import { IMethodologyInterface, ISectionGuidance } from "../../../domain/methodology/methodologyInterface";
import { IProjectInterface } from "../../../domain/project/projectInterface";
import { UpdateCaseDocumentSection } from "../../../domain/case_document/UpdateCaseDocumentSection";
import { AuditEvent as AuditEventDomain } from "../../../domain";
import AuditEventUseCase from "../audit_event/AuditEvent";
import { PROJECT_STATUSES } from "../../../domain/project/projectStatus";
import { assertValidTransition } from "../project_lifecycle/ProjectLifecycle";
import {
  buildSourceExcerpts,
  buildAdditionalityPrompt,
  buildBaselinePrompt,
  buildGenericStructuredPrompt,
  buildNarrativePrompt,
  parseNarrativeCitations,
  validateCitations,
} from "./PromptAssembler";
import {
  FIXED_SHAPE_SECTIONS,
  IAdditionalityGenerationContent,
  IBaselineGenerationContent,
  IGenericStructuredContent,
  IGeneratedCitation,
  ISourceExcerpt,
} from "./generationTypes";

export interface IGenerationActor {
  userId: string;
  role: string;
}

interface IGenerationContext {
  project: IProjectInterface & { _id: string };
  methodology: IMethodologyInterface;
  caseDocument: ICaseDocumentInterface & { _id: string };
  excerpts: ISourceExcerpt[];
}

const MODEL_LABEL = 'gmi-cloud:minimax-m2.7';

// Statuses that mean a section already produced content worth keeping, and so
// should be skipped when resuming a partially failed run.
const COMPLETED_SECTION_STATUSES = ['draft_ready', 'user_edited', 'finalized'];

export class GenerationService {
  private auditEventUseCase: AuditEventUseCase;

  constructor(
    private projectRepository: IProjectRepository,
    private methodologyRepository: IMethodologyRepository,
    private caseDocumentRepository: ICaseDocumentRepository,
    private sourceDocumentRepository: ISourceDocumentRepository,
    auditEventRepository: IAuditEventRepository,
    private llmService: LLMService
  ) {
    this.auditEventUseCase = new AuditEventUseCase(auditEventRepository);
  }

  async generateSection(projectId: string, sectionKey: string, actor: IGenerationActor): Promise<ICaseDocumentInterface> {
    const context = await this.loadContext(projectId, sectionKey);
    await this.ensureGeneratingStatus(context.project);
    return this.runSectionGeneration(context, sectionKey, actor);
  }

  // Priority order per the CEO plan: additionality and baseline_scenario are
  // the sections the actual customers named as expensive/outsourced — they
  // run first, everything else follows in the methodology's own section
  // order. Already-'finalized' sections are left alone (a human approved
  // them; don't clobber that on a re-run).
  async generateAllSections(
    projectId: string,
    actor: IGenerationActor,
    options: { onlyMissing?: boolean } = {}
  ): Promise<ICaseDocumentInterface> {
    const context = await this.loadContext(projectId);
    await this.ensureGeneratingStatus(context.project);

    const guidance = context.methodology.sectionGuidance || [];
    const priority = [FIXED_SHAPE_SECTIONS.ADDITIONALITY, FIXED_SHAPE_SECTIONS.BASELINE_SCENARIO];
    const orderedKeys = [
      ...priority.filter((key) => guidance.some((g) => g.section === key)),
      ...guidance.map((g) => g.section).filter((key) => !priority.includes(key as any)),
    ];

    let result: ICaseDocumentInterface = context.caseDocument;
    const failed: string[] = [];
    const generated: string[] = [];

    for (const key of orderedKeys) {
      const currentSection = (result.sections || []).find((s) => s.key === key);
      if (currentSection?.status === 'finalized') continue;
      // Resume mode: leave anything that already produced content alone, so a
      // retry after a partial failure costs only the sections still missing
      // rather than re-billing the whole run.
      if (options.onlyMissing && currentSection && COMPLETED_SECTION_STATUSES.includes(currentSection.status)) continue;

      try {
        const sectionContext = { ...context, excerpts: buildSourceExcerpts(await this.getAllSourceDocuments(projectId), key) };
        result = await this.runSectionGeneration(sectionContext, key, actor);
        generated.push(key);
      } catch (error: any) {
        // One section failing must not abandon the rest of the run. An
        // unattended generation that dies on section 7 of 10 would otherwise
        // strand the project mid-state with no record of what went wrong.
        const message = error?.message || String(error);
        failed.push(key);
        const persisted = await this.recordSectionFailure(String(context.caseDocument._id), currentSection, key, message);
        if (persisted) result = persisted;
        await this.recordAudit(projectId, actor, 'SECTION_GENERATION_FAILED', undefined, { sectionKey: key, error: message });
      }
    }

    // Only claim the case is ready if it actually is. A partial run stays in
    // CASE_GENERATING so a retry is the obvious next step rather than a
    // reviewer discovering the gap.
    const refreshed = await this.projectRepository.getProjectById(projectId);
    if (failed.length === 0 && refreshed?.status === PROJECT_STATUSES.CASE_GENERATING) {
      await this.projectRepository.transitionStatus(projectId, PROJECT_STATUSES.CASE_DRAFT_READY);
      await this.recordAudit(projectId, actor, 'STATUS_TRANSITION', { status: PROJECT_STATUSES.CASE_GENERATING }, { status: PROJECT_STATUSES.CASE_DRAFT_READY });
    } else if (failed.length > 0) {
      await this.recordAudit(projectId, actor, 'GENERATION_INCOMPLETE', undefined, {
        generatedCount: generated.length,
        failedCount: failed.length,
        failedSections: failed,
      });
    }

    return result;
  }

  // Accepted CEO-plan expansion #5: a short, honest summary of what's
  // AI-assisted vs. human-finalized, for the VVB reading the export
  // package. Not stored on the CaseDocument — regenerated on demand at
  // export time so it always reflects current section statuses.
  async generateCoverNote(projectId: string, actor: IGenerationActor): Promise<{ coverNote: string }> {
    const context = await this.loadContext(projectId);
    const sections = context.caseDocument.sections || [];
    const summaryLines = sections
      .map((s) => `- ${s.key}: ${s.status}${(s.warnings || []).length ? `, ${s.warnings!.length} flagged warning(s) under human review` : ''}`)
      .join('\n');

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: 'Write a short, professional cover note (2-3 sentences, plain prose, no headers) for a carbon credit PDD case package being submitted to a validation/verification body. State plainly that the case was AI-assisted with human review, name whether every section reached human-finalized status, and do not claim more certainty than the section statuses actually support.',
      },
      {
        role: 'user',
        content: `Methodology: ${context.methodology.code} v${context.methodology.version} — ${context.methodology.title}\nSection status:\n${summaryLines}`,
      },
    ];

    const result = await this.llmService.chatCompletion(messages);
    await this.recordAudit(projectId, actor, 'COVER_NOTE_GENERATED', undefined, { length: result.content.length });
    return { coverNote: result.content };
  }

  // Narrative sections only — structured sections are re-generated wholesale
  // via generateSection, not chat-refined.
  async refineSection(projectId: string, sectionKey: string, userMessage: string, actor: IGenerationActor): Promise<ICaseDocumentInterface> {
    const context = await this.loadContext(projectId, sectionKey);
    const guidance = this.resolveGuidance(context.methodology, sectionKey);
    // additionality/baseline_scenario are generated through their own typed
    // branches whatever sectionGuidance declares, so their stored content is
    // structured ({tiers,...} / {variables, formulaApplied,...}). Both are in
    // fact seeded as contentType 'narrative', so guidance alone would let a
    // refine through and flatten that structure to {text, citations} —
    // silently dropping the tiers or variables a reviewer needs. The UI never
    // offers refine for them; this closes the same path via direct API call.
    const isFixedShape = (Object.values(FIXED_SHAPE_SECTIONS) as string[]).includes(sectionKey);
    if (isFixedShape || guidance.contentType !== 'narrative') {
      throw new Error(`Section '${sectionKey}' is not a narrative section — regenerate it instead of refining`);
    }

    const existingSection = (context.caseDocument.sections || []).find((s) => s.key === sectionKey);
    const priorTurns: LLMMessage[] = (existingSection?.generationHistory || []).map((event) => ({
      role: 'assistant' as const,
      content: event.response,
    }));
    priorTurns.push({ role: 'user', content: userMessage });

    const messages = buildNarrativePrompt(context.methodology, guidance, context.project, context.excerpts, priorTurns);
    const result = await this.llmService.chatCompletion(messages);
    const { text, citations } = parseNarrativeCitations(result.content);
    const validatedCitations = validateCitations(citations, context.excerpts);

    const updated = await this.caseDocumentRepository.updateSection(new UpdateCaseDocumentSection({
      caseDocumentId: String(context.caseDocument._id),
      sectionKey,
      status: 'draft_ready',
      content: { text, citations: validatedCitations },
      sourceCitations: validatedCitations.map((c) => c.sourceDetail),
      generationHistoryEntry: { prompt: userMessage, response: result.content, model: MODEL_LABEL },
      lastEditedByUserId: actor.userId,
      lastError: null,
    }));

    await this.recordAudit(projectId, actor, 'SECTION_REFINED', undefined, { sectionKey, contentLength: text.length });

    if (!updated) throw new Error('Failed to persist refined section');
    return updated;
  }

  // ---------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------

  private async runSectionGeneration(context: IGenerationContext, sectionKey: string, actor: IGenerationActor): Promise<ICaseDocumentInterface> {
    const guidance = this.resolveGuidance(context.methodology, sectionKey);
    const warnings = await this.detectContradictions(context.project, context.excerpts);

    let content: unknown;
    let citations: IGeneratedCitation[];
    let promptForAudit: string;
    let responseForAudit: string;

    if (sectionKey === FIXED_SHAPE_SECTIONS.ADDITIONALITY) {
      const messages = buildAdditionalityPrompt(context.methodology, context.project, guidance, context.excerpts);
      const parsed = await this.llmService.structuredCompletion<IAdditionalityGenerationContent>(messages);
      parsed.tiers.forEach((tier) => { tier.citations = validateCitations(tier.citations, context.excerpts); });
      content = parsed;
      citations = parsed.tiers.reduce((acc: IGeneratedCitation[], tier) => acc.concat(tier.citations), []);
      promptForAudit = messages[messages.length - 1].content;
      responseForAudit = JSON.stringify(parsed);
    } else if (sectionKey === FIXED_SHAPE_SECTIONS.BASELINE_SCENARIO) {
      const messages = buildBaselinePrompt(context.methodology, context.project, guidance, context.excerpts);
      const parsed = await this.llmService.structuredCompletion<IBaselineGenerationContent>(messages);
      parsed.variables.forEach((v) => { v.citations = validateCitations(v.citations, context.excerpts); });
      content = parsed;
      citations = parsed.variables.reduce((acc: IGeneratedCitation[], v) => acc.concat(v.citations), []);
      promptForAudit = messages[messages.length - 1].content;
      responseForAudit = JSON.stringify(parsed);
    } else if (guidance.contentType === 'structured') {
      const messages = buildGenericStructuredPrompt(context.methodology, guidance, context.project, context.excerpts);
      const parsed = await this.llmService.structuredCompletion<IGenericStructuredContent>(messages);
      parsed.citations = validateCitations(parsed.citations, context.excerpts);
      content = parsed;
      citations = parsed.citations;
      promptForAudit = messages[messages.length - 1].content;
      responseForAudit = JSON.stringify(parsed);
    } else {
      const messages = buildNarrativePrompt(context.methodology, guidance, context.project, context.excerpts);
      const result = await this.llmService.chatCompletion(messages);
      const { text, citations: rawCitations } = parseNarrativeCitations(result.content);
      const validated = validateCitations(rawCitations, context.excerpts);
      content = { text, citations: validated };
      citations = validated;
      promptForAudit = messages[messages.length - 1].content;
      responseForAudit = result.content;
    }

    const updated = await this.caseDocumentRepository.updateSection(new UpdateCaseDocumentSection({
      caseDocumentId: String(context.caseDocument._id),
      sectionKey,
      status: 'draft_ready',
      content,
      sourceCitations: citations.map((c) => c.sourceDetail),
      warnings,
      generationHistoryEntry: { prompt: promptForAudit, response: responseForAudit, model: MODEL_LABEL },
      lastError: null,
    }));

    await this.recordAudit(context.project._id, actor, 'SECTION_GENERATED', undefined, {
      sectionKey,
      citationCount: citations.length,
      unverifiedCitations: citations.filter((c) => c.source === 'source_document' && c.verified === false).length,
      warningCount: warnings.length,
    });

    if (!updated) throw new Error(`Failed to persist generated section '${sectionKey}'`);
    return updated;
  }

  // Semantic cross-check between uploaded source text and structured intake
  // answers — string matching can't catch "intake says no land clearing,
  // the ecological survey mentions clearing in 2024." One extra structured
  // call per section generation, using the excerpts already gathered.
  private async detectContradictions(project: IProjectInterface, excerpts: ISourceExcerpt[]): Promise<string[]> {
    if (excerpts.length === 0 || !project.intake || Object.keys(project.intake).length === 0) return [];

    const intakeLines = Object.entries(project.intake).map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`).join('\n');
    const excerptBlock = excerpts.map((e) => `[${e.id}] ${e.excerpt}`).join('\n\n');
    const messages: LLMMessage[] = [
      { role: 'system', content: 'You check for direct factual contradictions between a project\'s structured intake answers and its uploaded supporting documents. Only flag genuine, specific contradictions — not vague tension or missing detail. Respond with ONLY JSON, no markdown fence: {"contradictions": ["<one sentence per contradiction, naming the intake field, the document excerpt ID, and the specific conflict>"]}' },
      { role: 'user', content: `INTAKE ANSWERS:\n${intakeLines}\n\nSOURCE EXCERPTS:\n${excerptBlock}` },
    ];

    try {
      const result = await this.llmService.structuredCompletion<{ contradictions: string[] }>(messages);
      return Array.isArray(result.contradictions) ? result.contradictions : [];
    } catch {
      // Contradiction detection is a quality bonus, not a gate — a failure
      // here must never block the actual section generation.
      return [];
    }
  }

  // Records why a section failed without destroying work that already exists:
  // a section that previously generated fine keeps its content and status and
  // only carries the error, because a stale draft is more useful to a reviewer
  // than an empty one.
  private async recordSectionFailure(
    caseDocumentId: string,
    currentSection: ICaseSection | undefined,
    sectionKey: string,
    message: string
  ): Promise<ICaseDocumentInterface | null> {
    const hasUsableContent = !!currentSection?.content && currentSection.status !== 'not_started';
    try {
      return await this.caseDocumentRepository.updateSection(new UpdateCaseDocumentSection({
        caseDocumentId,
        sectionKey,
        status: hasUsableContent ? currentSection!.status : 'generation_failed',
        lastError: message,
      }));
    } catch {
      // Persisting the failure must never itself abort the run.
      return null;
    }
  }

  private resolveGuidance(methodology: IMethodologyInterface, sectionKey: string): ISectionGuidance {
    const guidance = (methodology.sectionGuidance || []).find((g) => g.section === sectionKey);
    if (!guidance) throw new Error(`No section guidance found for '${sectionKey}' on methodology '${methodology.code}'`);
    return guidance;
  }

  private async ensureGeneratingStatus(project: IProjectInterface & { _id: string }): Promise<void> {
    if (project.status === PROJECT_STATUSES.INPUTS_SUBMITTED) {
      assertValidTransition(project.status, PROJECT_STATUSES.CASE_GENERATING);
      await this.projectRepository.transitionStatus(String(project._id), PROJECT_STATUSES.CASE_GENERATING);
    } else if (project.status !== PROJECT_STATUSES.CASE_GENERATING && project.status !== PROJECT_STATUSES.CASE_DRAFT_READY) {
      throw new Error(`Cannot generate case content from project status '${project.status}'`);
    }
  }

  private async getAllSourceDocuments(projectId: string) {
    return this.sourceDocumentRepository.getSourceDocumentsByProjectId(projectId);
  }

  private async loadContext(projectId: string, sectionKey?: string): Promise<IGenerationContext> {
    const project: any = await this.projectRepository.getProjectById(projectId);
    if (!project) throw new Error('Project not found');
    if (!project.methodologyId) throw new Error('Project has no methodology selected');

    const methodologyId = project.methodologyId._id || project.methodologyId;
    const methodology = await this.methodologyRepository.getMethodologyById(String(methodologyId));
    if (!methodology) throw new Error('Methodology not found');

    const caseDocument: any = project.caseDocumentId
      ? await this.caseDocumentRepository.getCaseDocumentByProjectId(projectId)
      : null;
    if (!caseDocument) throw new Error('Project has no case document — select a methodology first');

    const sourceDocuments = await this.sourceDocumentRepository.getSourceDocumentsByProjectId(projectId);
    const excerpts = sectionKey ? buildSourceExcerpts(sourceDocuments, sectionKey) : [];

    return { project, methodology, caseDocument, excerpts };
  }

  private async recordAudit(projectId: string, actor: IGenerationActor, eventType: string, before?: any, after?: any): Promise<void> {
    await new AuditEventDomain().record(
      { projectId, actorUserId: actor.userId, actorRole: actor.role, eventType, before, after },
      this.auditEventUseCase
    );
  }
}
