// Structured-output shapes for AI-generated CaseDocument section content.
// These are what makes the "rigor over speed" differentiation real: every
// generated claim carries a citation the UI can surface and a reviewer can
// check, instead of opaque prose. additionality/baseline get their own
// typed shapes because Methodology models fixed sub-structures for them
// (additionalityTiers, baselineFormula); the other structured sections share
// a generic shape since Methodology doesn't model fixed sub-fields for them.

export interface IGeneratedCitation {
  claim: string; // the specific fact/number/statement this citation supports
  source: 'source_document' | 'methodology_reference' | 'none';
  sourceDetail: string; // an excerpt ID (e.g. "SRC-1") for source_document, the methodology's sourceReference name for methodology_reference, or a note on what evidence is needed for 'none'
  verified?: boolean; // set after generation: does sourceDetail actually match an excerpt ID we supplied? Absent for non-source_document citations.
}

export interface IAdditionalityTierResult {
  tier: string; // matches Methodology.additionalityTiers[].tier
  tierName: string;
  argument: string;
  evidenceCited: string[]; // which of the tier's requiredEvidence items this argument actually addresses
  citations: IGeneratedCitation[];
  needsEvidence: boolean; // true if a required claim for this tier lacks a real citation
}

export interface IAdditionalityGenerationContent {
  tiers: IAdditionalityTierResult[];
  overallAssessment: string;
}

export interface IBaselineVariableResult {
  name: string; // matches Methodology.baselineFormula.variables[].name
  value: string; // the resolved value, or "NOT AVAILABLE" if unsupported
  citations: IGeneratedCitation[];
}

export interface IBaselineGenerationContent {
  narrative: string;
  variables: IBaselineVariableResult[];
  formulaApplied: string; // the relationship string with variables substituted where known
}

export interface IGenericStructuredContent {
  summary: string;
  fields: Record<string, string>;
  citations: IGeneratedCitation[];
}

export interface INarrativeGenerationContent {
  text: string;
  citations: IGeneratedCitation[];
}

export interface ISourceExcerpt {
  id: string; // "SRC-1", "SRC-2", ...
  filename: string;
  excerpt: string;
}

// Section keys where Methodology models a fixed sub-structure and gets its
// own typed generator. Every other section (from sectionGuidance) is
// "generic" — structured or narrative depending on Methodology.sectionGuidance[].contentType.
export const FIXED_SHAPE_SECTIONS = {
  ADDITIONALITY: 'additionality',
  BASELINE_SCENARIO: 'baseline_scenario',
} as const;
