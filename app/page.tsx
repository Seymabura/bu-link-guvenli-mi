import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AtSign,
  ChevronDown,
  Clock,
  Gift,
  Globe,
  KeyRound,
  Link2,
  ScanSearch,
  ShieldCheck,
  Type,
} from "lucide-react";

import { Checker } from "@/components/checker/checker";
import { ScamCard } from "@/components/scam-card";
import { Button } from "@/components/ui/button";
import { CURRENT_WEEK, WEEKLY_SCAMS } from "@/data/weekly-scams";

const SIGNALS = [
  {
    icon: Globe,
    title: "Sahte alan adı",
    text: "“ptt-kargo-takip.xyz” gibi resmi kurumu taklit eden adresler.",
  },
  {
    icon: Type,
    title: "Harf hileleri",
    text: "“trendyoI” (büyük i), Kiril “а” gibi göze aynı görünen karakterler.",
  },
  {
    icon: Link2,
    title: "Gizlenmiş link",
    text: "bit.ly gibi kısaltıcılar, IP adresleri ve @ işaretiyle saklanan hedefler.",
  },
  {
    icon: Clock,
    title: "Aciliyet dili",
    text: "“24 saat içinde”, “hesabınız kapatılacak” gibi seni acele ettiren ifadeler.",
  },
  {
    icon: KeyRound,
    title: "Bilgi talebi",
    text: "Şifre, SMS kodu, kart bilgisi ya da IBAN’a para isteyen mesajlar.",
  },
  {
    icon: Gift,
    title: "Fazla iyi teklifler",
    text: "Çekiliş, hediye, iade, garantili kazanç ve “deneme bonusu” vaatleri.",
  },
];

const STEPS = [
  { n: "01", title: "Yapıştır", text: "Şüpheli SMS’i, WhatsApp mesajını ya da linki kutuya yapıştır." },
  {
    n: "02",
    title: "İnceleyelim",
    text: "Linkin asıl sahibini ve metindeki dolandırıcılık kalıplarını kontrol ederiz. Linke asla tıklamayız.",
  },
  {
    n: "03",
    title: "Anla ve korun",
    text: "Her işaretin neden tehlikeli olduğunu sade bir dille açıklar, ne yapman gerektiğini söyleriz.",
  },
];

const FAQ = [
  {
    q: "Yapıştırdığım mesaj bir yere kaydediliyor mu?",
    a: "Hayır. Metin sadece analiz için sunucuya gönderilir, hiçbir veritabanına ya da log dosyasına yazılmaz. Sonucu paylaşırsan bile mesajın kendisi paylaşılmaz.",
  },
  {
    q: "Siteniz linke tıklıyor ya da linki açıyor mu?",
    a: "Hayır, bu bilinçli bir güvenlik kararı. Linkleri sadece yazı olarak inceleriz. Google Safe Browsing açıksa, adres yalnızca Google’ın kara listesinde sorgulanır; zararlı siteye hiçbir zaman bağlanılmaz.",
  },
  {
    q: "“Belirgin bir işaret bulunamadı” çıktıysa link güvenli midir?",
    a: "Kesin değil. Araç, bilinen dolandırıcılık kalıplarını yakalar ama yepyeni bir yöntemi kaçırabilir. Beklemediğin bir mesajsa, işlemini her zaman kurumun resmi uygulamasından ya da adresi kendin yazarak yap.",
  },
  {
    q: "Linke tıkladım ve bilgilerimi girdim, ne yapmalıyım?",
    a: "Hemen bankanı arayıp kartını kapattır ve internet bankacılığı şifreni değiştir. Aynı şifreyi kullandığın diğer hesapların şifrelerini de değiştir. Oltalama sitesini USOM’a (usom.gov.tr) bildirebilir, gerekirse savcılığa şikâyette bulunabilirsin.",
  },
  {
    q: "Risk skoru nasıl hesaplanıyor?",
    a: "Her işaretin bir ağırlığı var: taklit alan adı gibi güçlü işaretler yüksek, riskli uzantı gibi zayıf işaretler düşük puan ekler. Link ile birlikte aciliyet ya da bilgi talebi varsa risk katlanır. Resmi alan adına giden linkler puanı düşürür.",
  },
];

export default function Home() {
  const trending = WEEKLY_SCAMS.filter((s) => s.trending).slice(0, 3);

  return (
    <>
      {/* HERO + KONTROL */}
      <section id="kontrol" className="relative scroll-mt-16 overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-14 sm:pt-20">
          <div className="mb-9 text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <ShieldCheck className="size-3.5 text-safe" aria-hidden />
              Ücretsiz · Kayıt gerektirmez · Metnin saklanmaz
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Tıklamadan önce <span className="text-primary">bir sor.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
              Şüpheli bir SMS veya link mi geldi? Yapıştır, içindeki dolandırıcılık işaretlerini
              sade bir Türkçeyle açıklayalım.
            </p>
          </div>

          <Suspense fallback={<div className="h-56 rounded-2xl border border-border bg-card" />}>
            <Checker />
          </Suspense>
        </div>
      </section>

      {/* NELERE BAKIYORUZ */}
      <section id="nasil-calisir" className="scroll-mt-20 border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-12 max-w-2xl">
            <p className="mb-2 text-sm font-medium text-primary">Nasıl çalışır?</p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight">
              Dolandırıcıların en sık kullandığı 6 hileye bakıyoruz
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Her kontrol, Türkiye’de yaygın olan oltalama mesajlarından çıkarılmış kurallara
              dayanır. Amaç sadece “riskli” demek değil, nedenini öğretmek.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SIGNALS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border p-5">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="mb-1.5 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4">
                <span className="font-mono text-sm font-medium text-primary">{s.n}</span>
                <div>
                  <h3 className="mb-1 font-semibold">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* En önemli ders */}
          <div className="mt-14 grid items-center gap-6 rounded-2xl bg-primary p-7 text-primary-foreground md:grid-cols-[1fr_1.2fr] md:p-10">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium opacity-80">
                <AtSign className="size-4" aria-hidden /> Tek bir kural hatırla
              </p>
              <h3 className="text-2xl font-semibold tracking-tight">
                Bir adresin sahibi, her zaman en sondaki kısımdır.
              </h3>
            </div>
            <div className="rounded-xl bg-white/10 p-5 font-mono text-sm leading-loose ring-1 ring-white/15 sm:text-base">
              <p className="break-all">
                <span className="opacity-60">https://turkiye.gov.tr.</span>
                <span className="rounded bg-white px-1.5 py-0.5 font-semibold text-danger">
                  giris-dogrula.com
                </span>
                <span className="opacity-60">/login</span>
              </p>
              <p className="mt-2 font-sans text-sm opacity-80">
                Bu link e-Devlet’e değil, <b>giris-dogrula.com</b>’a gider.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PANO ÖNİZLEME */}
      <section className="mx-auto max-w-6xl px-5 pt-20">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-primary">Haftanın panosu · {CURRENT_WEEK.label}</p>
            <h2 className="text-3xl font-semibold tracking-tight">Bu hafta dolaşan mesajlar</h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/pano">
              Tüm panoyu gör <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {trending.map((s) => (
            <ScamCard key={s.id} sample={s} />
          ))}
        </div>
      </section>

      {/* SSS */}
      <section id="sss" className="mx-auto max-w-3xl scroll-mt-20 px-5 pt-24">
        <p className="mb-2 text-center text-sm font-medium text-primary">Sıkça sorulan sorular</p>
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight">Merak edilenler</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium">
                {item.q}
                <ChevronDown
                  className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="-mt-1 pb-5 leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* SON ÇAĞRI */}
      <section className="mx-auto max-w-6xl px-5 pt-20">
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <ScanSearch className="size-8 text-primary" aria-hidden />
          <h2 className="max-w-xl text-balance text-2xl font-semibold tracking-tight">
            Ailende bu mesajlara en çok kim inanır? Bu siteyi ona gönder.
          </h2>
          <Button asChild size="lg">
            <Link href="#kontrol">Bir mesaj kontrol et</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
