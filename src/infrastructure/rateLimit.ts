import rateLimit from "express-rate-limit";

/**
 * Rate limiting for carbon-credit.
 *
 * Every route here is behind a JWT, so this is not about anonymous abuse. It is
 * about the two things that authentication does not bound:
 *
 *   - Cost. /generation/generateAll fans out to one LLM call per section (ten
 *     for VM0047) plus a contradiction-detection call per section with
 *     documents. Nothing stopped a caller - or a retry loop in the webapp -
 *     from issuing that repeatedly. A limiter is the only spend ceiling the
 *     platform currently has, which is why generation gets its own.
 *   - Blast radius of a leaked token. A JWT that escapes is unbounded reads
 *     until it expires; a limiter turns "drain the tenant" into "drain slowly".
 *
 * Counted per-IP, in-process. See the TRUST_PROXY_HOPS note in router.ts - the
 * limiter is only as correct as that setting.
 */

const minutes = (n: number) => n * 60 * 1000;

const jsonMessage = (message: string) => ({
  status: false,
  message,
});

/**
 * Generation. Deliberately the tightest limit in the service, because it is the
 * only one that spends money per call.
 *
 * 20 per hour is roughly two full ten-section case generations plus retries -
 * comfortably above a real session, far below a loop. Successful calls count:
 * the cost is incurred on success, so skipping them would skip the calls worth
 * limiting.
 */
export const generationLimiter = rateLimit({
  windowMs: minutes(60),
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: jsonMessage("Generation rate limit reached. Generation is metered because each call costs model time; wait a few minutes or contact support to raise the limit."),
});

/**
 * Uploads. Bounded separately from reads because each one costs storage and a
 * text-extraction pass, and because an upload loop is how a document set grows
 * until it blows the prompt budget.
 */
export const uploadLimiter = rateLimit({
  windowMs: minutes(15),
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: jsonMessage("Too many uploads. Wait a few minutes and try again."),
});

/**
 * Everything else. A backstop against a runaway client, not a quota - a person
 * clicking around the origination wizard will not come close.
 */
export const generalLimiter = rateLimit({
  windowMs: minutes(1),
  limit: 240,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: jsonMessage("Too many requests."),
});
