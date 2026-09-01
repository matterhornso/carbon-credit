export interface IMethodologyInterface {
  code?: string;
  version?: string;
  title?: string;
  standard?: string;
  status?: string;
  supersededBy?: string;
  sector?: string;
  applicabilityConditions?: IApplicabilityCondition[];
  requiredInputs?: IRequiredInput[];
  additionalityTiers?: IAdditionalityTier[];
  baselineFormula?: IBaselineFormula;
  monitoringParameters?: IMonitoringParameter[];
  sectionGuidance?: ISectionGuidance[];
  sourceReference?: ISourceReference;
}

// Eligibility criteria evaluated against a project's structured intake answers.
// checksInputKey/operator/value are used for auto pass/fail; guidance covers
// conditions that need human judgment rather than a simple comparison.
export interface IApplicabilityCondition {
  key: string;
  statement: string;
  checksInputKey?: string;
  operator?: string; // 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'manual_review'
  value?: string;
  guidance?: string;
}

// Drives the generic schema-rendered intake form — one renderer reads this
// array so a new methodology never needs a new frontend step component.
export interface IRequiredInput {
  key: string;
  label: string;
  dataType: string; // 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'file'
  unit?: string;
  required: boolean;
  options?: string[];
  helpText?: string;
}

// Tier codes follow the 5-level test already modeled in the dormant frontend
// (draftPDDCompilationV2Slice): 1 (ISO 14064-2), 2a (statutory), 2b
// (non-enforcement), 3 (technology/institutional/common-practice), 4a/4b
// (financial), 5 (policy). Only the tiers relevant to a given methodology are
// listed, not all seven.
export interface IAdditionalityTier {
  tier: string;
  name: string;
  description: string;
  requiredEvidence: string[];
}

// Declarative, not executable — enough to keep the AI's baseline narrative
// checkable against a fixed variable list instead of free-floating prose.
// A real formula engine is a later-phase ambition.
export interface IBaselineFormula {
  description: string;
  variables: IBaselineVariable[];
  relationship: string;
}

export interface IBaselineVariable {
  name: string;
  label: string;
  source: string; // 'input' | 'reference' | 'derived'
  sourceRef?: string;
  unit?: string;
}

export interface IMonitoringParameter {
  parameter: string;
  unit?: string;
  frequency: string;
  method: string;
}

// Maps a canonical CaseDocument section to methodology-specific prompt
// guidance for the generation service, and flags whether that section is
// structured-extraction or narrative-chat-refine content.
export interface ISectionGuidance {
  section: string;
  contentType: string; // 'structured' | 'narrative'
  promptFragment: string;
}

export interface ISourceReference {
  name: string;
  url: string;
  publisher: string;
}
