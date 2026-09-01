import { model } from "mongoose";
import { IAuditEventDocument, IAuditEventModel } from "./audit_event.types";
import AuditEventSchema from "./audit_event.schema";
export const AuditEventModel = model<IAuditEventDocument>("audit_event", AuditEventSchema) as IAuditEventModel;
