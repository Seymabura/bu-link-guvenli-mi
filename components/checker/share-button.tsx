"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/analyzer";

/**
 * Sonucu paylaşır. Gizlilik için kullanıcının mesajı ASLA paylaşılmaz;
 * sadece karar ve bulunan işaretlerin başlıkları gider.
 */
export function ShareButton({ result }: { result: AnalysisResult }) {
  const [copied, setCopied] = useState(false);

  const signals = result.findings
    .filter((f) => f.severity !== "info")
    .slice(0, 3)
    .map((f) => `• ${f.title}`)
    .join("\n");

  const url = typeof window !== "undefined" ? window.location.origin : "";
  const text = [
    `“Bu Link Güvenli mi?” sonucu: ${result.verdict} (${result.score}/100)`,
    signals,
    "Sen de şüpheli mesajlarını tıklamadan önce kontrol et:",
  ]
    .filter(Boolean)
    .join("\n");

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Bu Link Güvenli mi?", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Kullanıcı paylaşımı iptal etti; bir şey yapmaya gerek yok
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={share}>
      {copied ? <Check /> : <Share2 />}
      {copied ? "Kopyalandı" : "Sonucu paylaş"}
    </Button>
  );
}
