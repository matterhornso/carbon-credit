import { Document, Model } from "mongoose";
import { IMonitoringPeriodInterface } from "../../../../domain/monitoring/monitoringInterface"

export interface IMonitoringPeriodDocument extends IMonitoringPeriodInterface, Document { }

export interface IMonitoringPeriodModel extends Model<IMonitoringPeriodDocument> {
  createPeriod: (this: IMonitoringPeriodModel, tenantId: string, period: IMonitoringPeriodInterface) => Promise<IMonitoringPeriodInterface>;
  getPeriodsByProjectId: (this: IMonitoringPeriodModel, tenantId: string, projectId: string) => Promise<IMonitoringPeriodInterface[]>;
  getPeriodById: (this: IMonitoringPeriodModel, tenantId: string, id: string) => Promise<IMonitoringPeriodInterface | null>;
  updateParameter: (this: IMonitoringPeriodModel, tenantId: string, id: string, parameterName: string, update: Record<string, any>) => Promise<IMonitoringPeriodInterface | null>;
  updatePeriodStatus: (this: IMonitoringPeriodModel, tenantId: string, id: string, status: string, extra?: Record<string, any>) => Promise<IMonitoringPeriodInterface | null>;
}
