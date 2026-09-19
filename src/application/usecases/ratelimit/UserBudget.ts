/**
 * Per-user spend budget for the endpoints that cost model time.
 *
 * Why this exists alongside the express limiter
 * ---------------------------------------------
 * The limiters in router.ts run before authentication, because tsoa mounts its
 * auth middleware per route inside RegisterRoutes. That ordering is what makes
 * them useful against an unauthenticated flood - but it also means they count
 * per IP, and an IP is not a person. Behind a corporate NAT one unauthenticated
 * prober can spend the generation budget of every colleague sharing the egress
 * address. That was named as a known limitation when the limiters shipped; this
 * closes it.
 *
 * Keying on the JWT subject before verifying it would be worse than useless: an
 * attacker could forge a token claiming someone else's id and drain exactly
 * that person's budget. So this runs where the identity is already established
 * - inside the controller, after tsoa has authenticated - rather than as
 * middleware that would have to trust the header.
 *
 * In-process and per-instance, like the express limiters. With more than one
 * instance the effective budget multiplies by the instance count, which is the
 * same caveat and the same fix (a shared store). It is written down here rather
 * than discovered later.
 */

export class UserBudgetExceededError extends Error {
  public readonly retryAfterSeconds: number;
  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = 'UserBudgetExceededError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

interface IWindow {
  count: number;
  resetAt: number;
}

export interface IUserBudgetOptions {
  windowMs: number;
  limit: number;
  /** Named in the error so the caller knows which budget they hit. */
  label: string;
}

export class UserBudget {
  private windows = new Map<string, IWindow>();

  constructor(private options: IUserBudgetOptions) {}

  /**
   * Consume one unit for this user, or throw.
   *
   * Consuming on entry rather than on success is deliberate: the cost is
   * incurred by making the call, not by it succeeding, so a run that fails
   * half way through still spent model time and must still count. The opposite
   * choice makes a failing loop free.
   */
  consume(userId: string, now: number = Date.now()): void {
    if (!userId) {
      // An unidentified caller must not share one bucket with every other
      // unidentified caller - that turns the limiter into a denial of service
      // against whoever is unlucky. Callers reach this only after auth, so an
      // empty id is a programming error rather than a request to throttle.
      throw new Error('UserBudget requires a userId — call it after authentication');
    }

    const existing = this.windows.get(userId);

    if (!existing || now >= existing.resetAt) {
      this.windows.set(userId, { count: 1, resetAt: now + this.options.windowMs });
      this.sweep(now);
      return;
    }

    if (existing.count >= this.options.limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      throw new UserBudgetExceededError(
        `${this.options.label} limit reached (${this.options.limit} per ${Math.round(this.options.windowMs / 60000)} min). Try again in ${retryAfterSeconds}s.`,
        retryAfterSeconds
      );
    }

    existing.count += 1;
  }

  /** Remaining units, for surfacing in a response header or a UI. */
  remaining(userId: string, now: number = Date.now()): number {
    const existing = this.windows.get(userId);
    if (!existing || now >= existing.resetAt) return this.options.limit;
    return Math.max(0, this.options.limit - existing.count);
  }

  /**
   * Drop expired windows so the map does not grow with every user who ever
   * called. Swept on write rather than on a timer: a timer would keep the
   * process alive in tests and in a lambda, and this map is small enough that
   * an occasional linear pass is cheaper than the machinery to avoid one.
   */
  private sweep(now: number): void {
    if (this.windows.size < 1000) return;
    for (const [key, window] of this.windows) {
      if (now >= window.resetAt) this.windows.delete(key);
    }
  }
}

const minutes = (n: number) => n * 60 * 1000;

/**
 * Module-level so the budget survives across requests within an instance.
 *
 * Deliberately tighter than the per-IP limiter in router.ts (20/hr): that one
 * is a backstop against a flood, this one is a per-person spend ceiling, and a
 * single person running more than a dozen full case generations in an hour is
 * a runaway client rather than a user.
 */
export const generationBudget = new UserBudget({
  windowMs: minutes(60),
  limit: 12,
  label: 'Generation',
});

/**
 * Pre-validation reads the whole document per section, so a full review is the
 * most expensive single call in the platform. Bounded separately because the
 * two have different shapes: generation is once per case, review is once per
 * revision, and a team iterating on findings will legitimately review more
 * often than they generate.
 */
export const preValidationBudget = new UserBudget({
  windowMs: minutes(60),
  limit: 20,
  label: 'Case review',
});
