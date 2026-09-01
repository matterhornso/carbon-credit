import { IAuditEventModel } from "./audit_event.types";
import { Model } from "mongoose";
import { IAuditEventInterface } from "../../../../domain/audit_event/auditEventInterface";

export async function createAuditEvent(
  this: Model<IAuditEventModel>,
  event: IAuditEventInterface
): Promise<any> {
  try {
    const record = await this.create(event);
    return record;
  } catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db");
  }
}

export async function getEventsByProjectId(
  this: Model<IAuditEventModel>,
  projectId: string
): Promise<any> {
  const records = await this.find({ projectId }).sort({ createdAt: -1 });
  return records || [];
}
