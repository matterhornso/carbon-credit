// Pins the adversarial pre-validation pass and the Finding aggregate.
//
// The LLM is faked, so these run with no network and no API key. What is NOT
// faked is the methodology or the registry resolution: the prompt tests import
// the real seeded VM0047 document, so a regression that stops feeding the
// methodology's own applicability conditions to the reviewer fails here rather
// than silently producing a politer auditor.
//
// The property under test is not "it produces findings". It is that a finding
// which enters the series is one that can be acted on and counted: quoted from
// real content, validly categorised, attached to the section that produced it,
// and not duplicated by pressing the button twice.

import { expect } from 'chai';
import { PreValidationService } from '../../application/usecases/prevalidation/PreValidationService';
import { buildPreValidationPrompt, parseFindings } from '../../application/usecases/prevalidation/PreValidationPrompt';
import { CreateFinding } from '../finding/CreateFinding';
import { FINDING_SEVERITIES, FINDING_CATEGORIES, FINDING_ORIGINS, FINDING_STATUSES } from '../finding/findingInterface';
import { LLMService, LLMMessage } from '../../interfaces/services/LLM.service';
import { VM0047_CENSUS_BASED } from '../../infrastructure/database/seed/methodology.seed';

const ACTOR = { userId: 'user-1', role: 'ISSUER' };
const PROJECT_ID = 'project-1';

// ---------------------------------------------------------------------------
// Fakes
// ---------------------------------------------------------------------------

class FakeFindingRepository {
  public rows: any[] = [];
  public replaceCalls: { projectId: string; sectionKey: string; count: number }[] = [];

  async createFinding(f: any) { this.rows.push(f); return f; }

  // Mirrors the real static: replaces open self-review rows for the section,
  // leaving every other origin and status alone.
  async replaceOpenSelfReviewFindings(projectId: string, sectionKey: string, findings: any[]) {
    this.replaceCalls.push({ projectId, sectionKey, count: findings.length });
    this.rows = this.rows.filter((r) => !(
      r.projectId === projectId &&
      r.sectionKey === sectionKey &&
      r.origin === FINDING_ORIGINS.SELF_REVIEW &&
      r.status === FINDING_STATUSES.OPEN
    ));
    this.rows.push(...findings);
    return findings;
  }

  async getFindingsByProjectId(projectId: string) { return this.rows.filter((r) => r.projectId === projectId); }
  async getFindingStatsByMethodology() { return []; }
  async updateFindingStatus(id: string, status: string, resolutionNote?: string) {
    const row = this.rows.find((r) => r._id === id);
    if (row) { row.status = status; row.resolutionNote = resolutionNote; }
    return row || null;
  }
}

class FakeProjectRepository {
  constructor(public project: any) {}
  async getProjectById() { return this.project; }
  async createProject(): Promise<any> { throw new Error('not used'); }
  async updateProject(): Promise<any> { throw new Error('not used'); }
  async transitionStatus(): Promise<any> { throw new Error('not used'); }
  async setCaseDocumentId(): Promise<any> { throw new Error('not used'); }
  async addAttachment(): Promise<any> { throw new Error('not used'); }
  async getAllProjects(): Promise<any> { throw new Error('not used'); }
}

class FakeMethodologyRepository {
  constructor(public methodology: any) {}
  async getMethodologyById() { return this.methodology; }
  async createMethodology(): Promise<any> { throw new Error('not used'); }
  async getAllMethodologies(): Promise<any> { throw new Error('not used'); }
  async getMethodologyByCode(): Promise<any> { throw new Error('not used'); }
}

class FakeCaseDocumentRepository {
  constructor(public caseDocument: any) {}
  async getCaseDocumentByProjectId() { return this.caseDocument; }
  async createCaseDocument(): Promise<any> { throw new Error('not used'); }
  async updateSection(): Promise<any> { throw new Error('not used'); }
}

class FakeAuditEventRepository {
  public events: any[] = [];
  async createAuditEvent(e: any) { this.events.push(e); return e; }
  async getEventsByProjectId() { return this.events; }
}

class FakeLLM {
  public calls: LLMMessage[][] = [];
  constructor(private responder: (messages: LLMMessage[]) => any) {}
  async structuredCompletion<T>(messages: LLMMessage[]): Promise<T> {
    this.calls.push(messages);
    const out = this.responder(messages);
    if (out instanceof Error) throw out;
    return out as T;
  }
  async chatCompletion(): Promise<any> { throw new Error('not used'); }
}

const finding = (over: any = {}) => ({
  claim: 'The project area is 1,200 hectares.',
  issue: 'No source is cited for the area figure.',
  remediation: 'Cite the land title or survey establishing the area.',
  severity: FINDING_SEVERITIES.MATERIAL,
  category: FINDING_CATEGORIES.UNSUPPORTED_CLAIM,
  ...over,
});

function buildHarness(options: {
  sections?: any[];
  responder?: (messages: LLMMessage[]) => any;
} = {}) {
  const sections = options.sections || [
    { key: 'additionality', status: 'draft_ready', content: { text: 'The project area is 1,200 hectares.' } },
  ];
  const project: any = { _id: PROJECT_ID, intake: { projectArea: 1200 }, methodologyId: VM0047_CENSUS_BASED };
  const findingRepository = new FakeFindingRepository();
  const auditEventRepository = new FakeAuditEventRepository();
  const llm = new FakeLLM(options.responder || (() => ({ findings: [finding()] })));

  const service = new PreValidationService(
    new FakeProjectRepository(project) as any,
    new FakeMethodologyRepository(VM0047_CENSUS_BASED) as any,
    new FakeCaseDocumentRepository({ _id: 'case-1', projectId: PROJECT_ID, sections }) as any,
    findingRepository as any,
    auditEventRepository as any,
    llm as unknown as LLMService
  );

  return { service, findingRepository, auditEventRepository, llm };
}

// ---------------------------------------------------------------------------

describe('Test the Finding aggregate', () => {

  it('sets the supplied fields and defaults status to open', () => {
    const f = new CreateFinding({
      projectId: 'p1', sectionKey: 'additionality', claim: 'c', issue: 'i',
      severity: FINDING_SEVERITIES.BLOCKING, category: FINDING_CATEGORIES.EVIDENCE_GAP,
      origin: FINDING_ORIGINS.SELF_REVIEW,
    });
    expect(f.status).to.equal(FINDING_STATUSES.OPEN);
    expect(f.severity).to.equal('blocking');
  });

  it('refuses a finding with no claim', () => {
    // "The additionality section is weak" is a complaint, not a finding: with
    // no quoted claim nobody can find the sentence to fix.
    expect(() => new CreateFinding({
      projectId: 'p1', sectionKey: 'additionality', issue: 'weak',
      severity: FINDING_SEVERITIES.MATERIAL, category: FINDING_CATEGORIES.UNSUPPORTED_CLAIM,
      origin: FINDING_ORIGINS.SELF_REVIEW,
    })).to.throw(/claim missing/);
  });

  it('refuses an unknown severity or category rather than defaulting', () => {
    // Defaulting would let a malformed model response become a uniform pile of
    // rows and the series would measure the default, not the case.
    const base: any = {
      projectId: 'p1', sectionKey: 'additionality', claim: 'c', issue: 'i',
      origin: FINDING_ORIGINS.SELF_REVIEW, category: FINDING_CATEGORIES.UNSUPPORTED_CLAIM,
    };
    expect(() => new CreateFinding({ ...base, severity: 'sort-of-bad' })).to.throw(/severity must be one of/);
    expect(() => new CreateFinding({ ...base, severity: FINDING_SEVERITIES.MATERIAL, category: 'vibes' })).to.throw(/category must be one of/);
  });
});

describe('Test pre-validation finding parsing', () => {

  const ctx = { projectId: 'p1', sectionKey: 'additionality', methodologyCode: 'VM0047' };

  it('drops a malformed finding instead of coercing it', () => {
    // Distinct claims on purpose: with the same claim, deduplication would drop
    // the malformed one and this test would pass even if severity were being
    // silently coerced. It has to fail for the reason it names.
    const { findings: parsed, dropped } = parseFindings({ findings: [
      finding({ claim: 'Claim one.' }),
      finding({ claim: 'Claim two.', severity: 'catastrophic' }),
      finding({ claim: 'Claim three.', category: 'vibes' }),
      finding({ claim: '' }),
    ] } as any, ctx);

    expect(parsed).to.have.length(1);
    expect(parsed[0].claim).to.equal('Claim one.');
    // The drop is reported, not swallowed. A model emitting an unmappable
    // severity on every finding must not read as a case with nothing wrong.
    expect(dropped).to.have.length(3);
    expect(dropped[0].reason).to.match(/severity must be one of/);
  });

  it('normalises case, padding and hyphens in severity and category', () => {
    // Formatting, not meaning. Dropping a blocking finding because the model
    // wrote "Blocking" loses the most serious thing the pass found — this was
    // a real gap, caught by running the pass against an actual model.
    const { findings: parsed, dropped } = parseFindings({ findings: [
      finding({ claim: 'A.', severity: 'Blocking', category: 'Methodology_Deviation' }),
      finding({ claim: 'B.', severity: ' material ', category: 'evidence-gap' }),
    ] } as any, ctx);

    expect(dropped).to.have.length(0);
    expect(parsed.map((f) => f.severity)).to.deep.equal(['blocking', 'material']);
    expect(parsed.map((f) => f.category)).to.deep.equal(['methodology_deviation', 'evidence_gap']);
  });

  it('still refuses a foreign severity vocabulary rather than guessing at it', () => {
    // "critical" is not a formatting variant of "blocking" — mapping it would
    // be inventing a judgement the model did not make.
    const { findings: parsed, dropped } = parseFindings(
      { findings: [finding({ severity: 'critical' })] } as any, ctx);
    expect(parsed).to.have.length(0);
    expect(dropped).to.have.length(1);
  });

  it('accepts the findings array under a different key or bare', () => {
    // The schema asks for {"findings": [...]}; models occasionally answer with
    // a bare array or their own key. The contents still have to validate.
    expect(parseFindings([finding()] as any, ctx).findings).to.have.length(1);
    expect(parseFindings({ results: [finding()] } as any, ctx).findings).to.have.length(1);
  });

  it('deduplicates findings that repeat the same claim and issue', () => {
    const { findings: parsed } = parseFindings({ findings: [finding(), finding()] } as any, ctx);
    expect(parsed).to.have.length(1);
  });

  it('returns an empty list for a malformed or empty response rather than throwing', () => {
    expect(parseFindings({ findings: [] } as any, ctx).findings).to.deep.equal([]);
    expect(parseFindings(null, ctx).findings).to.deep.equal([]);
    expect(parseFindings({} as any, ctx).findings).to.deep.equal([]);
    expect(parseFindings({ findings: 'nope' } as any, ctx).findings).to.deep.equal([]);
  });

  it('stamps every parsed finding as self-review and carries the methodology code', () => {
    // origin is what later makes "did the VVB agree with us" answerable, and
    // methodologyCode is what lets the series be grouped without a join.
    const { findings: parsed } = parseFindings({ findings: [finding()] } as any, ctx);
    expect(parsed[0].origin).to.equal(FINDING_ORIGINS.SELF_REVIEW);
    expect(parsed[0].methodologyCode).to.equal('VM0047');
    expect(parsed[0].sectionKey).to.equal('additionality');
  });
});

describe('Test the pre-validation prompt', () => {

  const section: any = { key: 'additionality', status: 'draft_ready', content: { text: 'Adoption is below 15%.' } };

  it('instructs the model to quote the claim verbatim', () => {
    const messages = buildPreValidationPrompt({
      methodology: VM0047_CENSUS_BASED, project: { intake: {} } as any, section, otherSections: [],
    });
    const system = messages.find((m) => m.role === 'system')!.content;
    expect(system).to.include('verbatim');
  });

  it('tells the model an empty findings list is an acceptable answer', () => {
    // Without this the pass produces encouragement-shaped findings on a sound
    // section, and the series fills with noise.
    const messages = buildPreValidationPrompt({
      methodology: VM0047_CENSUS_BASED, project: { intake: {} } as any, section, otherSections: [],
    });
    const system = messages.find((m) => m.role === 'system')!.content;
    expect(system).to.include('empty findings array');
  });

  it('feeds the methodology its own applicability conditions', () => {
    const messages = buildPreValidationPrompt({
      methodology: VM0047_CENSUS_BASED, project: { intake: {} } as any, section, otherSections: [],
    });
    const user = messages.find((m) => m.role === 'user')!.content;
    expect(user).to.include('APPLICABILITY CONDITIONS');
    // A real condition from the real seed, so this fails if the wiring breaks.
    expect(user).to.include('pre_existing_woody_biomass');
  });

  it('includes the other sections so cross-section contradictions are visible', () => {
    // The finding class the per-section generator structurally cannot catch.
    const messages = buildPreValidationPrompt({
      methodology: VM0047_CENSUS_BASED, project: { intake: {} } as any, section,
      otherSections: [{ key: 'quantification', status: 'draft_ready', content: { summary: 'Area is 900 ha.' } } as any],
    });
    const user = messages.find((m) => m.role === 'user')!.content;
    expect(user).to.include('OTHER SECTIONS');
    expect(user).to.include('Area is 900 ha.');
  });

  it('tells the model not to assert contradictions when no other section is drafted', () => {
    const messages = buildPreValidationPrompt({
      methodology: VM0047_CENSUS_BASED, project: { intake: {} } as any, section, otherSections: [],
    });
    const user = messages.find((m) => m.role === 'user')!.content;
    expect(user).to.include('do not raise findings that assert a contradiction you have not seen');
  });
});

describe('Test PreValidationService orchestration', () => {

  it('reviews only sections that have content to attack', async () => {
    // Reviewing a not_started section invites the model to invent a finding
    // about content that does not exist — a hallucination we would have asked
    // for.
    const { service, llm } = buildHarness({
      sections: [
        { key: 'additionality', status: 'draft_ready', content: { text: 'x' } },
        { key: 'monitoring', status: 'not_started' },
        { key: 'baseline_scenario', status: 'finalized', content: { narrative: 'y' } },
      ],
    });
    const result = await service.reviewCase(PROJECT_ID, ACTOR);

    expect(result.reviewed.sort()).to.deep.equal(['additionality', 'baseline_scenario']);
    expect(result.skipped).to.deep.equal(['monitoring']);
    expect(llm.calls).to.have.length(2);
  });

  it('keeps the findings from sections that succeeded when one section fails', async () => {
    // A partial findings list is useful; an exception is not.
    let call = 0;
    const { service } = buildHarness({
      sections: [
        { key: 'additionality', status: 'draft_ready', content: { text: 'x' } },
        { key: 'baseline_scenario', status: 'draft_ready', content: { text: 'y' } },
      ],
      responder: () => (++call === 1 ? new Error('model overloaded') : { findings: [finding()] }),
    });
    const result = await service.reviewCase(PROJECT_ID, ACTOR);

    expect(result.failedSections).to.have.length(1);
    expect(result.failedSections[0].sectionKey).to.equal('additionality');
    expect(result.reviewed).to.deep.equal(['baseline_scenario']);
    expect(result.findings).to.have.length(1);
  });

  it('replaces its own open findings on re-review instead of accumulating them', async () => {
    const { service, findingRepository } = buildHarness();

    await service.reviewCase(PROJECT_ID, ACTOR);
    await service.reviewCase(PROJECT_ID, ACTOR);

    // Two passes, one finding — not two. Otherwise the series measures how
    // often someone pressed the button.
    expect(findingRepository.rows).to.have.length(1);
    expect(findingRepository.replaceCalls).to.have.length(2);
  });

  it('never discards a finding a human has acted on, or one a VVB raised', async () => {
    const { service, findingRepository } = buildHarness();
    findingRepository.rows.push(
      { _id: 'vvb-1', projectId: PROJECT_ID, sectionKey: 'additionality', origin: FINDING_ORIGINS.VVB, status: FINDING_STATUSES.OPEN },
      { _id: 'acc-1', projectId: PROJECT_ID, sectionKey: 'additionality', origin: FINDING_ORIGINS.SELF_REVIEW, status: FINDING_STATUSES.ACCEPTED },
    );

    await service.reviewCase(PROJECT_ID, ACTOR);

    const ids = findingRepository.rows.map((r) => r._id).filter(Boolean);
    expect(ids).to.include('vvb-1');   // evidence about the outside world
    expect(ids).to.include('acc-1');   // a decision someone made
  });

  it('records an audit event carrying the blocking count', async () => {
    const { service, auditEventRepository } = buildHarness({
      responder: () => ({ findings: [finding({ severity: FINDING_SEVERITIES.BLOCKING }), finding({ claim: 'other', severity: FINDING_SEVERITIES.ADVISORY })] }),
    });
    await service.reviewCase(PROJECT_ID, ACTOR);

    const event = auditEventRepository.events.find((e) => e.eventType === 'PRE_VALIDATION_COMPLETED');
    expect(event).to.not.equal(undefined);
    expect(event.after.findings).to.equal(2);
    expect(event.after.blocking).to.equal(1);
  });

  it('produces no findings, and does not fail, for a section the reviewer passes', async () => {
    const { service, findingRepository } = buildHarness({ responder: () => ({ findings: [] }) });
    const result = await service.reviewCase(PROJECT_ID, ACTOR);

    expect(result.reviewed).to.deep.equal(['additionality']);
    expect(result.findings).to.deep.equal([]);
    expect(findingRepository.rows).to.deep.equal([]);
  });

  it('requires a reason to reject a finding, but not to accept one', async () => {
    // Rejecting is the judgement that has to be defensible later; accepting
    // carries its own evidence in the fix that follows.
    const { service } = buildHarness();
    let threw = false;
    try { await service.resolveFinding('f1', FINDING_STATUSES.REJECTED, undefined, PROJECT_ID, ACTOR); }
    catch (e: any) { threw = /requires a resolutionNote/.test(e.message); }
    expect(threw).to.equal(true);

    await service.resolveFinding('f1', FINDING_STATUSES.ACCEPTED, undefined, PROJECT_ID, ACTOR);
  });

  it('rejects an unknown status', async () => {
    const { service } = buildHarness();
    let threw = false;
    try { await service.resolveFinding('f1', 'probably_fine', undefined, PROJECT_ID, ACTOR); }
    catch (e: any) { threw = /status must be one of/.test(e.message); }
    expect(threw).to.equal(true);
  });
});
