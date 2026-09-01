import { CreateAuditEvent } from "../../domain";
import { IAuditEventInterface } from "../../domain/audit_event/auditEventInterface";

export abstract class IAuditEventRepository {
  abstract createAuditEvent(event: CreateAuditEvent): Promise<IAuditEventInterface>
  abstract getEventsByProjectId(projectId: string): Promise<IAuditEventInterface[]>
}
