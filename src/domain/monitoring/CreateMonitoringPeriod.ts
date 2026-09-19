import {
  IMonitoringPeriodInterface,
  IMonitoredParameter,
  MONITORING_PERIOD_STATUSES,
  MONITORED_PARAMETER_STATUSES,
} from './monitoringInterface';
import { IMonitoringParameter } from '../methodology/methodologyInterface';

export class CreateMonitoringPeriod implements IMonitoringPeriodInterface {
  projectId!: string;
  periodNumber!: number;
  startDate!: Date;
  endDate!: Date;
  status!: string;
  parameters!: IMonitoredParameter[];

  constructor(period: IMonitoringPeriodInterface) {
    if (!period.projectId) throw new Error('projectId missing!');
    if (!period.periodNumber || period.periodNumber < 1) throw new Error('periodNumber must be 1 or greater!');
    if (!period.startDate) throw new Error('startDate missing!');
    if (!period.endDate) throw new Error('endDate missing!');

    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    // A period that ends before it starts would silently produce negative
    // durations downstream and a verifier would find it before we did.
    if (end <= start) throw new Error('endDate must be after startDate!');

    this.projectId = period.projectId as string;
    this.periodNumber = period.periodNumber;
    this.startDate = start;
    this.endDate = end;
    this.status = period.status || MONITORING_PERIOD_STATUSES.OPEN;
    this.parameters = period.parameters || [];
  }
}

/**
 * Snapshot the methodology's monitoring plan onto a period.
 *
 * Snapshotted, not referenced. A methodology revised mid-crediting-period must
 * not retroactively change what an already-reported period was required to
 * collect — a verifier reads the period against the rules that applied when it
 * ran, and a live reference would quietly rewrite history.
 */
export function snapshotMonitoringPlan(parameters: IMonitoringParameter[] = []): IMonitoredParameter[] {
  return parameters.map((p) => ({
    parameter: p.parameter,
    unit: p.unit,
    frequency: p.frequency,
    method: p.method,
    status: MONITORED_PARAMETER_STATUSES.NOT_COLLECTED,
    evidenceDocumentIds: [],
  }));
}
