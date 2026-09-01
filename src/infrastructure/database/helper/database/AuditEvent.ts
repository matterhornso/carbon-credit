import { CreateAuditEvent } from "../../../../domain";
import { IAuditEventInterface } from "../../../../domain/audit_event/auditEventInterface";
import { AuditEventConnection } from "../../../../interfaces/database/IDBConnection"
import { AuditEventModel } from "../../modal/audit_event/audit_event.model";

export class AuditEventMongoConnection extends AuditEventConnection {

  constructor() {
    super();
  }

  async createAuditEvent(event: CreateAuditEvent): Promise<IAuditEventInterface> {
    return await AuditEventModel.createAuditEvent(event);
  }

  async getEventsByProjectId(projectId: string): Promise<IAuditEventInterface[]> {
    return await AuditEventModel.getEventsByProjectId(projectId);
  }
}
