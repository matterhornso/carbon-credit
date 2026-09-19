import { CreateMonitoringPeriod } from "../../../../domain/monitoring/CreateMonitoringPeriod";
import { IMonitoringPeriodInterface } from "../../../../domain/monitoring/monitoringInterface";
import { MonitoringConnection } from "../../../../interfaces/database/IDBConnection"
import { MonitoringPeriodModel } from "../../modal/monitoring/monitoring.model";

export class MonitoringMongoConnection extends MonitoringConnection {
  constructor() { super(); }

  async createPeriod(tenantId: string, period: CreateMonitoringPeriod): Promise<IMonitoringPeriodInterface> {
    return await MonitoringPeriodModel.createPeriod(tenantId, period);
  }
  async getPeriodsByProjectId(tenantId: string, projectId: string): Promise<IMonitoringPeriodInterface[]> {
    return await MonitoringPeriodModel.getPeriodsByProjectId(tenantId, projectId);
  }
  async getPeriodById(tenantId: string, id: string): Promise<IMonitoringPeriodInterface | null> {
    return await MonitoringPeriodModel.getPeriodById(tenantId, id);
  }
  async updateParameter(tenantId: string, id: string, parameterName: string, update: Record<string, any>): Promise<IMonitoringPeriodInterface | null> {
    return await MonitoringPeriodModel.updateParameter(tenantId, id, parameterName, update);
  }
  async updatePeriodStatus(tenantId: string, id: string, status: string, extra?: Record<string, any>): Promise<IMonitoringPeriodInterface | null> {
    return await MonitoringPeriodModel.updatePeriodStatus(tenantId, id, status, extra);
  }
}
