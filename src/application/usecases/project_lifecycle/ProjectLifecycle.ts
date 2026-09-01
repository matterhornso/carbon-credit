import { PROJECT_STATUSES, ProjectStatus } from "../../../domain/project/projectStatus";
import { IRequiredInput } from "../../../domain/methodology/methodologyInterface";

// Forward transitions plus the two intentional backward ones (send a
// generated case back for regeneration; send a rejected project back to
// draft). CASE_GENERATING -> CASE_DRAFT_READY is entered by the generation
// usecase (Phase 1 sub-milestone 3), not exposed as a user-triggered
// transition here. VERIFIER_REVIEW onward is unreachable in Phase 1 — no
// verifier flow exists yet — kept here so the schema doesn't box in that
// later phase.
export const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT_INTAKE: [PROJECT_STATUSES.METHODOLOGY_SELECTED],
  METHODOLOGY_SELECTED: [PROJECT_STATUSES.INPUTS_SUBMITTED],
  INPUTS_SUBMITTED: [PROJECT_STATUSES.CASE_GENERATING, PROJECT_STATUSES.METHODOLOGY_SELECTED],
  CASE_GENERATING: [PROJECT_STATUSES.CASE_DRAFT_READY],
  CASE_DRAFT_READY: [PROJECT_STATUSES.ISSUER_FINALIZED, PROJECT_STATUSES.CASE_GENERATING],
  ISSUER_FINALIZED: [PROJECT_STATUSES.EXPORTED_FOR_VERIFICATION, PROJECT_STATUSES.CASE_DRAFT_READY],
  EXPORTED_FOR_VERIFICATION: [PROJECT_STATUSES.VERIFIER_REVIEW],
  VERIFIER_REVIEW: [PROJECT_STATUSES.VERIFIED, PROJECT_STATUSES.REJECTED],
  VERIFIED: [],
  REJECTED: [PROJECT_STATUSES.CASE_DRAFT_READY],
};

export function assertValidTransition(from: string, to: string): void {
  const allowed = ALLOWED_TRANSITIONS[from as ProjectStatus];
  if (!allowed) throw new Error(`Unknown project status '${from}'`);
  if (!allowed.includes(to as ProjectStatus)) {
    throw new Error(`Cannot transition project from '${from}' to '${to}'`);
  }
}

export function assertIntakeComplete(requiredInputs: IRequiredInput[], intake: Record<string, any>): void {
  const missing = (requiredInputs || [])
    .filter((field) => field.required && (intake?.[field.key] === undefined || intake?.[field.key] === null || intake?.[field.key] === ''))
    .map((field) => field.key);
  if (missing.length) {
    throw new Error(`Missing required intake fields: ${missing.join(', ')}`);
  }
}
