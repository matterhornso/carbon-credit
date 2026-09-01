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
} as const;

export type ProjectStatus = typeof PROJECT_STATUSES[keyof typeof PROJECT_STATUSES];
