import type { ReputationSummary } from "@/lib/analyzer";

/**
 * Google Safe Browsing API (v5, urls:search) istemcisi.
 *
 * Güvenlik notu: Linklere biz bağlanmayız; sadece adresi Google'a sorarız.
 * API anahtarı yalnızca sunucuda (ortam değişkeni) durur, tarayıcıya gönderilmez.
 * Belgeler: https://developers.google.com/safe-browsing/reference/rest/v5/urls/search
 */

const ENDPOINT = "https://safebrowsing.googleapis.com/v5/urls:search";
const PROVIDER = "Google Safe Browsing";
const MAX_URLS = 50; // API sınırı
const TIMEOUT_MS = 3000;

type CacheEntry = { matches: ReputationSummary["matches"]; expires: number };
const cache = new Map<string, CacheEntry>();

function parseDuration(value: unknown): number {
  // "300s" veya "3.5s" biçimi → milisaniye
  const seconds = typeof value === "string" ? parseFloat(value) : NaN;
  return Number.isFinite(seconds) ? seconds * 1000 : 5 * 60_000;
}

export async function checkSafeBrowsing(
  urls: string[],
  apiKey: string | undefined = process.env.GOOGLE_SAFE_BROWSING_API_KEY
): Promise<ReputationSummary> {
  if (!apiKey) return { provider: PROVIDER, status: "disabled", matches: [] };

  const unique = [...new Set(urls)].slice(0, MAX_URLS);
  if (unique.length === 0) return { provider: PROVIDER, status: "checked", matches: [] };

  // Önbellekte olanları tekrar sorma (API kuralı: negatif sonuçlar da önbelleğe alınmalı)
  const now = Date.now();
  const cachedMatches: ReputationSummary["matches"] = [];
  const toQuery: string[] = [];
  for (const url of unique) {
    const hit = cache.get(url);
    if (hit && hit.expires > now) cachedMatches.push(...hit.matches);
    else toQuery.push(url);
  }
  if (toQuery.length === 0) {
    return { provider: PROVIDER, status: "checked", matches: cachedMatches };
  }

  const params = new URLSearchParams();
  for (const url of toQuery) params.append("urls", url);
  params.set("key", apiKey);

  try {
    const res = await fetch(`${ENDPOINT}?${params}`, {
      headers: { "User-Agent": "bu-link-guvenli-mi/1.0" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Safe Browsing HTTP ${res.status}`);

    const data = (await res.json()) as {
      threats?: { url?: string; threatTypes?: string[] }[];
      cacheDuration?: string;
    };
    const matches = (data.threats ?? [])
      .filter((t): t is { url: string; threatTypes?: string[] } => typeof t.url === "string")
      .map((t) => ({ url: t.url, threatTypes: t.threatTypes ?? [] }));

    const expires = now + Math.min(parseDuration(data.cacheDuration), 24 * 60 * 60_000);
    for (const url of toQuery) {
      // Google, adresin üst alan adı/yol eşleşmelerini de döndürebilir (gönderdiğimizden farklı URL).
      // Tek adres sorduysak tüm eşleşmeler ona aittir.
      const own = toQuery.length === 1 ? matches : matches.filter((m) => m.url === url);
      cache.set(url, { matches: own, expires });
    }

    return { provider: PROVIDER, status: "checked", matches: [...cachedMatches, ...matches] };
  } catch (error) {
    console.error("[safe-browsing]", error instanceof Error ? error.message : error);
    return { provider: PROVIDER, status: "error", matches: cachedMatches };
  }
}
