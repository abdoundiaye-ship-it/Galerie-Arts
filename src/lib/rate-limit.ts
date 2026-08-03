import "server-only";

// Sliding-window rate limiter, in-memory per server instance. Good enough
// for a single-region Vercel deployment at this scale; if traffic grows
// across multiple regions/instances, swap this Map for a shared store
// (Upstash Redis, Supabase table) behind the same checkRateLimit signature.
const buckets = new Map<string, number[]>();

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function checkRateLimit(key: string, { windowMs, maxRequests }: RateLimitOptions): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    buckets.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return true;
}
