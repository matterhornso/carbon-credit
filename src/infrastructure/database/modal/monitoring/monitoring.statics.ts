import { IMonitoringPeriodModel } from "./monitoring.types";
import { Model } from "mongoose";
import { IMonitoringPeriodInterface } from "../../../../domain/monitoring/monitoringInterface";

export async function createPeriod(
  this: Model<IMonitoringPeriodModel>,
  tenantId: string,
  period: IMonitoringPeriodInterface
): Promise<any> {
  try {
    return await this.create({ ...period, tenantId });
  } catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db");
  }
}

export async function getPeriodsByProjectId(
  this: Model<IMonitoringPeriodModel>,
  tenantId: string,
  projectId: string
): Promise<any> {
  // Ascending, unlike every other list in the platform: monitoring periods are
  // read as a sequence a project moves through, not as a feed of recent events.
  const records = await this.find({ projectId, tenantId }).sort({ periodNumber: 1 });
  return records || [];
}

export async function getPeriodById(
  this: Model<IMonitoringPeriodModel>,
  tenantId: string,
  id: string
): Promise<any> {
  return await this.findOne({ _id: id, tenantId });
}

// Updates one parameter inside a period, matched by its name within the
// period's own snapshot. Positional update rather than read-modify-write so two
// people recording different parameters in the same period cannot clobber each
// other - field work is collaborative and often offline-then-synced.
export async function updateParameter(
  this: Model<IMonitoringPeriodModel>,
  tenantId: string,
  id: string,
  parameterName: string,
  update: Record<string, any>
): Promise<any> {
  const set: Record<string, any> = {};
  for (const [key, value] of Object.entries(update)) {
    if (value !== undefined) set[`parameters.$[target].${key}`] = value;
  }
  if (!Object.keys(set).length) return await this.findOne({ _id: id, tenantId });

  return await this.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: set },
    { new: true, arrayFilters: [{ 'target.parameter': parameterName }] }
  );
}

export async function updatePeriodStatus(
  this: Model<IMonitoringPeriodModel>,
  tenantId: string,
  id: string,
  status: string,
  extra?: Record<string, any>
): Promise<any> {
  return await this.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: { status, ...(extra || {}) } },
    { new: true }
  );
}
