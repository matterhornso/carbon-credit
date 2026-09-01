import { IAuditEventRepository } from '../../application/repositories/IAuditEventRepository'
import { CreateAuditEvent } from '../../domain'
import { AuditEventConnection } from './IDBConnection'
import { IAuditEventInterface } from "../../domain/audit_event/auditEventInterface";

export class AuditEventRepository extends IAuditEventRepository {
  private connection: AuditEventConnection

  constructor(connection: AuditEventConnection) {
    super()
    this.connection = connection
  }

  async createAuditEvent(event: CreateAuditEvent): Promise<IAuditEventInterface> {
    return await this.connection.createAuditEvent(event);
  }

  async getEventsByProjectId(projectId: string): Promise<IAuditEventInterface[]> {
    return await this.connection.getEventsByProjectId(projectId);
  }
}
