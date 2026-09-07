// Pins the orchestration contracts of GenerationService — the layer that had
// no test coverage at all, despite being where the expensive behaviour lives:
// section ordering, the CASE_GENERATING -> CASE_DRAFT_READY lifecycle drive,
// the "never clobber a human-finalized section" rule, and the citation
// verification that makes the rigor claim checkable rather than asserted.
//
// The LLM is faked, so these run with no network and no API key. What is NOT
// faked is the methodology: the ordering tests import the REAL seeded VM0047
// and VMR0017 documents, so a regression that re-hardcodes AFOLU section
// order fails here instead of during the next cross-sector run.

import { expect } from 'chai';
import { GenerationService } from '../../application/usecases/generation/GenerationService';
import { LLMService, LLMMessage, LLMResult } from '../../interfaces/services/LLM.service';
import { PROJECT_STATUSES } from '../project/projectStatus';
import {
  VM0047_CENSUS_BASED,
  VMR0017_GRID_RENEWABLE,
} from '../../infrastructure/database/seed/methodology.seed';

const ACTOR = { userId: 'user-1', role: 'ISSUER' };
const PROJECT_ID = 'project-1';
const CASE_DOC_ID = 'case-1';

// ---------------------------------------------------------------------------
// Fakes — in-memory, no Mongo. Each records what it was asked to do so the
// tests can assert on orchestration rather than on persisted state alone.
// ---------------------------------------------------------------------------

class FakeProjectRepository {
  public transitions: string[] = [];
  constructor(public project: any) {}
  async getProjectById(_id: string) { return this.project; }
  async transitionStatus(_id: string, status: string) {
    this.transitions.push(status);
    this.project.status = status;
    return this.project;
  }
  async createProject(): Promise<any> { throw new Error('not used'); }
  async updateProject(): Promise<any> { throw new Error('not used'); }
  async setCaseDocumentId(): Promise<any> { throw new Error('not used'); }
  async addAttachment(): Promise<any> { throw new Error('not used'); }
  async getAllProjects(): Promise<any> { throw new Error('not used'); }
}

class FakeCaseDocumentRepository {
  public writtenSectionKeys: string[] = [];
  constructor(public caseDocument: any) {}
  async getCaseDocumentByProjectId(_projectId: string) { return this.caseDocument; }
  // Mirrors the real mongo statics: only fields actually present on the update
  // are written, so an update that omits content leaves existing content alone.
  async updateSection(update: any) {
    this.writtenSectionKeys.push(update.sectionKey);
    const sections = this.caseDocument.sections || (this.caseDocument.sections = []);
    let existing = sections.find((s: any) => s.key === update.sectionKey);
    if (!existing) {
      existing = { key: update.sectionKey, status: 'not_started', generationHistory: [] };
      sections.push(existing);
    }
    if (update.status) existing.status = update.status;
    if (update.content !== undefined) existing.content = update.content;
    if (update.sourceCitations) existing.sourceCitations = update.sourceCitations;
    if (update.warnings !== undefined) existing.warnings = update.warnings;
    if (update.lastError !== undefined) existing.lastError = update.lastError;
    if (update.lastEditedByUserId) existing.lastEditedByUserId = update.lastEditedByUserId;
    if (update.generationHistoryEntry) {
      existing.generationHistory = [...(existing.generationHistory || []), update.generationHistoryEntry];
    }
    return this.caseDocument;
  }
  async createCaseDocument(): Promise<any> { throw new Error('not used'); }
}

class FakeSourceDocumentRepository {
  constructor(public docs: any[] = []) {}
  async getSourceDocumentsByProjectId(_projectId: string) { return this.docs; }
  async createSourceDocument(): Promise<any> { throw new Error('not used'); }
  async updateExtractedText(): Promise<any> { throw new Error('not used'); }
}

class FakeMethodologyRepository {
  constructor(public methodology: any) {}
  async getMethodologyById(_id: string) { return this.methodology; }
  async getAllMethodologies(): Promise<any> { throw new Error('not used'); }
  async getMethodologyByCode(): Promise<any> { throw new Error('not used'); }
  async createMethodology(): Promise<any> { throw new Error('not used'); }
}

class FakeAuditEventRepository {
  public events: any[] = [];
  async createAuditEvent(event: any) { this.events.push(event); return event; }
  async getEventsByProjectId() { return this.events; }
}

// Dispatches on the prompt so one fake serves every generation branch.
// `contradictions` / `failContradictionCheck` let a test drive the
// contradiction path without touching the section-generation path.
class FakeLLMService extends LLMService {
  public structuredCalls = 0;
  public chatCalls = 0;
  constructor(
    private opts: {
      contradictions?: string[];
      failContradictionCheck?: boolean;
      citationSourceDetail?: string;
      failSections?: string[];
    } = {}
  ) { super(); }

  // Generic structured and narrative prompts both carry a "SECTION: <key>"
  // line, which is how a test targets one section for failure.
  private shouldFail(prompt: string): string | undefined {
    return (this.opts.failSections || []).find((k) => prompt.includes(`SECTION: ${k}`));
  }

  private isContradictionCheck(messages: LLMMessage[]): boolean {
    return messages[0].content.startsWith('You check for direct factual contradictions');
  }

  async structuredCompletion<T>(messages: LLMMessage[]): Promise<T> {
    this.structuredCalls++;
    if (this.isContradictionCheck(messages)) {
      if (this.opts.failContradictionCheck) throw new Error('LLM unavailable');
      return { contradictions: this.opts.contradictions || [] } as unknown as T;
    }
    const detail = this.opts.citationSourceDetail || 'SRC-1';
    const prompt = messages[messages.length - 1].content;
    const failing = this.shouldFail(prompt);
    if (failing) throw new Error(`LLM API error 429: rate limited on ${failing}`);
    // Dispatch on the JSON schema the service actually demands, not on loose
    // keywords — 'baseline' appears in several unrelated section prompts.
    if (prompt.includes('"overallAssessment"')) {
      return {
        tiers: [{
          tier: '1', tierName: 'Regulatory surplus', argument: 'drafted',
          evidenceCited: [], needsEvidence: false,
          citations: [{ claim: 'a claim', source: 'source_document', sourceDetail: detail }],
        }],
        overallAssessment: 'assessed',
      } as unknown as T;
    }
    if (prompt.includes('"formulaApplied"')) {
      return {
        narrative: 'baseline narrative',
        variables: [{ name: 'EF', value: '0.82', citations: [{ claim: 'grid EF', source: 'source_document', sourceDetail: detail }] }],
        formulaApplied: 'ER_y = BE_y - PE_y',
      } as unknown as T;
    }
    return {
      summary: 'a summary',
      fields: { field: 'value' },
      citations: [{ claim: 'a claim', source: 'source_document', sourceDetail: detail }],
    } as unknown as T;
  }

  async chatCompletion(messages: LLMMessage[]): Promise<LLMResult> {
    this.chatCalls++;
    const failing = this.shouldFail(messages[messages.length - 1].content);
    if (failing) throw new Error(`LLM API error 429: rate limited on ${failing}`);
    const detail = this.opts.citationSourceDetail || 'SRC-1';
    return {
      content: `Some narrative prose.\nCITATION | a claim | source_document | ${detail}`,
      model: 'fake', finishReason: 'stop', promptTokens: 0, completionTokens: 0,
    };
  }
}

// ---------------------------------------------------------------------------

interface HarnessOptions {
  methodology?: any;
  status?: string;
  sections?: any[];
  sourceDocs?: any[];
  llm?: FakeLLMService;
  intake?: Record<string, unknown>;
}

function buildHarness(options: HarnessOptions = {}) {
  const methodology = options.methodology || VM0047_CENSUS_BASED;
  const project = {
    _id: PROJECT_ID,
    status: options.status || PROJECT_STATUSES.INPUTS_SUBMITTED,
    methodologyId: 'methodology-1',
    caseDocumentId: CASE_DOC_ID,
    intake: options.intake || { projectArea: 120 },
  };
  const caseDocument = { _id: CASE_DOC_ID, projectId: PROJECT_ID, sections: options.sections || [] };

  const projectRepository = new FakeProjectRepository(project);
  const caseDocumentRepository = new FakeCaseDocumentRepository(caseDocument);
  const sourceDocumentRepository = new FakeSourceDocumentRepository(options.sourceDocs || []);
  const methodologyRepository = new FakeMethodologyRepository(methodology);
  const auditEventRepository = new FakeAuditEventRepository();
  const llm = options.llm || new FakeLLMService();

  const service = new GenerationService(
    projectRepository as any,
    methodologyRepository as any,
    caseDocumentRepository as any,
    sourceDocumentRepository as any,
    auditEventRepository as any,
    llm as any
  );

  return { service, projectRepository, caseDocumentRepository, auditEventRepository, llm, project, caseDocument, methodology };
}

// The order generateAllSections is contractually expected to produce for a
// given methodology: the two customer-named expensive sections first, then
// the methodology's own declared order.
function expectedOrderFor(methodology: any): string[] {
  const declared = methodology.sectionGuidance.map((g: any) => g.section);
  const priority = ['additionality', 'baseline_scenario'].filter((k) => declared.includes(k));
  return [...priority, ...declared.filter((k: string) => !priority.includes(k))];
}

describe('Test GenerationService orchestration', () => {

  describe('generateAllSections section ordering', () => {

    it('generates additionality and baseline_scenario first, then the methodology order (VM0047)', async () => {
      const { service, caseDocumentRepository } = buildHarness();
      await service.generateAllSections(PROJECT_ID, ACTOR);

      expect(caseDocumentRepository.writtenSectionKeys.slice(0, 2))
        .deep.equals(['additionality', 'baseline_scenario']);
      expect(caseDocumentRepository.writtenSectionKeys)
        .deep.equals(expectedOrderFor(VM0047_CENSUS_BASED));
    });

    // The genericity claim at the orchestration layer: identical code path,
    // a structurally different methodology, order follows ITS seed data.
    it('follows the same contract for VMR0017 with no code differences', async () => {
      const { service, caseDocumentRepository } = buildHarness({ methodology: VMR0017_GRID_RENEWABLE });
      await service.generateAllSections(PROJECT_ID, ACTOR);

      expect(caseDocumentRepository.writtenSectionKeys.slice(0, 2))
        .deep.equals(['additionality', 'baseline_scenario']);
      expect(caseDocumentRepository.writtenSectionKeys)
        .deep.equals(expectedOrderFor(VMR0017_GRID_RENEWABLE));
    });

    it('writes every section the methodology declares, and no others', async () => {
      const { service, caseDocumentRepository } = buildHarness();
      await service.generateAllSections(PROJECT_ID, ACTOR);

      const declared = VM0047_CENSUS_BASED.sectionGuidance!.map((g) => g.section);
      expect(caseDocumentRepository.writtenSectionKeys.slice().sort())
        .deep.equals(declared.slice().sort());
    });

  });

  describe('lifecycle transitions', () => {

    it('drives INPUTS_SUBMITTED -> CASE_GENERATING -> CASE_DRAFT_READY', async () => {
      const { service, projectRepository } = buildHarness({ status: PROJECT_STATUSES.INPUTS_SUBMITTED });
      await service.generateAllSections(PROJECT_ID, ACTOR);

      expect(projectRepository.transitions)
        .deep.equals([PROJECT_STATUSES.CASE_GENERATING, PROJECT_STATUSES.CASE_DRAFT_READY]);
      expect(projectRepository.project.status).equals(PROJECT_STATUSES.CASE_DRAFT_READY);
    });

    it('records a STATUS_TRANSITION audit event for the completion transition', async () => {
      const { service, auditEventRepository } = buildHarness();
      await service.generateAllSections(PROJECT_ID, ACTOR);

      const transitionEvents = auditEventRepository.events.filter((e) => e.eventType === 'STATUS_TRANSITION');
      expect(transitionEvents).to.have.lengthOf(1);
      expect(transitionEvents[0].after.status).equals(PROJECT_STATUSES.CASE_DRAFT_READY);
      expect(transitionEvents[0].actorUserId).equals(ACTOR.userId);
    });

    it('refuses to generate from a status that has not reached intake submission', async () => {
      const { service } = buildHarness({ status: PROJECT_STATUSES.METHODOLOGY_SELECTED });
      let error: Error | undefined;
      try { await service.generateAllSections(PROJECT_ID, ACTOR); } catch (e: any) { error = e; }
      expect(error, 'expected generation to be refused').to.exist;
      expect(error!.message).to.match(/Cannot generate case content from project status/);
    });

    it('refuses to generate from a terminal status', async () => {
      const { service } = buildHarness({ status: PROJECT_STATUSES.EXPORTED_FOR_VERIFICATION });
      let error: Error | undefined;
      try { await service.generateAllSections(PROJECT_ID, ACTOR); } catch (e: any) { error = e; }
      expect(error, 'expected generation to be refused').to.exist;
      expect(error!.message).to.match(/Cannot generate case content from project status/);
    });

    // Documents current behaviour rather than an aspiration: a regenerate
    // from CASE_DRAFT_READY is allowed but never re-enters CASE_GENERATING,
    // so it emits no status transition at all.
    it('regenerating from CASE_DRAFT_READY is allowed and emits no status transition', async () => {
      const { service, projectRepository, caseDocumentRepository } = buildHarness({ status: PROJECT_STATUSES.CASE_DRAFT_READY });
      await service.generateAllSections(PROJECT_ID, ACTOR);

      expect(projectRepository.transitions).deep.equals([]);
      expect(projectRepository.project.status).equals(PROJECT_STATUSES.CASE_DRAFT_READY);
      expect(caseDocumentRepository.writtenSectionKeys.length).to.be.greaterThan(0);
    });

  });

  describe('human-finalized sections', () => {

    it('never regenerates a section a human already finalized', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        sections: [
          { key: 'additionality', status: 'finalized', content: { humanApproved: true } },
          { key: 'crediting', status: 'draft_ready', content: {} },
        ],
      });
      await service.generateAllSections(PROJECT_ID, ACTOR);

      expect(caseDocumentRepository.writtenSectionKeys).to.not.include('additionality');
      expect(caseDocumentRepository.writtenSectionKeys).to.include('crediting');
      const additionality = caseDocumentRepository.caseDocument.sections
        .find((s: any) => s.key === 'additionality');
      expect(additionality.content).deep.equals({ humanApproved: true });
      expect(additionality.status).equals('finalized');
    });

    it('still regenerates sections in any non-finalized status', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        sections: [
          { key: 'additionality', status: 'user_edited', content: { stale: true } },
          { key: 'crediting', status: 'draft_ready', content: {} },
        ],
      });
      await service.generateAllSections(PROJECT_ID, ACTOR);

      expect(caseDocumentRepository.writtenSectionKeys).to.include('additionality');
      expect(caseDocumentRepository.writtenSectionKeys).to.include('crediting');
    });

  });

  describe('citation verification', () => {

    const SOURCE_DOCS = [{
      filename: 'grid-connection-spec.pdf',
      extractedText: 'The facility connects at 132kV with a metered export point.',
      linkedSections: [],
      status: 'processed',
    }];

    it('marks a citation verified when it names a source excerpt that was actually supplied', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        sourceDocs: SOURCE_DOCS,
        llm: new FakeLLMService({ citationSourceDetail: 'SRC-1' }),
      });
      await service.generateSection(PROJECT_ID, 'additionality', ACTOR);

      const section = caseDocumentRepository.caseDocument.sections.find((s: any) => s.key === 'additionality');
      expect(section.content.tiers[0].citations[0].verified).equals(true);
    });

    // The anti-hallucination property: a citation naming an excerpt that was
    // never supplied is kept but flagged false, not silently accepted.
    it('marks a citation unverified when it names an excerpt that does not exist', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        sourceDocs: SOURCE_DOCS,
        llm: new FakeLLMService({ citationSourceDetail: 'SRC-99' }),
      });
      await service.generateSection(PROJECT_ID, 'additionality', ACTOR);

      const section = caseDocumentRepository.caseDocument.sections.find((s: any) => s.key === 'additionality');
      const citation = section.content.tiers[0].citations[0];
      expect(citation.verified).equals(false);
      expect(citation.sourceDetail).equals('SRC-99');
    });

    it('counts unverified citations in the audit trail', async () => {
      const { service, auditEventRepository } = buildHarness({
        sourceDocs: SOURCE_DOCS,
        llm: new FakeLLMService({ citationSourceDetail: 'SRC-99' }),
      });
      await service.generateSection(PROJECT_ID, 'additionality', ACTOR);

      const generated = auditEventRepository.events.find((e) => e.eventType === 'SECTION_GENERATED');
      expect(generated.after.unverifiedCitations).equals(1);
    });

  });

  describe('contradiction detection', () => {

    const SOURCE_DOCS = [{
      filename: 'ecological-survey.pdf',
      extractedText: 'Land clearing was observed across the northern parcel during 2024.',
      linkedSections: [],
      status: 'processed',
    }];

    it('attaches detected contradictions to the section as warnings', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        sourceDocs: SOURCE_DOCS,
        intake: { recentSimilarWoodyBiomassRemoved: false },
        llm: new FakeLLMService({ contradictions: ['Intake says no clearing; SRC-1 reports clearing in 2024.'] }),
      });
      await service.generateSection(PROJECT_ID, 'additionality', ACTOR);

      const section = caseDocumentRepository.caseDocument.sections.find((s: any) => s.key === 'additionality');
      expect(section.warnings).to.have.lengthOf(1);
      expect(section.warnings[0]).to.match(/clearing/);
    });

    // Contradiction detection is a quality bonus, not a gate — an outage in
    // that one extra call must never cost the user their generation.
    it('still generates the section when contradiction detection fails', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        sourceDocs: SOURCE_DOCS,
        llm: new FakeLLMService({ failContradictionCheck: true }),
      });
      await service.generateSection(PROJECT_ID, 'additionality', ACTOR);

      const section = caseDocumentRepository.caseDocument.sections.find((s: any) => s.key === 'additionality');
      expect(section.status).equals('draft_ready');
      expect(section.warnings).deep.equals([]);
    });

    it('skips the contradiction call entirely when no source documents were uploaded', async () => {
      const llm = new FakeLLMService();
      const { service } = buildHarness({ sourceDocs: [], llm });
      await service.generateSection(PROJECT_ID, 'additionality', ACTOR);

      // One structured call for the section itself, none for contradictions.
      expect(llm.structuredCalls).equals(1);
    });

  });

  describe('partial failure and resume', () => {

    // The scenario that motivated all of this: a rate limit part-way through a
    // ten-section run. Previously the whole call threw, the project was left in
    // CASE_GENERATING with no record of why, and a retry re-billed every
    // section that had already succeeded.
    it('completes the remaining sections when one fails', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        llm: new FakeLLMService({ failSections: ['crediting'] }),
      });
      await service.generateAllSections(PROJECT_ID, ACTOR);

      const declared = VM0047_CENSUS_BASED.sectionGuidance!.map((g) => g.section);
      const written = caseDocumentRepository.writtenSectionKeys;
      expect(written).to.include('crediting');
      declared.filter((k) => k !== 'crediting').forEach((k) => {
        expect(written, `${k} should still have been generated`).to.include(k);
      });
    });

    it('does not claim the case is ready when a section failed', async () => {
      const { service, projectRepository } = buildHarness({
        llm: new FakeLLMService({ failSections: ['crediting'] }),
      });
      await service.generateAllSections(PROJECT_ID, ACTOR);

      expect(projectRepository.transitions).deep.equals([PROJECT_STATUSES.CASE_GENERATING]);
      expect(projectRepository.project.status).equals(PROJECT_STATUSES.CASE_GENERATING);
    });

    it('records the failure on the section rather than only in a log', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        llm: new FakeLLMService({ failSections: ['crediting'] }),
      });
      await service.generateAllSections(PROJECT_ID, ACTOR);

      const section = caseDocumentRepository.caseDocument.sections.find((s: any) => s.key === 'crediting');
      expect(section.status).equals('generation_failed');
      expect(section.lastError).to.match(/429/);
    });

    it('keeps an existing draft intact when a regeneration fails', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        sections: [{ key: 'crediting', status: 'draft_ready', content: { summary: 'earlier good draft' } }],
        llm: new FakeLLMService({ failSections: ['crediting'] }),
      });
      await service.generateAllSections(PROJECT_ID, ACTOR);

      const section = caseDocumentRepository.caseDocument.sections.find((s: any) => s.key === 'crediting');
      expect(section.content).deep.equals({ summary: 'earlier good draft' });
      expect(section.status).equals('draft_ready');
      expect(section.lastError, 'the failure is still recorded').to.match(/429/);
    });

    it('reports which sections failed in the audit trail', async () => {
      const { service, auditEventRepository } = buildHarness({
        llm: new FakeLLMService({ failSections: ['crediting', 'monitoring'] }),
      });
      await service.generateAllSections(PROJECT_ID, ACTOR);

      const incomplete = auditEventRepository.events.find((e) => e.eventType === 'GENERATION_INCOMPLETE');
      expect(incomplete, 'expected a GENERATION_INCOMPLETE event').to.exist;
      expect(incomplete.after.failedSections).to.have.members(['crediting', 'monitoring']);
      expect(incomplete.after.failedCount).equals(2);
      expect(incomplete.after.generatedCount).equals(VM0047_CENSUS_BASED.sectionGuidance!.length - 2);
      expect(auditEventRepository.events.filter((e) => e.eventType === 'SECTION_GENERATION_FAILED')).to.have.lengthOf(2);
    });

    it('resuming regenerates only what is still missing', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        sections: [
          { key: 'additionality', status: 'draft_ready', content: { tiers: [] } },
          { key: 'crediting', status: 'generation_failed', lastError: 'LLM API error 429' },
        ],
      });
      await service.generateAllSections(PROJECT_ID, ACTOR, { onlyMissing: true });

      const written = caseDocumentRepository.writtenSectionKeys;
      expect(written, 'already-drafted section should be left alone').to.not.include('additionality');
      expect(written, 'failed section should be retried').to.include('crediting');
    });

    it('a successful retry clears the recorded failure', async () => {
      const { service, caseDocumentRepository } = buildHarness({
        sections: [{ key: 'crediting', status: 'generation_failed', lastError: 'LLM API error 429' }],
      });
      await service.generateAllSections(PROJECT_ID, ACTOR, { onlyMissing: true });

      const section = caseDocumentRepository.caseDocument.sections.find((s: any) => s.key === 'crediting');
      expect(section.status).equals('draft_ready');
      expect(section.lastError).equals(null);
    });

    it('still reaches CASE_DRAFT_READY once the resume run succeeds', async () => {
      const { service, projectRepository } = buildHarness({
        sections: [{ key: 'crediting', status: 'generation_failed', lastError: 'boom' }],
      });
      await service.generateAllSections(PROJECT_ID, ACTOR, { onlyMissing: true });

      expect(projectRepository.project.status).equals(PROJECT_STATUSES.CASE_DRAFT_READY);
    });

  });

  describe('refineSection guards', () => {

    it('refuses to refine a structured section', async () => {
      const { service } = buildHarness({ status: PROJECT_STATUSES.CASE_DRAFT_READY });
      let error: Error | undefined;
      try { await service.refineSection(PROJECT_ID, 'quantification', 'tighten this', ACTOR); } catch (e: any) { error = e; }
      expect(error, 'expected refine to be refused').to.exist;
      expect(error!.message).to.match(/regenerate it instead of refining/);
    });

    // baseline_scenario is declared 'narrative' in seed guidance but is
    // generated through the fixed-shape baseline branch, so its stored content
    // is {narrative, variables, formulaApplied}. Refining it as free narrative
    // would silently drop the variables and formula a reviewer needs.
    it('refuses to refine a fixed-shape section even when guidance calls it narrative', async () => {
      const { service, methodology } = buildHarness({ status: PROJECT_STATUSES.CASE_DRAFT_READY });
      const baselineGuidance = methodology.sectionGuidance.find((g: any) => g.section === 'baseline_scenario');
      expect(baselineGuidance.contentType, 'precondition: seed declares baseline narrative').equals('narrative');

      let error: Error | undefined;
      try { await service.refineSection(PROJECT_ID, 'baseline_scenario', 'tighten this', ACTOR); } catch (e: any) { error = e; }
      expect(error, 'expected refine to be refused').to.exist;
      expect(error!.message).to.match(/regenerate it instead of refining/);
    });

    it('allows refining a genuinely narrative section', async () => {
      const { service, caseDocumentRepository } = buildHarness({ status: PROJECT_STATUSES.CASE_DRAFT_READY });
      await service.refineSection(PROJECT_ID, 'project_description', 'shorten it', ACTOR);

      const section = caseDocumentRepository.caseDocument.sections.find((s: any) => s.key === 'project_description');
      expect(section.status).equals('draft_ready');
      expect(section.content.text).to.be.a('string');
    });

  });

});
