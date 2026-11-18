import { describe, expect, it } from "vitest";

import { clientIp, createRateLimiter } from "./rate-limit";

describe("hız sınırlayıcı", () => {
  it("sınıra kadar izin verir, sonra engeller", () => {
    const check = createRateLimiter({ limit: 3, windowMs: 60_000 });
    const t = 1_000_000;
    expect(check("1.1.1.1", t).ok).toBe(true);
    expect(check("1.1.1.1", t + 1).ok).toBe(true);
    expect(check("1.1.1.1", t + 2).remaining).toBe(0);
    const blocked = check("1.1.1.1", t + 3);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBe(60);
  });

  it("farklı IP'leri ayrı sayar", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(check("a").ok).toBe(true);
    expect(check("b").ok).toBe(true);
    expect(check("a").ok).toBe(false);
  });

  it("pencere geçince tekrar izin verir", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1_000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 500).ok).toBe(false);
    expect(check("a", 1_001).ok).toBe(true);
  });

  it("IP'yi x-forwarded-for başlığının ilk değerinden okur", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "5.6.7.8, 10.0.0.1" } });
    expect(clientIp(req)).toBe("5.6.7.8");
  });
});
