import { parse } from "tldts";

import { BRANDS, PHRASE_RULES, RISKY_TLDS, SHORTENERS, type Brand } from "./data";
import {
  editDistance,
  extractUrls,
  findPhrase,
  normalizeTr,
  refang,
  skeleton,
} from "./text";
import type {
  AnalysisResult,
  Finding,
  LinkReport,
  ReputationSummary,
  RiskLevel,
  Severity,
} from "./types";

export type { AnalysisResult, Finding, LinkReport, ReputationSummary, RiskLevel, Severity };

export const MAX_INPUT_LENGTH = 5000;

const WEIGHTS: Record<Severity, number> = { high: 32, medium: 14, low: 6, info: 0 };

function isOfficial(domain: string | null, brand: Brand): boolean {
  if (!domain) return false;
  return brand.official.includes(domain);
}

function officialBrandOf(domain: string | null): Brand | null {
  if (!domain) return null;
  return BRANDS.find((b) => b.official.includes(domain)) ?? null;
}

/** Alan adında marka adı geçiyor mu? Kısa adlar (ptt, sgk) sadece kelime başında aranır. */
function hostMentionsBrand(hostname: string, brand: Brand): boolean {
  const ascii = normalizeTr(hostname);
  const compact = ascii.replace(/[-.]/g, "");
  const tokens = ascii.split(/[-.]/);
  return brand.hostKeywords.some((kw) =>
    kw.length >= 6 ? compact.includes(kw) : tokens.some((t) => t.startsWith(kw))
  );
}

/**
 * Metni analiz eder. Bu fonksiyon hiçbir linke bağlanmaz, sadece metni inceler.
 * (Sunucunun zararlı adreslere istek atmasını önler: SSRF koruması.)
 */
export function analyze(input: string): AnalysisResult {
  const text = refang(input.slice(0, MAX_INPUT_LENGTH));
  const normalized = normalizeTr(text);

  const findings: Finding[] = [];
  const links: LinkReport[] = [];
  const add = (f: Finding) => {
    const existing = findings.find((x) => x.id === f.id);
    if (existing) {
      const merged = new Set([...(existing.evidence ?? []), ...(f.evidence ?? [])]);
      existing.evidence = [...merged];
    } else {
      findings.push(f);
    }
  };

  // ---------- 1) Link analizi ----------
  for (const { raw, href } of extractUrls(text)) {
    let url: URL | null = null;
    try {
      url = new URL(href);
    } catch {
      url = null;
    }
    const parsed = parse(href);
    const hostname = (url?.hostname ?? parsed.hostname ?? "").toLowerCase();
    if (!hostname) continue;
    // Çıplak "kelime.kelime" eşleşmelerini ele: gerçek bir uzantı olmalı ya da IP olmalı
    if (!parsed.isIp && !parsed.isIcann) continue;

    const domain = parsed.domain ?? null;
    const report: LinkReport = {
      raw,
      href,
      hostname,
      registrableDomain: parsed.isIp ? hostname : domain,
      subdomain: parsed.subdomain || null,
      isShortener: !!domain && (SHORTENERS.has(domain) || SHORTENERS.has(hostname)),
      officialBrand: officialBrandOf(domain)?.name ?? null,
      flags: [],
    };
    const flag = (f: Finding) => {
      report.flags.push(f.id);
      add(f);
    };

    if (parsed.isIp) {
      flag({
        id: "ip-host",
        severity: "high",
        title: "Alan adı yerine IP adresi",
        explanation:
          "Gerçek kurumlar sitelerini akılda kalan bir alan adıyla yayınlar. Linkte sadece rakamlardan oluşan bir IP adresi olması, adresin geçici ve gizlenmek istenen bir sunucuya ait olduğunu düşündürür.",
        evidence: [raw],
      });
    }

    // Kullanıcı adı hilesi: https://turkiye.gov.tr@kotu-site.com
    if (url && (url.username || /^[^/]*@/.test(href.replace(/^https?:\/\//i, "")))) {
      flag({
        id: "userinfo-trick",
        severity: "high",
        title: "@ işaretiyle gizlenmiş adres",
        explanation:
          "Linkteki @ işaretinden önceki kısım tarayıcı tarafından yok sayılır. “turkiye.gov.tr@baska-site.com” aslında baska-site.com’a gider.",
        evidence: [raw],
      });
    }

    // Punycode / Latin olmayan karakter
    const rawHost = raw.replace(/^https?:\/\//i, "").split(/[/:?#]/)[0];
    if (hostname.includes("xn--") || /[^\x00-\x7F]/.test(rawHost)) {
      flag({
        id: "punycode",
        severity: "high",
        title: "Benzer görünen harflerle yazılmış adres",
        explanation:
          "Adreste Latin alfabesine benzeyen ama farklı olan harfler (ör. Kiril “а”) var. Göze aynı görünür ama tamamen başka bir siteye gider. Buna “homograf saldırısı” denir.",
        evidence: [raw],
      });
    }

    if (report.isShortener) {
      flag({
        id: "shortener",
        severity: "medium",
        title: "Kısaltılmış link",
        explanation:
          "bit.ly gibi kısaltıcılar linkin nereye gittiğini gizler. Kurumlar resmi bildirimlerde nadiren kullanır; dolandırıcılar ise gerçek adresi saklamak için sık kullanır.",
        evidence: [raw],
      });
    }

    const brandOfficial = officialBrandOf(domain);

    // Marka taklidi: alan adında marka geçiyor ama resmi alan adı değil
    if (!brandOfficial && domain) {
      for (const brand of BRANDS) {
        if (hostMentionsBrand(hostname, brand)) {
          flag({
            id: "brand-impersonation",
            severity: "high",
            title: `${brand.name} taklidi yapan alan adı`,
            explanation: `Adreste “${brand.name}” geçiyor ama site ${brand.name}’e ait değil. Asıl sahibi belirleyen kısım sondaki “${domain}”. ${brand.name}’in resmi adresi: ${brand.official[0]}.`,
            evidence: [raw],
          });
          break;
        }
      }
    }

    // Benzer yazım (typosquatting) ve harf hilesi
    if (!brandOfficial && parsed.domainWithoutSuffix && !report.flags.includes("brand-impersonation")) {
      const label = parsed.domainWithoutSuffix.toLowerCase();
      // Kullanıcıya hileyi göstermek için orijinal yazımı koru (trendyoI'daki büyük I gibi)
      const suffixLabels = (parsed.publicSuffix ?? "").split(".").length;
      const shownLabel = rawHost.split(".").slice(-(suffixLabels + 1))[0] || label;
      const labelSk = skeleton(label);
      const labelAscii = normalizeTr(label).replace(/-/g, "");
      for (const brand of BRANDS) {
        const hit = brand.labels.find((target) => {
          if (target.length < 5 || label === target) return false;
          if (skeleton(target) === labelSk) return true;
          const d = editDistance(labelAscii, target);
          return d > 0 && d <= (target.length >= 8 ? 2 : 1);
        });
        if (hit) {
          flag({
            id: "lookalike",
            severity: "high",
            title: `“${hit}” adına çok benzeyen sahte adres`,
            explanation: `“${shownLabel}” ilk bakışta ${brand.name} gibi görünüyor ama bir-iki harfi farklı. Dolandırıcılar fark edilmesin diye harf değiştirir ya da ekler (ör. l yerine I, o yerine 0). Resmi adres: ${brand.official[0]}.`,
            evidence: [raw],
          });
          break;
        }
      }
    }

    // Marka alt alan adında, asıl alan adı başka (turkiye.gov.tr.giris-yap.com)
    const sub = report.subdomain;
    if (
      !brandOfficial &&
      sub &&
      (/(^|\.)(gov|com|org|net|edu)\.tr(\.|$)/.test(sub) ||
        /\.(com|net|org)$/.test(sub) ||
        BRANDS.some((b) => b.official.some((o) => sub === o || sub.endsWith(`.${o}`))))
    ) {
      flag({
        id: "deceptive-subdomain",
        severity: "high",
        title: "Asıl adres sonda saklanmış",
        explanation: `Adres resmi bir site gibi başlıyor (“${report.subdomain}”) ama bir web adresinin sahibi her zaman en sondaki kısımdır: “${domain}”. Baştaki kısmı herkes istediği gibi yazabilir.`,
        evidence: [raw],
      });
    }

    const tld = parsed.publicSuffix?.split(".").pop() ?? "";
    if (!brandOfficial && !parsed.isIp && RISKY_TLDS.has(tld)) {
      flag({
        id: "risky-tld",
        severity: "low",
        title: `Riskli uzantı: .${tld}`,
        explanation: `.${tld} uzantılı adresler çok ucuz ve kolay alındığı için dolandırıcılık kampanyalarında sık kullanılır. Tek başına kanıt değildir ama diğer işaretlerle birlikte dikkat çekicidir.`,
        evidence: [raw],
      });
    }

    if (!brandOfficial && domain && (domain.match(/-/g)?.length ?? 0) >= 2) {
      flag({
        id: "hyphenated",
        severity: "low",
        title: "Çok tireli, uzun alan adı",
        explanation:
          "“ptt-kargo-teslimat-takip” gibi tirelerle uzatılmış adresler, resmi görünmek için birkaç güven veren kelimeyi bir araya getirir. Resmi kurumların adresleri genellikle kısadır.",
        evidence: [raw],
      });
    }

    if (url?.protocol === "http:" && /^http:\/\//i.test(raw) && !brandOfficial) {
      flag({
        id: "no-https",
        severity: "low",
        title: "Şifrelenmemiş bağlantı (http)",
        explanation:
          "Bu link “https” değil “http” ile başlıyor; yazdıkların şifrelenmeden gider. Ama dikkat: https ve kilit simgesi de sitenin güvenilir olduğunu göstermez, dolandırıcı siteler de kolayca https alabilir.",
        evidence: [raw],
      });
    }

    links.push(report);
  }

  // ---------- 2) Metin kalıpları ----------
  for (const rule of PHRASE_RULES) {
    const evidence: string[] = [];
    const used: number[] = [];
    for (const phrase of rule.phrases) {
      const idx = findPhrase(normalized, phrase);
      // Aynı kelimeyi iki kez gösterme ("kazandınız" ve "kazandın")
      if (idx !== -1 && !used.includes(idx)) {
        used.push(idx);
        evidence.push(text.slice(idx, idx + phrase.length));
        if (evidence.length >= 3) break;
      }
    }
    if (evidence.length) {
      add({
        id: rule.id,
        severity: rule.severity,
        title: rule.title,
        explanation: rule.explanation,
        evidence,
      });
    }
  }

  if (/\bTR\s?\d{2}(?:\s?\d{4}){5}\s?\d{2}\b/i.test(text)) {
    add({
      id: "iban",
      severity: "medium",
      title: "Mesajda IBAN var",
      explanation:
        "Tanımadığın birinin gönderdiği IBAN’a para yatırma. Dolandırıcılar genellikle başkası adına açılmış “aracı” hesaplar kullanır; gönderilen para geri alınamayabilir.",
    });
  }

  // ---------- 3) Mesaj bir markayı anıyor ama link başka yere gidiyor ----------
  if (links.length) {
    for (const brand of BRANDS) {
      const mentioned = brand.mentions.some((m) => findPhrase(normalized, m) !== -1);
      if (!mentioned) continue;
      const foreign = links.filter(
        (l) =>
          !isOfficial(l.registrableDomain, brand) &&
          !l.flags.includes("brand-impersonation") &&
          !l.flags.includes("lookalike")
      );
      if (foreign.length && !links.some((l) => isOfficial(l.registrableDomain, brand))) {
        add({
          id: "brand-mismatch",
          severity: "high",
          title: `Mesaj ${brand.name} adına, link başka bir siteye`,
          explanation: `Mesaj ${brand.name} adına yazılmış ama içindeki link ${brand.name}’e ait değil. ${brand.name}’in resmi adresi ${brand.official[0]}; işlemini her zaman bu adresi kendin yazarak ya da resmi uygulamadan yap.`,
          evidence: foreign.map((l) => l.raw),
        });
        break;
      }
    }
  }

  // ---------- 4) Puanlama ----------
  let score = findings.reduce((sum, f) => sum + WEIGHTS[f.severity], 0);

  const has = (id: string) => findings.some((f) => f.id === id);
  // Link + baskı/bilgi talebi birlikteyse risk katlanır
  if (links.length && (has("urgency") || has("credential-request") || has("money-request"))) {
    score += 10;
  }
  const allOfficial = links.length > 0 && links.every((l) => l.officialBrand);
  if (allOfficial && !findings.some((f) => f.severity === "high")) {
    score -= 15;
    add({
      id: "official-domain",
      severity: "info",
      title: "Link resmi bir alan adına gidiyor",
      explanation:
        "Mesajdaki link bilinen resmi bir alan adına ait. Bu iyi bir işaret; yine de mesajın gerçekten o kurumdan geldiğinden emin değilsen linke tıklamak yerine resmi uygulamayı kullan.",
      evidence: links.map((l) => l.registrableDomain ?? l.hostname),
    });
  }
  // Tek başına bile dolandırıcılığa işaret eden güçlü link hileleri
  const STRONG = ["brand-impersonation", "lookalike", "punycode", "userinfo-trick", "deceptive-subdomain"];
  if (STRONG.some(has)) score = Math.max(score, 60);
  score = Math.max(0, Math.min(100, score));

  const level: RiskLevel = score >= 55 ? "high" : score >= 20 ? "medium" : "low";

  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2, info: 3 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    score,
    level,
    verdict: VERDICTS[level].title,
    summary: VERDICTS[level].summary,
    findings,
    links,
    advice: buildAdvice(level, findings),
  };
}

export const VERDICTS: Record<RiskLevel, { title: string; summary: string }> = {
  high: {
    title: "Yüksek risk",
    summary: "Bu mesaj, dolandırıcılık mesajlarının tipik işaretlerini taşıyor. Linke tıklama, bilgi paylaşma.",
  },
  medium: {
    title: "Şüpheli",
    summary: "Bazı uyarı işaretleri var. Linke tıklamadan önce mesajın kaynağını resmi kanallardan doğrula.",
  },
  low: {
    title: "Belirgin bir işaret bulunamadı",
    summary:
      "Bilinen dolandırıcılık kalıplarına rastlamadık. Bu, kesin güvenli olduğu anlamına gelmez; emin değilsen yine de resmi kanaldan kontrol et.",
  },
};

export function buildAdvice(level: RiskLevel, findings: Finding[]): string[] {
  const ids = new Set(findings.map((f) => f.id));
  const advice: string[] = [];
  if (level !== "low") advice.push("Linke tıklama ve mesajı yanıtlama.");
  if (ids.has("credential-request"))
    advice.push("Şifreni, SMS doğrulama kodunu veya kart bilgini kimseyle paylaşma; kurumlar bunları asla mesajla istemez.");
  if (ids.has("brand-impersonation") || ids.has("brand-mismatch") || ids.has("lookalike") || ids.has("delivery"))
    advice.push("İşlemini kurumun resmi uygulamasından ya da adresi tarayıcıya kendin yazarak kontrol et.");
  if (ids.has("impersonation-family"))
    advice.push("Kişiyi bildiğin eski numarasından arayarak doğrula; para göndermeden önce mutlaka sesini duy.");
  if (ids.has("iban") || ids.has("money-request"))
    advice.push("Tanımadığın hesaplara para gönderme.");
  if (level === "high")
    advice.push("Linke tıkladıysan ve bilgi girdiysen: hemen bankanı ara, şifrelerini değiştir. Oltalama sitelerini USOM’a (usom.gov.tr) bildirebilirsin.");
  if (level === "low")
    advice.push("Gönderen sana tanıdık gelmiyorsa ya da beklemediğin bir mesajsa, yine de temkinli ol.");
  return advice;
}
