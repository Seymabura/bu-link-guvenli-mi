export type Severity = "high" | "medium" | "low" | "info";

export type Finding = {
  /** Kuralın benzersiz kimliği (testlerde ve arayüzde kullanılır) */
  id: string;
  severity: Severity;
  /** Kısa başlık: "Taklit alan adı" gibi */
  title: string;
  /** Sade Türkçe açıklama: neden tehlikeli? */
  explanation: string;
  /** Metinde bulunan kanıt (link, kelime vb.) */
  evidence?: string[];
};

export type LinkReport = {
  /** Metinde yazıldığı hâli */
  raw: string;
  /** Protokolü eklenmiş, sorgulamaya hazır hâli */
  href: string;
  hostname: string;
  /** Asıl sahibi belirleyen kısım: ornek.com, turkiye.gov.tr */
  registrableDomain: string | null;
  subdomain: string | null;
  isShortener: boolean;
  /** Linkin ait olduğu resmi marka (varsa) */
  officialBrand: string | null;
  /** Bu linke özel bulgu kimlikleri */
  flags: string[];
};

export type RiskLevel = "high" | "medium" | "low";

export type AnalysisResult = {
  score: number;
  level: RiskLevel;
  verdict: string;
  summary: string;
  findings: Finding[];
  links: LinkReport[];
  advice: string[];
  /** Dış itibar servisi (Google Safe Browsing) sonucu */
  reputation?: ReputationSummary;
};

export type ReputationSummary = {
  provider: string;
  /** checked: sorgulandı · disabled: anahtar yok · error: servise ulaşılamadı */
  status: "checked" | "disabled" | "error";
  matches: { url: string; threatTypes: string[] }[];
};
