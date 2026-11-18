import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-sm text-muted-foreground md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <LogoMark className="size-6" />
            Bu Link Güvenli mi?
          </div>
          <p className="max-w-sm leading-relaxed">
            Şüpheli SMS ve linklerdeki dolandırıcılık işaretlerini sade bir Türkçeyle
            açıklayan, eğitim amaçlı ücretsiz bir araç. Sonuçlar tavsiye niteliğindedir;
            kesin güvenlik garantisi vermez.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Site</p>
          <ul className="space-y-1.5">
            <li>
              <Link href="/#kontrol" className="hover:text-foreground">
                Mesaj kontrol et
              </Link>
            </li>
            <li>
              <Link href="/pano" className="hover:text-foreground">
                Haftanın dolandırıcılık mesajları
              </Link>
            </li>
            <li>
              <Link href="/#nasil-calisir" className="hover:text-foreground">
                Nasıl çalışır?
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Dolandırıldıysan</p>
          <ul className="space-y-1.5">
            <li>Hemen bankanı ara ve kartını kapat.</li>
            <li>Şifrelerini değiştir.</li>
            <li>
              Oltalama sitesini{" "}
              <a
                href="https://www.usom.gov.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                USOM
              </a>
              ’a bildir.
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Yapıştırdığın metinler kaydedilmez. Sitemiz kontrol ettiğin linklere hiçbir zaman
            kendisi bağlanmaz.
          </p>
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 underline-offset-4 hover:text-foreground hover:underline"
          >
            Açık kaynak · Kodu GitHub’da incele
          </a>
        </div>
      </div>
    </footer>
  );
}
