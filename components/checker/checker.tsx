"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardPaste, Loader2, Lock, ScanSearch, X } from "lucide-react";

import { ResultView } from "@/components/checker/result-view";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSample } from "@/data/weekly-scams";
import { MAX_INPUT_LENGTH, type AnalysisResult } from "@/lib/analyzer";

const EXAMPLES = [
  {
    label: "Kargo SMS’i",
    text: "PTT: Gönderiniz adres bilgisi eksik olduğu için teslim edilemedi. 24 saat içinde güncelleyin: hxxps://ptt-gonderi-takip[.]xyz/TR98",
  },
  {
    label: "Banka uyarısı",
    text: "Garanti BBVA: Kartınız bloke edilmiştir. Bilgilerinizi doğrulayın: garanti-bbva-guvenlik.com",
  },
  {
    label: "Resmi link",
    text: "e-Devlet hizmetlerine https://www.turkiye.gov.tr adresinden ulaşabilirsiniz.",
  },
];

async function requestAnalysis(text: string): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Bir hata oluştu.");
  return data as AnalysisResult;
}

const toMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Bir hata oluştu, tekrar dene.";

/**
 * Adres çubuğundaki ?ornek= değerini okur. Değer değişince "key" sayesinde
 * kontrol kutusu baştan kurulur ve panodaki örnekle dolu açılır.
 */
export function Checker() {
  const sampleId = useSearchParams().get("ornek");
  const sample = getSample(sampleId);
  return <CheckerForm key={sample?.id ?? "bos"} initialText={sample?.message ?? ""} />;
}

function CheckerForm({ initialText }: { initialText: string }) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(initialText));
  const resultRef = useRef<HTMLDivElement>(null);

  const scrollToResult = () =>
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );

  async function run(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Önce kontrol etmek istediğin mesajı veya linki yapıştır.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResult(await requestAnalysis(trimmed));
      scrollToResult();
    } catch (e) {
      setResult(null);
      setError(toMessage(e));
    } finally {
      setLoading(false);
    }
  }

  // Panodan "Bunu analiz et" ile gelindiyse örneği otomatik analiz et
  useEffect(() => {
    if (!initialText) return;
    let cancelled = false;
    requestAnalysis(initialText)
      .then((r) => {
        if (cancelled) return;
        setResult(r);
        scrollToResult();
      })
      .catch((e) => !cancelled && setError(toMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [initialText]);

  async function pasteFromClipboard() {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setText(clip.slice(0, MAX_INPUT_LENGTH));
    } catch {
      setError("Panoya erişilemedi. Metni Ctrl+V ile yapıştırabilirsin.");
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(text);
        }}
        className="rounded-2xl border border-border bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(30,41,90,0.18)]"
      >
        <label htmlFor="message" className="sr-only">
          Şüpheli mesaj veya link
        </label>
        <div className="relative">
          <Textarea
            id="message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void run(text);
            }}
            maxLength={MAX_INPUT_LENGTH}
            rows={5}
            placeholder="Şüpheli SMS’i, WhatsApp mesajını veya linki buraya yapıştır…"
            className="min-h-36 border-0 bg-transparent pr-10 text-[15px] shadow-none focus-visible:ring-0"
          />
          {text && (
            <button
              type="button"
              onClick={() => {
                setText("");
                setResult(null);
                setError(null);
              }}
              className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Metni temizle"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-1 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button type="button" variant="ghost" size="sm" onClick={pasteFromClipboard}>
              <ClipboardPaste /> Yapıştır
            </Button>
            <span className="mx-1 hidden h-4 w-px bg-border sm:block" />
            <span className="text-xs text-muted-foreground">Örnek dene:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => {
                  setText(ex.text);
                  void run(ex.text);
                }}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-foreground"
              >
                {ex.label}
              </button>
            ))}
          </div>
          <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="animate-spin" /> : <ScanSearch />}
            {loading ? "İnceleniyor…" : "Kontrol et"}
          </Button>
        </div>
      </form>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5" aria-hidden />
        Metnin kaydedilmez ve linke tıklanmaz. Sadece yazı incelenir.
      </p>

      {error && (
        <p role="alert" className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div ref={resultRef} className="scroll-mt-24">
        {result && <ResultView result={result} />}
      </div>
    </div>
  );
}
