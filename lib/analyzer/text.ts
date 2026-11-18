/**
 * Metin yardımcıları: normalizasyon, "refang" ve link çıkarma.
 */

const TR_MAP: Record<string, string> = {
  ı: "i",
  ş: "s",
  ğ: "g",
  ü: "u",
  ö: "o",
  ç: "c",
  â: "a",
  î: "i",
  û: "u",
};

/**
 * Türkçe küçük harfe çevirir ve özel karakterleri sadeleştirir.
 * Her karakter tek karaktere dönüştüğü için çıktının uzunluğu girdiyle aynı
 * kalır; böylece bulunan kelimenin orijinal metindeki yeri gösterilebilir.
 */
export function normalizeTr(input: string): string {
  let out = "";
  for (const ch of input) {
    const lower = ch.toLocaleLowerCase("tr-TR");
    // "İ".toLocaleLowerCase("tr") tek karakter "i" verir; güvenlik için ilk karakteri al
    const single = lower.length === ch.length ? lower : lower.slice(0, ch.length);
    out += TR_MAP[single] ?? single;
  }
  return out;
}

/**
 * Güvenlik ekiplerinin linkleri tıklanamaz yapmak için kullandığı
 * "defang" yazımını geri çevirir: hxxps://ornek[.]com → https://ornek.com
 */
export function refang(input: string): string {
  return input
    .replace(/hxxp(s?):\/\//gi, "http$1://")
    .replace(/\[\.\]|\(\.\)|\{\.\}|\[dot\]/gi, ".")
    .replace(/\[:\]\/\//g, "://");
}

// Protokollü ya da www. ile başlayan linkler
const URL_WITH_SCHEME = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/giu;
// Protokolsüz çıplak alan adları: ptt-kargo.xyz/takip gibi
const BARE_DOMAIN =
  /(?<![@\w.\-/])(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+[\p{L}]{2,24}(?::\d{2,5})?(?:\/[^\s<>"'`]*)?/giu;

const TRAILING_PUNCT = /[.,;:!?)\]}'"»”’]+$/u;

export type ExtractedUrl = { raw: string; href: string };

export function extractUrls(text: string): ExtractedUrl[] {
  const found: ExtractedUrl[] = [];
  const seen = new Set<string>();

  const push = (raw: string) => {
    const cleaned = raw.replace(TRAILING_PUNCT, "");
    if (cleaned.length < 4) return;
    const href = /^https?:\/\//i.test(cleaned) ? cleaned : `http://${cleaned}`;
    const key = href.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ raw: cleaned, href });
  };

  // Önce protokollü linkleri bul, sonra metinden çıkarıp çıplak alan adlarına bak
  let rest = text;
  for (const m of text.matchAll(URL_WITH_SCHEME)) {
    push(m[0]);
    rest = rest.replace(m[0], " ");
  }
  for (const m of rest.matchAll(BARE_DOMAIN)) {
    push(m[0]);
  }
  // Çıplak IP adresleri: 185.12.4.9/odeme
  for (const m of rest.matchAll(/(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?::\d{2,5})?(?:\/[^\s<>"'`]*)?/g)) {
    push(m[0]);
  }
  return found;
}

/** Kelime başında eşleşme: "hemen" → "hemen tıklayın" ✓, "şimdihemen" ✗ */
export function findPhrase(normalized: string, phrase: string): number {
  let from = 0;
  while (true) {
    const idx = normalized.indexOf(phrase, from);
    if (idx === -1) return -1;
    const before = idx === 0 ? " " : normalized[idx - 1];
    if (!/[\p{L}\p{N}]/u.test(before)) return idx;
    from = idx + 1;
  }
}

/** İki kelime arasındaki düzenleme mesafesi (Levenshtein) */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return dp[b.length];
}

// Görsel olarak birbirine benzeyen karakterler (homoglyph)
const CONFUSABLES: Record<string, string> = {
  // Kiril harfleri
  а: "a",
  е: "e",
  о: "o",
  р: "p",
  с: "c",
  у: "y",
  х: "x",
  і: "i",
  ј: "j",
  ӏ: "l",
  // Rakam ve harf benzerlikleri
  "0": "o",
  "1": "l",
  "3": "e",
  "5": "s",
  "7": "t",
  "@": "a",
  ı: "i",
};

/** Benzer görünen karakterleri tek bir "iskelete" indirger */
export function skeleton(label: string): string {
  let s = "";
  for (const ch of label.toLowerCase()) s += CONFUSABLES[ch] ?? ch;
  return s.replace(/rn/g, "m").replace(/vv/g, "w").replace(/[il]/g, "l");
}
