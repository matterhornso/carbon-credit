import { IJobInterface } from './jobInterface';
import { JOB_STATUSES } from './jobInterface';

export class CreateJob {
  tenantId!: string;
  type!: string;
  payload: any;
  status!: string;
  attempts!: number;
  maxAttempts!: number;

  constructor(data: IJobInterface & { tenantId: string; type: string }) {
    if (!data.tenantId) throw new Error('tenantId missing!');
    if (!data.type) throw new Error('job type missing!');
    this.tenantId = data.tenantId;
    this.type = data.type;
    this.payload = data.payload ?? {};
    this.status = JOB_STATUSES.QUEUED;
    this.attempts = 0;
    // Three attempts covers a transient upstream failure without hammering a
    // genuinely broken one.
    this.maxAttempts = data.maxAttempts ?? 3;
  }
}
