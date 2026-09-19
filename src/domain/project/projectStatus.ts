// Vocabulary only — which transitions are legal lives in the application
// layer (usecases/project_lifecycle), since that's business-rule logic, not
// a domain concept. VERIFIER_REVIEW/VERIFIED/REJECTED are documented for a
// future verification phase; no Phase 1 transition reaches them yet.
export const PROJECT_STATUSES = {
  DRAFT_INTAKE: 'DRAFT_INTAKE',
  METHODOLOGY_SELECTED: 'METHODOLOGY_SELECTED',
  INPUTS_SUBMITTED: 'INPUTS_SUBMITTED',
  CASE_GENERATING: 'CASE_GENERATING',
  CASE_DRAFT_READY: 'CASE_DRAFT_READY',
  ISSUER_FINALIZED: 'ISSUER_FINALIZED',
  EXPORTED_FOR_VERIFICATION: 'EXPORTED_FOR_VERIFICATION',
  VERIFIER_REVIEW: 'VERIFIER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  // Past verification. VERIFIED used to be terminal, which put the end of the
  // lifecycle exactly where a developer's recurring work begins: a registered
  // project is monitored every year for the length of its crediting period,
  // and that load is what actually caps portfolio size.
  REGISTERED: 'REGISTERED',
  MONITORING: 'MONITORING',
  // Terminal for real: the crediting period is over and nothing further can be
  // issued against the project.
  CREDITING_PERIOD_CLOSED: 'CREDITING_PERIOD_CLOSED',
} as const;

export type ProjectStatus = typeof PROJECT_STATUSES[keyof typeof PROJECT_STATUSES];
