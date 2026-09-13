// Durable background work.
//
// Generation was a synchronous HTTP call making ten sequential model requests:
// it took minutes, died with the connection, and could only be started by a
// person clicking a button. None of that survives either volume or unattended
// operation, which is what this record exists to fix.

export interface IJobInterface {
  /** The tenant the work belongs to. Handlers scope all data access to it. */
  tenantId?: string;
  type?: string;
  payload?: any;
  status?: string; // 'queued' | 'running' | 'succeeded' | 'failed'
  attempts?: number;
  maxAttempts?: number;
  /** Why the most recent attempt failed. Cleared on success. */
  lastError?: string | null;
  /** Set when a worker claims the job; used to reclaim work abandoned by a crash. */
  claimedAt?: Date | null;
  startedAt?: Date;
  finishedAt?: Date;
  result?: any;
}

export const JOB_STATUSES = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

export const JOB_TYPES = {
  GENERATE_ALL_SECTIONS: 'generate_all_sections',
} as const;
