import Link from "next/link";
import { ArrowRight, AtSign, Camera, Mail, MessageCircle, MessageSquareText, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Channel, ScamSample } from "@/data/weekly-scams";

const CHANNEL_ICON: Record<Channel, typeof Mail> = {
  SMS: MessageSquareText,
  WhatsApp: MessageCircle,
  "E-posta": Mail,
  Instagram: Camera,
};

export function ScamCard({ sample }: { sample: ScamSample }) {
  const ChannelIcon = CHANNEL_ICON[sample.channel] ?? AtSign;
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <ChannelIcon aria-hidden /> {sample.channel}
          </Badge>
          <Badge variant="default">{sample.category}</Badge>
        </div>
        {sample.trending && (
          <Badge variant="danger">
            <TrendingUp aria-hidden /> Yükselişte
          </Badge>
        )}
      </div>

      <h3 className="mb-3 font-semibold leading-snug">{sample.title}</h3>

      {/* Telefon bildirimi görünümünde mesaj */}
      <div className="mb-4 rounded-xl bg-muted/70 p-3.5">
        <p className="mb-1.5 font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {sample.sender}
        </p>
        <p className="text-sm leading-relaxed text-foreground/85">{sample.message}</p>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Nasıl anlarsın? </span>
        {sample.tell}
      </p>

      <Link
        href={`/?ornek=${sample.id}#kontrol`}
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
      >
        Bunu analiz et <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}
