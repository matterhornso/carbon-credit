// Runs queued work.
//
// In-process for now, started alongside the HTTP server. That is the right
// size for the current load and has one honest limitation: scaling the service
// horizontally also multiplies workers. That is safe — claiming is atomic, so
// two workers cannot take the same job — but it is not a substitute for a
// dedicated worker process once throughput matters.

import { JobQueue } from './JobQueue';
import { IJobInterface, JOB_TYPES } from '../../../domain/job/jobInterface';
import { TenantScope } from '../../../domain/tenant/TenantScope';
import { GenerationService } from '../generation/GenerationService';
import { LLMService } from '../../../interfaces/services/LLM.service';
import { ProjectRepository } from '../../../interfaces/database/ProjectRepository';
import { MethodologyRepository } from '../../../interfaces/database/MethodologyRepository';
import { CaseDocumentRepository } from '../../../interfaces/database/CaseDocumentRepository';
import { SourceDocumentRepository } from '../../../interfaces/database/SourceDocumentRepository';
import { AuditEventRepository } from '../../../interfaces/database/AuditEventRepository';
import { ProjectMongoConnection } from '../../../infrastructure/database/helper/database/Project';
import { MethodologyMongoConnection } from '../../../infrastructure/database/helper/database/Methodology';
import { CaseDocumentMongoConnection } from '../../../infrastructure/database/helper/database/CaseDocument';
import { SourceDocumentMongoConnection } from '../../../infrastructure/database/helper/database/SourceDocument';
import { AuditEventMongoConnection } from '../../../infrastructure/database/helper/database/AuditEvent';

export type JobHandler = (job: IJobInterface) => Promise<any>;

/** Rebuilds the tenant-scoped dependency graph from the job's own tenant. */
function generationServiceFor(tenantId: string): GenerationService {
  const scope = new TenantScope(tenantId);
  return new GenerationService(
    new ProjectRepository(new ProjectMongoConnection(), scope),
    new MethodologyRepository(new MethodologyMongoConnection()),
    new CaseDocumentRepository(new CaseDocumentMongoConnection(), scope),
    new SourceDocumentRepository(new SourceDocumentMongoConnection(), scope),
    new AuditEventRepository(new AuditEventMongoConnection(), scope),
    new LLMService()
  );
}

export const DEFAULT_HANDLERS: Record<string, JobHandler> = {
  [JOB_TYPES.GENERATE_ALL_SECTIONS]: async (job) => {
    const { projectId, actor, onlyMissing } = job.payload || {};
    if (!projectId) throw new Error('generate_all_sections requires a projectId');
    if (!actor?.userId) throw new Error('generate_all_sections requires an actor');
    const service = generationServiceFor(String(job.tenantId));
    const result = await service.generateAllSections(projectId, actor, { onlyMissing: onlyMissing === true });
    return { sections: (result.sections || []).length };
  },
};

export class JobWorker {
  private timer: NodeJS.Timeout | null = null;
  private draining = false;
  private stopped = false;

  constructor(
    private queue: JobQueue = new JobQueue(),
    private handlers: Record<string, JobHandler> = DEFAULT_HANDLERS,
    private intervalMs: number = Number(process.env['JOB_POLL_INTERVAL_MS'] || 5000)
  ) {}

  start(): void {
    if (this.timer) return;
    this.stopped = false;
    this.timer = setInterval(() => { void this.drain(); }, this.intervalMs);
    // Not ref'd: a polling timer should never be the reason the process stays up.
    if (typeof this.timer.unref === 'function') this.timer.unref();
    console.log(`[jobs] worker started, polling every ${this.intervalMs}ms`);
  }

  stop(): void {
    this.stopped = true;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  /** Claims and runs jobs until the queue is empty. Safe to call concurrently. */
  async drain(): Promise<number> {
    if (this.draining || this.stopped) return 0;
    this.draining = true;
    let processed = 0;
    try {
      for (;;) {
        const job = await this.queue.claimNext();
        if (!job) break;
        await this.run(job);
        processed++;
      }
    } catch (error: any) {
      // The loop failing must not kill the timer; the next tick retries.
      console.log('[jobs] drain error:', error?.message || error);
    } finally {
      this.draining = false;
    }
    return processed;
  }

  private async run(job: IJobInterface & { _id: string }): Promise<void> {
    const handler = this.handlers[String(job.type)];
    if (!handler) {
      await this.queue.fail(String(job._id), `no handler registered for job type '${job.type}'`);
      return;
    }
    try {
      const result = await handler(job);
      await this.queue.succeed(String(job._id), result);
    } catch (error: any) {
      await this.queue.fail(String(job._id), error?.message || String(error));
    }
  }
}
