import { buildAdvice, VERDICTS } from "./index";
import type { AnalysisResult, ReputationSummary } from "./types";

const THREAT_TR: Record<string, string> = {
  MALWARE: "zararlı yazılım",
  SOCIAL_ENGINEERING: "oltalama / sosyal mühendislik",
  UNWANTED_SOFTWARE: "istenmeyen yazılım",
  POTENTIALLY_HARMFUL_APPLICATION: "zararlı olabilecek uygulama",
};

export function describeThreat(type: string): string {
  return THREAT_TR[type] ?? type.toLowerCase().replace(/_/g, " ");
}

/**
 * Kural tabanlı analiz sonucuna dış itibar servisinin (Safe Browsing) cevabını ekler.
 * Bir link kara listedeyse sonuç her koşulda "Yüksek risk" olur.
 */
export function applyReputation(
  result: AnalysisResult,
  reputation: ReputationSummary
): AnalysisResult {
  const out: AnalysisResult = { ...result, findings: [...result.findings], reputation };

  if (reputation.status === "checked" && reputation.matches.length > 0) {
    const types = [...new Set(reputation.matches.flatMap((m) => m.threatTypes))].map(describeThreat);
    out.findings.unshift({
      id: "blocklisted",
      severity: "high",
      title: `${reputation.provider} bu linki tehlikeli olarak işaretlemiş`,
      explanation: `Bu adres, ${reputation.provider} kara listesinde “${types.join(", ")}” olarak kayıtlı. Yani daha önce başka kullanıcılara da zarar vermek için kullanıldığı biliniyor. Kesinlikle açma.`,
      evidence: reputation.matches.map((m) => m.url),
    });
    out.score = Math.max(out.score, 95);
    out.level = "high";
    out.verdict = VERDICTS.high.title;
    out.summary = VERDICTS.high.summary;
    out.advice = buildAdvice("high", out.findings);
  }

  return out;
}
