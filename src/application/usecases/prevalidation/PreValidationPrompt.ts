import { LLMMessage } from "../../../interfaces/services/LLM.service";
import { IMethodologyInterface, ISectionGuidance } from "../../../domain/methodology/methodologyInterface";
import { IProjectInterface } from "../../../domain/project/projectInterface";
import { ICaseSection } from "../../../domain/case_document/caseDocumentInterface";
import { CreateFinding } from "../../../domain/finding/CreateFinding";
import { FINDING_SEVERITIES, FINDING_CATEGORIES, FINDING_ORIGINS } from "../../../domain/finding/findingInterface";

/**
 * Pure prompt assembly for the adversarial pass. No I/O, so the reviewer's
 * stance is unit-testable without a model.
 */

export interface IRawFinding {
  claim?: string;
  issue?: string;
  remediation?: string;
  severity?: string;
  category?: string;
}

const SEVERITY_LIST = Object.values(FINDING_SEVERITIES).join(' | ');
const CATEGORY_LIST = Object.values(FINDING_CATEGORIES).join(' | ');

/**
 * The stance. Written as instructions to a validator rather than to an
 * assistant, because the failure mode of this pass is politeness: a model asked
 * to "review" a document it was not asked to attack produces encouragement.
 */
const VALIDATOR_SYSTEM_PROMPT = `You are a validation/verification body (VVB) auditor reviewing a section of a carbon project's Project Design Document before it is submitted to a registry. You are not the author's colleague. Your job is to find what you would raise as a finding, not to summarise or praise.

How a real auditor reads:
1. Every number, date, percentage and rate is checked for a source. A figure with no traceable origin is a finding, however plausible it looks.
2. Claims are checked against the methodology's own conditions. A section that asserts something the methodology does not permit is a finding even if the assertion is internally coherent.
3. Sections are read against each other. A figure in one section that contradicts the same figure in another is one of the most common real findings, and the author almost never sees it.
4. "Evidence will be provided" is not evidence. A commitment to supply something later is a finding now.
5. Absence is checked as well as presence: if the registry or methodology requires something this section does not address, that omission is a finding.

Discipline, non-negotiable:
- Quote the claim verbatim from the section. Do not paraphrase it. The author has to be able to find the sentence.
- Raise a finding only about content actually present in, or required of, this section. Do not invent content in order to fault it.
- If the section is genuinely sound, return an empty findings array. An auditor who always finds something is as useless as one who never does.
- Do not raise the same underlying issue twice in different words.`;

function formatSection(section: ICaseSection): string {
  const content = section.content;
  if (content === undefined || content === null) return '(no content)';
  return typeof content === 'string' ? content : JSON.stringify(content, null, 2);
}

/**
 * Other sections, trimmed. A validator reads the whole document, and
 * cross-section contradiction is the finding class the per-section generator
 * structurally cannot catch — but sending every section in full would make this
 * the most expensive call in the platform, so each is capped.
 */
const CROSS_SECTION_CHARS = 1500;

function formatOtherSections(sections: ICaseSection[]): string {
  const withContent = sections.filter((s) => s.content !== undefined && s.content !== null);
  if (withContent.length === 0) {
    return 'OTHER SECTIONS: none drafted yet. You cannot check cross-section consistency on this pass; do not raise findings that assert a contradiction you have not seen.';
  }
  const blocks = withContent.map((s) => {
    const body = formatSection(s);
    const clipped = body.length > CROSS_SECTION_CHARS ? body.slice(0, CROSS_SECTION_CHARS) + '\n…(truncated)' : body;
    return `[${s.key}]\n${clipped}`;
  });
  return `OTHER SECTIONS OF THIS CASE (for cross-checking figures and claims; truncated):\n\n${blocks.join('\n\n')}`;
}

function formatIntake(project: IProjectInterface): string {
  const intake = project.intake || {};
  const keys = Object.keys(intake);
  if (keys.length === 0) return 'PROJECT INTAKE DATA: none submitted.';
  return `PROJECT INTAKE DATA (the authoritative source for project facts):\n${keys.map((k) => `- ${k}: ${JSON.stringify(intake[k])}`).join('\n')}`;
}

function formatApplicability(methodology: IMethodologyInterface): string {
  const conditions = methodology.applicabilityConditions || [];
  if (conditions.length === 0) return '';
  return `METHODOLOGY APPLICABILITY CONDITIONS (a claim conflicting with any of these is a finding):\n${
    conditions.map((c) => `- ${c.key}: ${c.statement}`).join('\n')
  }`;
}

export function buildPreValidationPrompt(input: {
  methodology: IMethodologyInterface;
  project: IProjectInterface;
  section: ICaseSection;
  guidance?: ISectionGuidance;
  otherSections: ICaseSection[];
}): LLMMessage[] {
  const { methodology, project, section, guidance, otherSections } = input;

  const schema = `Respond with ONLY a JSON object of this exact shape (no markdown fence, no commentary):
{
  "findings": [
    {
      "claim": "<the exact sentence or figure from the section under review, quoted verbatim>",
      "issue": "<what a VVB would object to, in one or two sentences>",
      "remediation": "<what would resolve it - be specific about what evidence or change is needed>",
      "severity": "${SEVERITY_LIST}",
      "category": "${CATEGORY_LIST}"
    }
  ]
}

severity:
- blocking: the case could not be submitted as it stands
- material: submittable, but a VVB would very likely raise it and cost a round trip
- advisory: would strengthen the case; not a likely finding

Return {"findings": []} if you would raise nothing.`;

  const userContent = [
    `METHODOLOGY: ${methodology.title} (${methodology.code} v${methodology.version}).`,
    formatApplicability(methodology),
    guidance?.promptFragment ? `WHAT THIS SECTION WAS REQUIRED TO CONTAIN:\n${guidance.promptFragment}` : '',
    formatIntake(project),
    `SECTION UNDER REVIEW — "${section.key}" (status: ${section.status}):\n\n${formatSection(section)}`,
    formatOtherSections(otherSections),
    schema,
  ].filter(Boolean).join('\n\n');

  return [
    { role: 'system', content: VALIDATOR_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

export interface IDroppedFinding {
  claim: string;
  reason: string;
}

export interface IParsedFindings {
  findings: CreateFinding[];
  dropped: IDroppedFinding[];
}

/**
 * Severity and category arrive as free text. Case, padding and hyphen-vs-
 * underscore are formatting, not meaning: "Blocking" is the same severity as
 * "blocking", and a model that capitalises its enums is not expressing
 * uncertainty. Normalising those is not coercion.
 *
 * Mapping a model's own vocabulary ("high", "critical", "P1") onto ours would
 * be, so that is left to fail — see parseFindings.
 */
function normalizeEnum(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, '_');
  return normalized || undefined;
}

/**
 * Turn the model's response into validated findings.
 *
 * Anything malformed is dropped rather than coerced. A finding with a
 * guessed-at severity is worse than no finding: it enters the series as a real
 * data point and quietly shifts the statistics the whole aggregate exists to
 * produce. CreateFinding does the validating, so the rules live in one place.
 *
 * But a drop is never silent. The original version returned only the survivors,
 * so a model that emitted "severity": "critical" on every finding produced a
 * clean, empty review — a project appeared to pass pre-validation precisely
 * because the parser had thrown its objections away. Dropped findings are
 * returned alongside, and the caller records the count.
 *
 * The findings key is tolerated in a few shapes because the schema asks for one
 * and models occasionally supply another; the contents still have to validate.
 */
function extractCandidates(raw: any): IRawFinding[] | null {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return null;
  for (const key of ['findings', 'results', 'issues']) {
    if (Array.isArray(raw[key])) return raw[key];
  }
  return null;
}

export function parseFindings(
  raw: { findings?: IRawFinding[] } | IRawFinding[] | null | undefined,
  context: { projectId: string; sectionKey: string; methodologyCode?: string; raisedByUserId?: string }
): IParsedFindings {
  const candidates = extractCandidates(raw);
  if (!candidates) return { findings: [], dropped: [] };

  const findings: CreateFinding[] = [];
  const dropped: IDroppedFinding[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    // Deduplicate on claim+issue: the instruction not to repeat itself is not
    // a guarantee, and a duplicated finding double-counts in the series.
    const fingerprint = `${(candidate?.claim || '').trim()}::${(candidate?.issue || '').trim()}`;
    if (seen.has(fingerprint)) continue;

    try {
      findings.push(new CreateFinding({
        projectId: context.projectId,
        sectionKey: context.sectionKey,
        claim: candidate?.claim,
        issue: candidate?.issue,
        remediation: candidate?.remediation,
        severity: normalizeEnum(candidate?.severity),
        category: normalizeEnum(candidate?.category),
        origin: FINDING_ORIGINS.SELF_REVIEW,
        methodologyCode: context.methodologyCode,
        raisedByUserId: context.raisedByUserId,
      }));
      seen.add(fingerprint);
    } catch (error: any) {
      // Dropped on purpose — but counted, so a systematically malformed model
      // shows up as a parse problem rather than as a clean case.
      dropped.push({
        claim: String(candidate?.claim || '(no claim)').slice(0, 200),
        reason: error?.message || String(error),
      });
    }
  }

  return { findings, dropped };
}
