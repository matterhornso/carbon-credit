import { IMonitoringRepository } from '../../application/repositories/IMonitoringRepository'
import { CreateMonitoringPeriod } from '../../domain/monitoring/CreateMonitoringPeriod'
import { TenantScope } from '../../domain/tenant/TenantScope'
import { MonitoringConnection } from './IDBConnection'
import { IMonitoringPeriodInterface } from "../../domain/monitoring/monitoringInterface";

export class MonitoringRepository extends IMonitoringRepository {
  private connection: MonitoringConnection
  private scope: TenantScope

  constructor(connection: MonitoringConnection, scope: TenantScope) {
    super()
    this.connection = connection
    this.scope = scope
  }

  async createPeriod(period: CreateMonitoringPeriod): Promise<IMonitoringPeriodInterface> {
    return await this.connection.createPeriod(this.scope.tenantId, period);
  }
  async getPeriodsByProjectId(projectId: string): Promise<IMonitoringPeriodInterface[]> {
    return await this.connection.getPeriodsByProjectId(this.scope.tenantId, projectId);
  }
  async getPeriodById(id: string): Promise<IMonitoringPeriodInterface | null> {
    return await this.connection.getPeriodById(this.scope.tenantId, id);
  }
  async updateParameter(id: string, parameterName: string, update: Record<string, any>): Promise<IMonitoringPeriodInterface | null> {
    return await this.connection.updateParameter(this.scope.tenantId, id, parameterName, update);
  }
  async updatePeriodStatus(id: string, status: string, extra?: Record<string, any>): Promise<IMonitoringPeriodInterface | null> {
    return await this.connection.updatePeriodStatus(this.scope.tenantId, id, status, extra);
  }
}
