import { IProjectRepository } from "../../repositories/IProjectRepository";
import { IMethodologyRepository } from "../../repositories/IMethodologyRepository";
import { ICaseDocumentRepository } from "../../repositories/ICaseDocumentRepository";
import { IFindingRepository } from "../../repositories/IFindingRepository";
import { IAuditEventRepository } from "../../repositories/IAuditEventRepository";
import { LLMService } from "../../../interfaces/services/LLM.service";
import { IMethodologyInterface } from "../../../domain/methodology/methodologyInterface";
import { IProjectInterface } from "../../../domain/project/projectInterface";
import { ICaseDocumentInterface, ICaseSection } from "../../../domain/case_document/caseDocumentInterface";
import { CreateFinding } from "../../../domain/finding/CreateFinding";
import { IFindingInterface, FINDING_ORIGINS, FINDING_STATUSES } from "../../../domain/finding/findingInterface";
import { AuditEventUseCase } from "../index";
import { AuditEvent } from "../../../domain";
import { resolveGuidance } from "../registry/RegistryTemplate";
import { registryForMethodology } from "../registry/RegistryCatalog";
import { buildPreValidationPrompt, IRawFinding, parseFindings } from "./PreValidationPrompt";

/**
 * Adversarial pre-validation: read a finished case the way a validator would,
 * and return the findings before submission rather than after.
 *
 * The argument for this being a separate pass rather than a stricter generation
 * prompt: generation is arguing a case, and a model asked to argue and to
 * attack the same case in one pass does neither well. More practically, the
 * generator only ever sees one section, while a validator reads the whole
 * document and most real findings are about the seams - a number in
 * quantification that does not match the one in baseline, a claim in
 * additionality that the monitoring plan never supports.
 *
 * Findings are persisted as their own records rather than attached to sections,
 * because the value is in the series across projects. See findingInterface.
 */

export interface IPreValidationActor {
  userId: string;
  role: string;
}

export interface IPreValidationResult {
  projectId: string;
  reviewed: string[];       // section keys actually reviewed
  skipped: string[];        // section keys with nothing to review, and why they were skipped
  findings: IFindingInterface[];
  failedSections: { sectionKey: string; error: string }[];
}

// Statuses that mean a section has content worth attacking. Reviewing a
// not_started section would invite the model to invent a finding about
// content that does not exist - the reviewer equivalent of a hallucination.
const REVIEWABLE_STATUSES = ['draft_ready', 'user_edited', 'finalized'];

const MODEL_LABEL = 'gmi-cloud:minimax-m2.7';

export class PreValidationService {
  private auditEventUseCase: AuditEventUseCase;

  constructor(
    private projectRepository: IProjectRepository,
    private methodologyRepository: IMethodologyRepository,
    private caseDocumentRepository: ICaseDocumentRepository,
    private findingRepository: IFindingRepository,
    auditEventRepository: IAuditEventRepository,
    private llmService: LLMService
  ) {
    this.auditEventUseCase = new AuditEventUseCase(auditEventRepository);
  }

  /**
   * Review every reviewable section of a project's case.
   *
   * Fault-tolerant in the same shape as generateAllSections: one section
   * failing must not lose the findings from the sections that succeeded,
   * because a partial findings list is useful and an exception is not.
   */
  async reviewCase(projectId: string, actor: IPreValidationActor): Promise<IPreValidationResult> {
    const { project, methodology, caseDocument } = await this.loadContext(projectId);

    const sections = caseDocument.sections || [];
    const result: IPreValidationResult = {
      projectId,
      reviewed: [],
      skipped: [],
      findings: [],
      failedSections: [],
    };

    for (const section of sections) {
      if (!REVIEWABLE_STATUSES.includes(section.status)) {
        result.skipped.push(section.key);
        continue;
      }

      try {
        const findings = await this.reviewSection(project, methodology, caseDocument, section, actor);
        result.reviewed.push(section.key);
        result.findings.push(...findings);
      } catch (error: any) {
        // Recorded, not thrown. The sections that did review produced real
        // findings and the caller should get them.
        result.failedSections.push({ sectionKey: section.key, error: error?.message || String(error) });
      }
    }

    await this.recordAudit(projectId, actor, 'PRE_VALIDATION_COMPLETED', undefined, {
      reviewed: result.reviewed.length,
      skipped: result.skipped.length,
      failed: result.failedSections.length,
      findings: result.findings.length,
      blocking: result.findings.filter((f) => f.severity === 'blocking').length,
    });

    return result;
  }

  /**
   * Review one section and persist its findings.
   *
   * Open self-review findings for the section are replaced rather than appended
   * to: re-reviewing a regenerated section must not accumulate duplicates, or
   * the series ends up measuring how often someone pressed the button. Findings
   * a human has accepted, rejected or resolved survive, as do any a VVB raised
   * - those are decisions and evidence, not this pass's output.
   */
  async reviewSection(
    project: IProjectInterface & { _id: string },
    methodology: IMethodologyInterface,
    caseDocument: ICaseDocumentInterface,
    section: ICaseSection,
    actor: IPreValidationActor
  ): Promise<IFindingInterface[]> {
    const guidance = resolveGuidance(registryForMethodology(methodology), methodology)
      .find((g) => g.section === section.key);

    const messages = buildPreValidationPrompt({
      methodology,
      project,
      section,
      guidance,
      // The whole document, so cross-section contradictions are visible. This
      // is the main thing the generator could not see.
      otherSections: (caseDocument.sections || []).filter((s) => s.key !== section.key),
    });

    const raw = await this.llmService.structuredCompletion<{ findings: IRawFinding[] }>(messages, {
      // Low temperature: a reviewer that produces a different findings list on
      // each run cannot be measured against a VVB's, which is the point.
      temperature: 0.1,
    });

    const parsed = parseFindings(raw, {
      projectId: String(project._id),
      sectionKey: section.key,
      methodologyCode: methodology.code,
      raisedByUserId: actor.userId,
    });

    const persisted = await this.findingRepository.replaceOpenSelfReviewFindings(
      String(project._id),
      section.key,
      parsed
    );

    return persisted;
  }

  async getFindings(projectId: string): Promise<IFindingInterface[]> {
    return await this.findingRepository.getFindingsByProjectId(projectId);
  }

  /**
   * The cross-project view. This is the number a developer repeats to their
   * board, and the one that says whether pre-validation is working: findings
   * per case against that customer's own baseline.
   */
  async getFindingStats(methodologyCode?: string): Promise<any[]> {
    return await this.findingRepository.getFindingStatsByMethodology(methodologyCode);
  }

  async resolveFinding(
    id: string,
    status: string,
    resolutionNote: string | undefined,
    projectId: string,
    actor: IPreValidationActor
  ): Promise<IFindingInterface | null> {
    const allowed = [FINDING_STATUSES.ACCEPTED, FINDING_STATUSES.REJECTED, FINDING_STATUSES.RESOLVED, FINDING_STATUSES.OPEN] as string[];
    if (!allowed.includes(status)) {
      throw new Error(`status must be one of ${allowed.join(', ')} — got '${status}'`);
    }
    // Rejecting a finding is a judgement that should be defensible later, so it
    // cannot be silent. Accepting or resolving carries its own evidence (the
    // fix); rejecting carries only the reason.
    if (status === FINDING_STATUSES.REJECTED && !resolutionNote) {
      throw new Error('rejecting a finding requires a resolutionNote explaining why');
    }

    const updated = await this.findingRepository.updateFindingStatus(id, status, resolutionNote);
    await this.recordAudit(projectId, actor, 'FINDING_STATUS_CHANGED', undefined, { id, status, resolutionNote });
    return updated;
  }

  // ---------------------------------------------------------------------------

  private async loadContext(projectId: string) {
    const project: any = await this.projectRepository.getProjectById(projectId);
    if (!project) throw new Error(`Project '${projectId}' not found`);

    const methodologyId = project.methodologyId?._id || project.methodologyId;
    if (!methodologyId) throw new Error(`Project '${projectId}' has no methodology selected`);

    // getProjectById populates methodologyId, so prefer the populated document
    // over a second round trip — the same normalisation the origination UI
    // needed after the populated-vs-id mismatch bug.
    const methodology: any = project.methodologyId?.code
      ? project.methodologyId
      : await this.methodologyRepository.getMethodologyById(String(methodologyId));
    if (!methodology) throw new Error(`Methodology '${methodologyId}' not found`);

    const caseDocument: any = await this.caseDocumentRepository.getCaseDocumentByProjectId(projectId);
    if (!caseDocument) throw new Error(`Project '${projectId}' has no case document`);

    return { project, methodology, caseDocument };
  }

  private async recordAudit(projectId: string, actor: IPreValidationActor, eventType: string, before?: any, after?: any) {
    await new AuditEvent().record({
      projectId,
      actorUserId: actor.userId,
      actorRole: actor.role,
      eventType,
      before,
      after,
    }, this.auditEventUseCase);
  }
}
