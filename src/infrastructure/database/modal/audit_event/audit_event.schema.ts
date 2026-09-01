import { Schema } from "mongoose";
import { createAuditEvent, getEventsByProjectId } from "./audit_event.statics";

const AuditEventSchema = new Schema({
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
