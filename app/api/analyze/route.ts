import { NextResponse } from "next/server";

import { analyze, MAX_INPUT_LENGTH } from "@/lib/analyzer";
import { applyReputation } from "@/lib/analyzer/reputation";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { checkSafeBrowsing } from "@/lib/reputation/safe-browsing";

/**
 * POST /api/analyze  { text: string }
 *
 * Güvenlik notları:
 * - Gönderilen metin hiçbir yere kaydedilmez.
 * - Sunucu, metindeki linklere ASLA istek atmaz (SSRF koruması).
 *   Safe Browsing açıksa linkin sadece adresi Google'a sorulur.
 * - IP başına dakikada 20 istek sınırı vardır.
 */

const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(request: Request) {
  const rate = limiter(clientIp(request));
  if (!rate.ok) {
    return json(
      { error: `Çok fazla istek gönderdin. Lütfen ${rate.retryAfter} saniye sonra tekrar dene.` },
      429,
      { "Retry-After": String(rate.retryAfter) }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "İstek JSON biçiminde olmalı." }, 415);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Geçersiz istek." }, 400);
  }

  const text =
    typeof body === "object" && body !== null && "text" in body
      ? (body as { text: unknown }).text
      : undefined;

  if (typeof text !== "string" || text.trim().length === 0) {
    return json({ error: "Lütfen kontrol etmek istediğin mesajı veya linki yapıştır." }, 400);
  }
  if (text.length > MAX_INPUT_LENGTH) {
    return json({ error: `Metin çok uzun (en fazla ${MAX_INPUT_LENGTH} karakter).` }, 413);
  }

  let result = analyze(text);

  if (result.links.length > 0) {
    const reputation = await checkSafeBrowsing(result.links.map((l) => l.href));
    result = applyReputation(result, reputation);
  }

  return json(result, 200, { "X-RateLimit-Remaining": String(rate.remaining) });
}
