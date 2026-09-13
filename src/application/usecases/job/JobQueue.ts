// The queue itself.
//
// A deliberate exception to tenant scoping lives here, and it is worth being
// explicit about. Every other repository binds a TenantScope at construction so
// a query cannot be built without one. A worker cannot do that: it has to find
// the next job across all tenants before it knows which tenant the work belongs
// to. So claiming is system-level by design.
//
// Isolation is preserved where it matters: the claimed job carries its own
// tenantId, and the handler builds tenant-scoped repositories from it. Nothing
// touches project data without a scope — only the queue row is global.

import { CreateJob } from '../../../domain/job/CreateJob';
import { IJobInterface, JOB_STATUSES } from '../../../domain/job/jobInterface';
import { JobModel } from '../../../infrastructure/database/modal/job/job.model';

// A job claimed but never finished — because the process died mid-run — is
// returned to the queue after this long rather than being lost.
const STALE_CLAIM_MS = 15 * 60 * 1000;

export class JobQueue {
  async enqueue(job: CreateJob): Promise<IJobInterface & { _id: string }> {
    const record: any = await JobModel.create({ ...job });
    return record;
  }

  /**
   * Atomically claim the oldest runnable job. findOneAndUpdate is the whole
   * mechanism: two workers racing cannot both win, because only one update
   * matches a given queued row.
   */
  async claimNext(): Promise<(IJobInterface & { _id: string }) | null> {
    const staleBefore = new Date(Date.now() - STALE_CLAIM_MS);
    const record: any = await JobModel.findOneAndUpdate(
      {
        $or: [
          { status: JOB_STATUSES.QUEUED },
          // Reclaim work abandoned by a crashed worker.
          { status: JOB_STATUSES.RUNNING, claimedAt: { $lt: staleBefore } },
        ],
      },
      {
        $set: { status: JOB_STATUSES.RUNNING, claimedAt: new Date(), startedAt: new Date() },
        $inc: { attempts: 1 },
      },
      { new: true, sort: { createdAt: 1 } }
    );
    return record || null;
  }

  async succeed(jobId: string, result?: any): Promise<void> {
    await JobModel.updateOne({ _id: jobId }, {
      $set: { status: JOB_STATUSES.SUCCEEDED, result, lastError: null, finishedAt: new Date(), claimedAt: null },
    });
  }

  /**
   * Record a failure. A job with attempts left returns to the queue; one that
   * has exhausted them is marked failed so it stops consuming worker time and
   * becomes visible as a problem rather than an endless retry.
   */
  async fail(jobId: string, message: string): Promise<void> {
    const job: any = await JobModel.findById(jobId);
    if (!job) return;
    const exhausted = (job.attempts || 0) >= (job.maxAttempts || 3);
    await JobModel.updateOne({ _id: jobId }, {
      $set: {
        status: exhausted ? JOB_STATUSES.FAILED : JOB_STATUSES.QUEUED,
        lastError: message,
        claimedAt: null,
        ...(exhausted ? { finishedAt: new Date() } : {}),
      },
    });
  }

  /** Status lookup is tenant-scoped: a caller may only see its own jobs. */
  async getById(tenantId: string, jobId: string): Promise<IJobInterface | null> {
    const record: any = await JobModel.findOne({ _id: jobId, tenantId });
    return record || null;
  }

  async countByStatus(): Promise<Record<string, number>> {
    const rows = await JobModel.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
    return rows.reduce((acc: any, r: any) => ({ ...acc, [r._id]: r.n }), {});
  }
}
