import { Document, Model } from "mongoose";
import { IAuditEventInterface } from "../../../../domain/audit_event/auditEventInterface"

export interface IAuditEventDocument extends IAuditEventInterface, Document { }

export interface IAuditEventModel extends Model<IAuditEventDocument> {
  createAuditEvent: (this: IAuditEventModel, event: IAuditEventInterface) => Promise<IAuditEventInterface>;
  getEventsByProjectId: (this: IAuditEventModel, projectId: string) => Promise<IAuditEventInterface[]>;
}
