/**
 * In-memory sliding window limiter (decision D-007). One Railway replica, so
 * a Map is enough. State resets on deploy; that is acceptable at this scale.
 * At 2+ replicas, swap the body for Redis and keep the signature.
 */
const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): { ok: boolean; retryAfterS: number } {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    const retryAfterS = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
    return { ok: false, retryAfterS };
  }

  recent.push(now);
  hits.set(key, recent);

  // Bound memory: when the map is large, drop keys whose hits have all expired.
  if (hits.size > MAX_KEYS) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
    // Still full of live keys (attack): drop the oldest-inserted ones.
    for (const k of hits.keys()) {
      if (hits.size <= MAX_KEYS) break;
      hits.delete(k);
    }
  }
  return { ok: true, retryAfterS: 0 };
}
