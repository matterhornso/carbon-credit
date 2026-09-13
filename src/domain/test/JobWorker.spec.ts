import { expect } from 'chai';
import { CreateJob } from '../job/CreateJob';
import { JOB_STATUSES, JOB_TYPES } from '../job/jobInterface';
import { JobWorker } from '../../application/usecases/job/JobWorker';

// A queue standing in for the mongo-backed one. Claiming order and the
// success/failure bookkeeping are what the worker depends on.
class FakeQueue {
  public succeeded: Array<{ id: string; result: any }> = [];
  public failed: Array<{ id: string; message: string }> = [];
  constructor(private jobs: any[] = []) {}
  async claimNext() { return this.jobs.shift() || null; }
  async succeed(id: string, result?: any) { this.succeeded.push({ id, result }); }
  async fail(id: string, message: string) { this.failed.push({ id, message }); }
}

describe('Test job execution', () => {

  describe('CreateJob', () => {
    it('starts queued with no attempts used', () => {
      const job = new CreateJob({ tenantId: 't1', type: JOB_TYPES.GENERATE_ALL_SECTIONS });
      expect(job.status).equals(JOB_STATUSES.QUEUED);
      expect(job.attempts).equals(0);
      expect(job.maxAttempts).equals(3);
    });

    it('refuses to exist without a tenant or a type', () => {
      expect(() => new CreateJob({ tenantId: '', type: 'x' } as any)).to.throw(/tenantId/);
      expect(() => new CreateJob({ tenantId: 't1', type: '' } as any)).to.throw(/type/);
    });
  });

  describe('JobWorker', () => {

    it('runs every queued job and records the results', async () => {
      const queue = new FakeQueue([
        { _id: 'j1', tenantId: 't1', type: 'demo', payload: { n: 1 } },
        { _id: 'j2', tenantId: 't1', type: 'demo', payload: { n: 2 } },
      ]);
      const worker = new JobWorker(queue as any, { demo: async (job: any) => ({ doubled: job.payload.n * 2 }) });

      const processed = await worker.drain();

      expect(processed).equals(2);
      expect(queue.succeeded.map((s) => s.id)).deep.equals(['j1', 'j2']);
      expect(queue.succeeded[1].result).deep.equals({ doubled: 4 });
      expect(queue.failed).to.be.empty;
    });

    // A handler throwing is ordinary, not exceptional: the queue decides
    // whether that means a retry or a terminal failure.
    it('records a failure instead of propagating a throwing handler', async () => {
      const queue = new FakeQueue([{ _id: 'j1', tenantId: 't1', type: 'demo' }]);
      const worker = new JobWorker(queue as any, { demo: async () => { throw new Error('LLM API error 429'); } });

      await worker.drain();

      expect(queue.failed).to.have.lengthOf(1);
      expect(queue.failed[0].message).to.match(/429/);
      expect(queue.succeeded).to.be.empty;
    });

    it('keeps going after one job fails', async () => {
      const queue = new FakeQueue([
        { _id: 'bad', tenantId: 't1', type: 'demo' },
        { _id: 'good', tenantId: 't1', type: 'demo' },
      ]);
      const worker = new JobWorker(queue as any, {
        demo: async (job: any) => { if (job._id === 'bad') throw new Error('boom'); return { ok: true }; },
      });

      await worker.drain();

      expect(queue.failed.map((f) => f.id)).deep.equals(['bad']);
      expect(queue.succeeded.map((s) => s.id)).deep.equals(['good']);
    });

    it('fails a job whose type has no handler rather than dropping it', async () => {
      const queue = new FakeQueue([{ _id: 'j1', tenantId: 't1', type: 'unknown_type' }]);
      const worker = new JobWorker(queue as any, {});

      await worker.drain();

      expect(queue.failed[0].message).to.match(/no handler registered/);
    });

    it('does not run two drains concurrently', async () => {
      let running = 0; let overlapped = false;
      const queue = new FakeQueue([
        { _id: 'j1', tenantId: 't1', type: 'demo' },
        { _id: 'j2', tenantId: 't1', type: 'demo' },
      ]);
      const worker = new JobWorker(queue as any, {
        demo: async () => {
          running++; if (running > 1) overlapped = true;
          await new Promise((r) => setTimeout(r, 10));
          running--; return {};
        },
      });

      await Promise.all([worker.drain(), worker.drain()]);

      expect(overlapped, 'a second drain ran while the first was mid-flight').equals(false);
    });

    it('stops claiming once stopped', async () => {
      const queue = new FakeQueue([{ _id: 'j1', tenantId: 't1', type: 'demo' }]);
      const worker = new JobWorker(queue as any, { demo: async () => ({}) });
      worker.stop();

      expect(await worker.drain()).equals(0);
      expect(queue.succeeded).to.be.empty;
    });

  });
});
