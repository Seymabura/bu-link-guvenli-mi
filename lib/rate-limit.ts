/**
 * Basit "kayan pencere" hız sınırlayıcı (sliding window rate limiter).
 *
 * Her IP adresi için son istek zamanlarını bellekte tutar.
 * Not: Vercel gibi sunucusuz ortamlarda her sunucu örneğinin belleği ayrıdır,
 * bu yüzden bu sınır "en iyi çaba" düzeyindedir. Trafik büyürse
 * Redis tabanlı bir çözüme (ör. Upstash) geçilebilir; arayüz aynı kalır.
 */

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Tekrar denemeden önce beklenecek süre (saniye) */
  retryAfter: number;
};

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  return function check(key: string, now: number = Date.now()): RateLimitResult {
    const windowStart = now - windowMs;
    const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

    if (recent.length >= limit) {
      hits.set(key, recent);
      const retryAfter = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
      return { ok: false, remaining: 0, retryAfter };
    }

    recent.push(now);
    hits.set(key, recent);

    // Belleğin şişmemesi için ara sıra eski kayıtları temizle
    if (hits.size > 5000) {
      for (const [k, times] of hits) {
        if (times.every((t) => t <= windowStart)) hits.delete(k);
      }
    }

    return { ok: true, remaining: limit - recent.length, retryAfter: 0 };
  };
}

/** İstekten istemcinin IP adresini okur (Vercel x-forwarded-for başlığını doldurur) */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "anonim";
}
