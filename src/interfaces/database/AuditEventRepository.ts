import { IAuditEventRepository } from '../../application/repositories/IAuditEventRepository'
import { CreateAuditEvent } from '../../domain'
import { TenantScope } from '../../domain/tenant/TenantScope'
import { AuditEventConnection } from './IDBConnection'
import { IAuditEventInterface } from "../../domain/audit_event/auditEventInterface";

export class AuditEventRepository extends IAuditEventRepository {
  private connection: AuditEventConnection
  private scope: TenantScope

  constructor(connection: AuditEventConnection, scope: TenantScope) {
    super()
    this.connection = connection
    this.scope = scope
  }

  async createAuditEvent(event: CreateAuditEvent): Promise<IAuditEventInterface> {
    return await this.connection.createAuditEvent(this.scope.tenantId, event);
  }

  async getEventsByProjectId(projectId: string): Promise<IAuditEventInterface[]> {
    return await this.connection.getEventsByProjectId(this.scope.tenantId, projectId);
  }
}
