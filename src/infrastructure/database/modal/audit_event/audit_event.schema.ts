import { Schema } from "mongoose";
import { createAuditEvent, getEventsByProjectId } from "./audit_event.statics";

const AuditEventSchema = new Schema({
  // Isolation boundary. Indexed because every query filters on it.
  tenantId: { type: String, required: true, index: true },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'project',
    required: true,
  },
  actorUserId: {
    type: String,
    required: true
  },
  actorRole: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

AuditEventSchema.index({ projectId: 1, createdAt: -1 });

AuditEventSchema.statics.createAuditEvent = createAuditEvent;
AuditEventSchema.statics.getEventsByProjectId = getEventsByProjectId;

export default AuditEventSchema;
