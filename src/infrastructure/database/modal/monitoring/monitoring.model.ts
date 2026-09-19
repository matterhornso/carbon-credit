import { model } from "mongoose";
import { IMonitoringPeriodDocument, IMonitoringPeriodModel } from "./monitoring.types";
import MonitoringPeriodSchema from "./monitoring.schema";
export const MonitoringPeriodModel = model<IMonitoringPeriodDocument>("monitoring_period", MonitoringPeriodSchema) as IMonitoringPeriodModel;
