import { Types } from 'mongoose';

// Append-only. No update/delete usecase exists anywhere in this stack —
// audit records must not be mutable after the fact.
export interface IAuditEventInterface {
  projectId?: Types.ObjectId | string;
  actorUserId?: string;
  actorRole?: string;
  eventType?: string; // e.g. 'STATUS_TRANSITION' | 'INTAKE_UPDATED' | 'SECTION_GENERATED' | 'SECTION_EDITED'
  before?: any;
  after?: any;
}
