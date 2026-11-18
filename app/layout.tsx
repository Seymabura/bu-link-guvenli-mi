import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Bu Link Güvenli mi? | Şüpheli SMS ve link kontrolü",
    template: "%s | Bu Link Güvenli mi?",
  },
  description: SITE.description,
  keywords: ["dolandırıcılık", "sahte sms", "oltalama", "phishing", "link kontrol", "siber güvenlik"],
  openGraph: {
    title: "Bu Link Güvenli mi?",
    description: "Şüpheli SMS ve linklerdeki dolandırıcılık işaretlerini sade Türkçeyle öğren.",
    locale: "tr_TR",
    type: "website",
    siteName: SITE.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f8f9fc",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
