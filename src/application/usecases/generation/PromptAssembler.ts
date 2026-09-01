// Pure prompt-assembly functions — no I/O, no LLM calls. Given a
// methodology, a project, and the source excerpts relevant to a section,
// build the exact messages to send. Kept separate from GenerationService so
// the prompt logic itself is unit-testable without mocking Mongo or the LLM.

import { LLMMessage } from "../../../interfaces/services/LLM.service";
import { IMethodologyInterface, IAdditionalityTier, IBaselineFormula, ISectionGuidance } from "../../../domain/methodology/methodologyInterface";
import { IProjectInterface } from "../../../domain/project/projectInterface";
import { ISourceDocumentInterface } from "../../../domain/source_document/sourceDocumentInterface";
import { ISourceExcerpt, IGeneratedCitation } from "./generationTypes";

// Cap per-excerpt length so a handful of large uploads don't blow the
// context budget; the model is told excerpts are truncated so it doesn't
// treat a cut sentence as the whole source.
const MAX_EXCERPT_CHARS = 4000;

const RIGOR_SYSTEM_PROMPT = `You are drafting content for a carbon credit Project Design Document (PDD) case, prepared by a professional carbon project developer for eventual third-party validation (a VVB).

Rules, non-negotiable:
1. Every factual claim, number, or assertion must be traceable to one of: (a) the project's structured intake data given below, (b) an excerpt from an uploaded source document (cite it by its exact excerpt ID, e.g. "SRC-2"), or (c) the methodology's own reference material (cite it as "methodology_reference"). If you cannot support a claim this way, say explicitly that evidence is needed instead of asserting it.
2. Never invent data: dates, percentages, survey results, financial figures, or regulatory citations that were not supplied to you. A plausible-sounding number with no source is worse than an honest gap.
3. Write for a technical reviewer, not a general audience — assume familiarity with carbon markets and the methodology's own terminology.
4. If the methodology's section guidance below tells you NOT to assert something without a source, follow that instruction exactly, even if it leaves the section incomplete.
5. When citing an uploaded source document, the citation's sourceDetail must be exactly the excerpt ID as given (e.g. "SRC-1"), nothing else — no paraphrasing the filename.`;

export function buildSourceExcerpts(
  sourceDocuments: ISourceDocumentInterface[],
  sectionKey: string
): ISourceExcerpt[] {
  const relevant = (sourceDocuments || []).filter((doc) => {
    if (!doc.extractedText) return false;
    if (!doc.linkedSections || doc.linkedSections.length === 0) return true; // unlinked = general-purpose
    return doc.linkedSections.includes(sectionKey);
  });
  return relevant.map((doc, index) => ({
    id: `SRC-${index + 1}`,
    filename: doc.filename || `document-${index + 1}`,
    excerpt: (doc.extractedText || '').slice(0, MAX_EXCERPT_CHARS),
  }));
}

function formatExcerptsBlock(excerpts: ISourceExcerpt[]): string {
  if (excerpts.length === 0) {
    return 'UPLOADED SOURCE DOCUMENTS: none supplied for this section. Any claim that would normally need a document citation must instead be flagged as needing evidence.';
  }
  const blocks = excerpts.map(
    (ex) => `[${ex.id}] (${ex.filename}, possibly truncated)\n${ex.excerpt}`
  );
  return `UPLOADED SOURCE DOCUMENTS (cite by ID exactly as shown):\n\n${blocks.join('\n\n')}`;
}

function formatIntakeBlock(project: IProjectInterface): string {
  const intake = project.intake || {};
  const keys = Object.keys(intake);
  if (keys.length === 0) return 'PROJECT INTAKE DATA: none submitted.';
  const lines = keys.map((key) => `- ${key}: ${JSON.stringify(intake[key])}`);
  return `PROJECT INTAKE DATA:\n${lines.join('\n')}`;
}

function methodologyReferenceLine(methodology: IMethodologyInterface): string {
  const ref = methodology.sourceReference;
  return ref
    ? `METHODOLOGY REFERENCE (cite as "methodology_reference"): ${methodology.title} (${methodology.code} v${methodology.version}) — ${ref.name}, ${ref.publisher}.`
    : `METHODOLOGY: ${methodology.title} (${methodology.code} v${methodology.version}).`;
}

export function buildAdditionalityPrompt(
  methodology: IMethodologyInterface,
  project: IProjectInterface,
  guidance: ISectionGuidance | undefined,
  excerpts: ISourceExcerpt[]
): LLMMessage[] {
  const tiers = methodology.additionalityTiers || [];
  const tierList = tiers
    .map((tier: IAdditionalityTier) => `- Tier ${tier.tier} (${tier.name}): ${tier.description}\n  Required evidence: ${tier.requiredEvidence.join('; ')}`)
    .join('\n');

  const schemaDescription = `Respond with ONLY a JSON object of this exact shape (no markdown fence, no commentary):
{
  "tiers": [
    {
      "tier": "<tier code, exactly matching one of the tiers listed below>",
      "tierName": "<tier name>",
      "argument": "<the drafted argument for this tier, citing evidence as instructed>",
      "evidenceCited": ["<which required-evidence items this argument actually addresses>"],
      "citations": [{"claim": "<the specific claim>", "source": "source_document" | "methodology_reference" | "none", "sourceDetail": "<exact excerpt ID, or methodology reference name, or a note on what's needed>"}],
      "needsEvidence": <true if a required claim for this tier lacks real support, else false>
    }
  ],
  "overallAssessment": "<one paragraph synthesizing across tiers>"
}
Include one entry in "tiers" for every tier listed below, in the order given.`;

  const userContent = [
    methodologyReferenceLine(methodology),
    `ADDITIONALITY TIERS APPLICABLE TO THIS METHODOLOGY:\n${tierList}`,
    guidance?.promptFragment ? `SECTION-SPECIFIC GUIDANCE: ${guidance.promptFragment}` : '',
    formatIntakeBlock(project),
    formatExcerptsBlock(excerpts),
    schemaDescription,
  ].filter(Boolean).join('\n\n');

  return [
    { role: 'system', content: RIGOR_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

export function buildBaselinePrompt(
  methodology: IMethodologyInterface,
  project: IProjectInterface,
  guidance: ISectionGuidance | undefined,
  excerpts: ISourceExcerpt[]
): LLMMessage[] {
  const formula: IBaselineFormula | undefined = methodology.baselineFormula;
  const variablesList = (formula?.variables || [])
    .map((v) => `- ${v.name} (${v.label}): source=${v.source}${v.sourceRef ? `, ref=${v.sourceRef}` : ''}${v.unit ? `, unit=${v.unit}` : ''}`)
    .join('\n');

  const schemaDescription = `Respond with ONLY a JSON object of this exact shape (no markdown fence, no commentary):
{
  "narrative": "<explanation of the baseline scenario, following the section-specific guidance below>",
  "variables": [
    {"name": "<exactly matching one of the variable names listed below>", "value": "<the resolved value from intake/sources, or the literal string NOT AVAILABLE>", "citations": [{"claim": "<what this value represents>", "source": "source_document" | "methodology_reference" | "none", "sourceDetail": "<exact excerpt ID, methodology reference name, or note on what's needed>"}]}
  ],
  "formulaApplied": "<the relationship string below, with variable values substituted where known and left as the variable name where NOT AVAILABLE>"
}
Include one entry in "variables" for every variable listed below.`;

  const userContent = [
    methodologyReferenceLine(methodology),
    formula ? `BASELINE FORMULA: ${formula.description}\nRelationship: ${formula.relationship}\nVariables:\n${variablesList}` : 'No declarative baseline formula is modeled for this methodology — describe the baseline scenario narratively only.',
    guidance?.promptFragment ? `SECTION-SPECIFIC GUIDANCE: ${guidance.promptFragment}` : '',
    formatIntakeBlock(project),
    formatExcerptsBlock(excerpts),
    schemaDescription,
  ].filter(Boolean).join('\n\n');

  return [
    { role: 'system', content: RIGOR_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

export function buildGenericStructuredPrompt(
  methodology: IMethodologyInterface,
  guidance: ISectionGuidance,
  project: IProjectInterface,
  excerpts: ISourceExcerpt[]
): LLMMessage[] {
  const schemaDescription = `Respond with ONLY a JSON object of this exact shape (no markdown fence, no commentary):
{
  "summary": "<one-paragraph summary of this section's content>",
  "fields": {"<field name you choose, relevant to the guidance below>": "<value>"},
  "citations": [{"claim": "<specific claim or field it supports>", "source": "source_document" | "methodology_reference" | "none", "sourceDetail": "<exact excerpt ID, methodology reference name, or note on what's needed>"}]
}`;

  const userContent = [
    methodologyReferenceLine(methodology),
    `SECTION: ${guidance.section}`,
    `SECTION-SPECIFIC GUIDANCE: ${guidance.promptFragment}`,
    formatIntakeBlock(project),
    formatExcerptsBlock(excerpts),
    schemaDescription,
  ].filter(Boolean).join('\n\n');

  return [
    { role: 'system', content: RIGOR_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

// Narrative sections use a plain-text response (not JSON) refined through a
// chat loop, but still carry citations — the model is asked to append a
// citations block in a fixed, parseable format at the end of the prose.
const NARRATIVE_CITATION_INSTRUCTION = `After the narrative text, on new lines, list every citation used in this exact format (one per line, plain text, no markdown):
CITATION | <claim> | <source_document|methodology_reference|none> | <exact excerpt ID, methodology reference name, or note on what's needed>`;

export function buildNarrativePrompt(
  methodology: IMethodologyInterface,
  guidance: ISectionGuidance,
  project: IProjectInterface,
  excerpts: ISourceExcerpt[],
  priorTurns: LLMMessage[] = []
): LLMMessage[] {
  const userContent = [
    methodologyReferenceLine(methodology),
    `SECTION: ${guidance.section}`,
    `SECTION-SPECIFIC GUIDANCE: ${guidance.promptFragment}`,
    formatIntakeBlock(project),
    formatExcerptsBlock(excerpts),
    NARRATIVE_CITATION_INSTRUCTION,
  ].filter(Boolean).join('\n\n');

  return [
    { role: 'system', content: RIGOR_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
    ...priorTurns,
  ];
}

// Structural check only — no extra LLM call. A citation claiming
// source_document must reference an excerpt ID we actually supplied;
// anything else is flagged rather than trusted, since an LLM can fabricate
// a plausible-looking citation that passes no other check.
export function validateCitations(
  citations: Array<{ claim: string; source: string; sourceDetail: string }>,
  excerpts: ISourceExcerpt[]
): IGeneratedCitation[] {
  const knownIds = new Set(excerpts.map((e) => e.id));
  return citations.map((c) => {
    const source = (c.source === 'source_document' || c.source === 'methodology_reference' ? c.source : 'none') as IGeneratedCitation['source'];
    const verified = source === 'source_document' ? knownIds.has(c.sourceDetail.trim()) : undefined;
    return { claim: c.claim, source, sourceDetail: c.sourceDetail, verified };
  });
}

export function parseNarrativeCitations(raw: string): { text: string; citations: Array<{ claim: string; source: string; sourceDetail: string }> } {
  const lines = raw.split('\n');
  const citationLines = lines.filter((line) => line.trim().startsWith('CITATION |'));
  const textLines = lines.filter((line) => !line.trim().startsWith('CITATION |'));

  const citations = citationLines.map((line) => {
    const parts = line.replace('CITATION |', '').split('|').map((p) => p.trim());
    return {
      claim: parts[0] || '',
      source: parts[1] || 'none',
      sourceDetail: parts[2] || '',
    };
  });

  return { text: textLines.join('\n').trim(), citations };
}
