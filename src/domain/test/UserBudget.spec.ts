import { expect } from 'chai';
import { UserBudget, UserBudgetExceededError } from '../../application/usecases/ratelimit/UserBudget';

/**
 * The express limiters count per IP, before authentication. That is right for
 * an unauthenticated flood and wrong for spend: an IP is not a person, so on a
 * shared egress address one prober can spend a colleague's budget. This is the
 * other half, and these tests are mostly about the properties that make it the
 * other half rather than a duplicate.
 *
 * Time is injected rather than slept, so the window behaviour is actually
 * asserted instead of approximated.
 */

const budget = () => new UserBudget({ windowMs: 60_000, limit: 3, label: 'Test' });

describe('Test per-user spend budget', () => {

  it('allows exactly the limit and then refuses', () => {
    const b = budget();
    const t = 1_000_000;

    b.consume('user-a', t);
    b.consume('user-a', t);
    b.consume('user-a', t);

    expect(() => b.consume('user-a', t)).to.throw(UserBudgetExceededError);
  });

  it('keeps one user from spending another user budget', () => {
    // The whole point. Under the per-IP limiter these two would share a bucket
    // if they sat behind the same NAT.
    const b = budget();
    const t = 1_000_000;

    b.consume('user-a', t);
    b.consume('user-a', t);
    b.consume('user-a', t);

    expect(() => b.consume('user-b', t)).to.not.throw();
    expect(b.remaining('user-b', t)).to.equal(2);
  });

  it('refills when the window passes', () => {
    const b = budget();
    const t = 1_000_000;

    b.consume('user-a', t);
    b.consume('user-a', t);
    b.consume('user-a', t);
    expect(() => b.consume('user-a', t)).to.throw();

    expect(() => b.consume('user-a', t + 60_001)).to.not.throw();
    expect(b.remaining('user-a', t + 60_001)).to.equal(2);
  });

  it('does not refill early', () => {
    const b = budget();
    const t = 1_000_000;

    b.consume('user-a', t);
    b.consume('user-a', t);
    b.consume('user-a', t);

    // One millisecond before the reset is still inside the window. A test that
    // only checked "after the window" would pass on an off-by-one that made the
    // budget refill immediately.
    expect(() => b.consume('user-a', t + 59_999)).to.throw(UserBudgetExceededError);
  });

  it('reports how long to wait, rounded up to a whole second', () => {
    const b = budget();
    const t = 1_000_000;

    b.consume('user-a', t);
    b.consume('user-a', t);
    b.consume('user-a', t);

    try {
      b.consume('user-a', t + 30_500);
      expect.fail('should have thrown');
    } catch (error: any) {
      expect(error).to.be.instanceOf(UserBudgetExceededError);
      // 29.5s remaining rounds up to 30, never down to 29 — a client that
      // retried at 29 would be refused again.
      expect(error.retryAfterSeconds).to.equal(30);
      expect(error.message).to.include('Test limit reached');
    }
  });

  it('counts a call that later fails, because the cost was already incurred', () => {
    // Consuming on entry rather than on success is what makes a failing retry
    // loop cost something. The opposite choice makes failure free.
    const b = budget();
    const t = 1_000_000;

    b.consume('user-a', t);
    expect(b.remaining('user-a', t)).to.equal(2);
  });

  it('refuses to throttle an unidentified caller rather than bucketing them together', () => {
    // One shared bucket for everyone unidentified is a denial of service
    // against whoever is unlucky. Reaching here without an id is a programming
    // error — this runs after authentication.
    const b = budget();
    expect(() => b.consume('')).to.throw(/requires a userId/);
  });

  it('reports a full budget for a user who has never called', () => {
    expect(budget().remaining('nobody')).to.equal(3);
  });
});
