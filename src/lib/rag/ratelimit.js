/**
 * A minimal in-memory rate limiter for the RAG demo.
 *
 * Why in-memory: this is a personal site, traffic is low, and the
 * goal is to prevent a single visitor from burning through the
 * Anthropic + Voyage budgets — not to survive a coordinated DDoS.
 * A proper distributed limiter (Upstash, Redis, Cloudflare) would
 * be an overbuild for the current load.
 *
 * Limits are per-IP and per-minute. Each process keeps its own
 * counters, so on Vercel's serverless runtime the effective limit
 * is per cold-start-container — slightly generous in practice,
 * which is the tradeoff we're happy to make.
 */

const buckets = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

/**
 * Check whether a request from `ip` is allowed. Returns:
 *   { allowed: true }                            — proceed
 *   { allowed: false, retryAfterSec: number }   — over limit
 *
 * The limiter is a simple sliding-window counter: we keep the
 * timestamps of recent requests and drop anything outside the
 * window before counting. A proper token bucket would be slightly
 * more lenient at burst edges but this is adequate for the scale.
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  const hits = buckets.get(ip) || [];
  const recent = hits.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = recent[0];
    const retryAfterSec = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - oldest)) / 1000)
    );
    buckets.set(ip, recent);
    return { allowed: false, retryAfterSec };
  }
  recent.push(now);
  buckets.set(ip, recent);
  // Periodically trim the Map so long-running processes don't leak
  // memory. Cheap sweep — O(n) on the number of distinct IPs.
  if (buckets.size > 500) {
    for (const [key, arr] of buckets) {
      if (!arr.some((t) => now - t < WINDOW_MS)) buckets.delete(key);
    }
  }
  return { allowed: true };
}

/**
 * Extract an IP from a Next.js Request. Behind Vercel's edge we
 * can trust `x-forwarded-for`; locally it will be undefined, so
 * we fall back to a string constant to keep limits working in dev.
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "local";
}
