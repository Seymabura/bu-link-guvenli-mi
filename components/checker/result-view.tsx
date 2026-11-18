import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Link2,
  ListChecks,
  OctagonAlert,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";

import { ShareButton } from "@/components/checker/share-button";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult, Finding, LinkReport, RiskLevel, Severity } from "@/lib/analyzer";
import { cn } from "@/lib/utils";

const LEVEL_STYLE: Record<
  RiskLevel,
  { ring: string; text: string; bg: string; icon: typeof ShieldAlert }
> = {
  high: { ring: "stroke-danger", text: "text-danger", bg: "bg-danger/[0.06]", icon: ShieldAlert },
  medium: {
    ring: "stroke-warning",
    text: "text-warning-foreground",
    bg: "bg-warning/[0.08]",
    icon: ShieldQuestion,
  },
  low: { ring: "stroke-safe", text: "text-safe", bg: "bg-safe/[0.06]", icon: ShieldCheck },
};

const SEVERITY: Record<
  Severity,
  { label: string; variant: "danger" | "warning" | "outline" | "safe"; icon: typeof Info; color: string }
> = {
  high: { label: "Yüksek", variant: "danger", icon: OctagonAlert, color: "text-danger" },
  medium: { label: "Orta", variant: "warning", icon: AlertTriangle, color: "text-warning-foreground" },
  low: { label: "Düşük", variant: "outline", icon: Info, color: "text-muted-foreground" },
  info: { label: "Bilgi", variant: "safe", icon: CheckCircle2, color: "text-safe" },
};

function ScoreRing({ score, level }: { score: number; level: RiskLevel }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-28 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} className="fill-none stroke-border" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          className={cn("fill-none transition-[stroke-dashoffset] duration-700", LEVEL_STYLE[level].ring)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.max(score, 3)) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-semibold tabular-nums", LEVEL_STYLE[level].text)}>
          {score}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">risk / 100</span>
      </div>
    </div>
  );
}

/** Linki parçalarına ayırıp asıl sahibini (kayıtlı alan adını) vurgular */
function LinkAnatomy({ link }: { link: LinkReport }) {
  const host = link.hostname;
  const domain = link.registrableDomain ?? host;
  const idx = host.lastIndexOf(domain);
  const before = idx > 0 ? host.slice(0, idx) : "";
  const afterHost = link.raw.replace(/^https?:\/\//i, "").slice(host.length);
  const scheme = link.raw.match(/^https?:\/\//i)?.[0] ?? "";
  const suspicious = link.flags.some((f) => f !== "official-domain");

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="break-all font-mono text-sm leading-relaxed sm:text-[15px]">
        <span className="text-muted-foreground">{scheme}</span>
        <span className="text-muted-foreground">{before}</span>
        <span
          className={cn(
            "rounded px-1 py-0.5 font-semibold",
            link.officialBrand
              ? "bg-safe/15 text-safe"
              : suspicious
                ? "bg-danger/10 text-danger"
                : "bg-primary/10 text-primary"
          )}
        >
          {domain}
        </span>
        <span className="text-muted-foreground">{afterHost}</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Asıl sahibi: <span className="font-medium text-foreground">{domain}</span>
        {link.officialBrand && <> · {link.officialBrand} resmi alan adı</>}
        {link.isShortener && <> · Kısaltıcı, gerçek hedef gizli</>}
      </p>
    </div>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const s = SEVERITY[finding.severity];
  const Icon = s.icon;
  return (
    <li className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
      <Icon className={cn("mt-0.5 size-5 shrink-0", s.color)} aria-hidden />
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-medium leading-snug">{finding.title}</h4>
          <Badge variant={s.variant}>{s.label}</Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{finding.explanation}</p>
        {finding.evidence && finding.evidence.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {finding.evidence.map((e) => (
              <code
                key={e}
                className="max-w-full truncate rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs"
              >
                {e}
              </code>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export function ResultView({ result }: { result: AnalysisResult }) {
  const style = LEVEL_STYLE[result.level];
  const Icon = style.icon;
  const risky = result.findings.filter((f) => f.severity !== "info");
  const infos = result.findings.filter((f) => f.severity === "info");

  return (
    <div className="animate-fade-up space-y-5" aria-live="polite">
      {/* Karar */}
      <div className={cn("flex flex-col gap-5 rounded-2xl border border-border p-6 sm:flex-row sm:items-center", style.bg)}>
        <ScoreRing score={result.score} level={result.level} />
        <div className="space-y-2">
          <div className={cn("flex items-center gap-2 text-xl font-semibold", style.text)}>
            <Icon className="size-6" aria-hidden />
            {result.verdict}
          </div>
          <p className="leading-relaxed text-foreground/80">{result.summary}</p>
          <p className="text-xs text-muted-foreground">
            {risky.length > 0
              ? `${risky.length} uyarı işareti bulundu.`
              : "Uyarı işareti bulunamadı."}{" "}
            {result.links.length > 0 && `${result.links.length} link incelendi.`}{" "}
            {result.reputation?.status === "checked" &&
              result.reputation.matches.length === 0 &&
              `${result.reputation.provider} kara listesinde kayıt yok.`}
          </p>
        </div>
        <div className="sm:ml-auto sm:self-start">
          <ShareButton result={result} />
        </div>
      </div>

      {result.links.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-1 flex items-center gap-2 font-semibold">
            <Link2 className="size-5 text-primary" aria-hidden />
            Link nereye gidiyor?
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Bir adresin sahibi her zaman en sondaki kısımdır, baştaki kısmı herkes istediği gibi
            yazabilir.
          </p>
          <div className="space-y-3">
            {result.links.map((l) => (
              <LinkAnatomy key={l.raw} link={l} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Bulgular */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <ListChecks className="size-5 text-primary" aria-hidden />
            Ne bulduk?
          </h3>
          {result.findings.length > 0 ? (
            <ul className="divide-y divide-border">
              {[...risky, ...infos].map((f) => (
                <FindingRow key={f.id} finding={f} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Bilinen dolandırıcılık kalıplarından hiçbirine rastlamadık.
            </p>
          )}
        </section>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-6">
            <h3 className="mb-3 font-semibold">Ne yapmalısın?</h3>
            <ul className="space-y-2.5 text-sm leading-relaxed">
              {result.advice.map((a) => (
                <li key={a} className="flex gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
