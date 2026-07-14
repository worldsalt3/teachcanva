/**
 * Minimal fixed-window rate limiter for API route handlers.
 *
 * In-memory per server instance — fine for a single Node/dev deployment; swap
 * for Redis/Upstash when running many serverless instances.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  /** Max requests per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

/** Returns true when the request identified by `key` is allowed. */
export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // Opportunistic cleanup so the map doesn't grow unbounded.
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k);
    }
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** Best-effort client identifier from proxy headers. */
export function clientKey(request: Request, scope: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  return `${scope}:${ip}`;
}
