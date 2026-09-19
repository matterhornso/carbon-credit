import { CreateMonitoringPeriod } from "../../domain/monitoring/CreateMonitoringPeriod";
import { IMonitoringPeriodInterface } from "../../domain/monitoring/monitoringInterface";

// Tenancy is absent from these signatures by design: the scope binds at
// repository construction, so a usecase cannot forget it or widen it.
export abstract class IMonitoringRepository {
  abstract createPeriod(period: CreateMonitoringPeriod): Promise<IMonitoringPeriodInterface>
  abstract getPeriodsByProjectId(projectId: string): Promise<IMonitoringPeriodInterface[]>
  abstract getPeriodById(id: string): Promise<IMonitoringPeriodInterface | null>
  abstract updateParameter(id: string, parameterName: string, update: Record<string, any>): Promise<IMonitoringPeriodInterface | null>
  abstract updatePeriodStatus(id: string, status: string, extra?: Record<string, any>): Promise<IMonitoringPeriodInterface | null>
}
