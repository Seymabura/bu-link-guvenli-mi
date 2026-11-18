import type { Metadata } from "next";
import { CalendarDays, Info } from "lucide-react";

import { ScamCard } from "@/components/scam-card";
import { CURRENT_WEEK, WEEKLY_SCAMS } from "@/data/weekly-scams";

export const metadata: Metadata = {
  title: "Haftanın Dolandırıcılık Mesajları",
  description:
    "Bu hafta Türkiye’de en çok dolaşan sahte SMS, WhatsApp ve sosyal medya mesajları ve onları nasıl anlayacağın.",
};

export default function PanoPage() {
  const categories = [...new Set(WEEKLY_SCAMS.map((s) => s.category))];

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14">
      <header className="mb-10 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden />
          {CURRENT_WEEK.label}
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight">
          Haftanın dolandırıcılık mesajları
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{CURRENT_WEEK.intro}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {WEEKLY_SCAMS.map((s) => (
          <ScamCard key={s.id} sample={s} />
        ))}
      </div>

      <p className="mt-10 flex items-start gap-2 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        Mesajlar, gerçek dolandırıcılık kampanyalarındaki kalıplardan derlenmiş temsili
        örneklerdir. Linkler “hxxps” ve “[.]” ile tıklanamaz hâle getirilmiştir.
      </p>
    </div>
  );
}
