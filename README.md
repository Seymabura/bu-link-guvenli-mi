# Bu Link Güvenli mi?

Şüpheli SMS, WhatsApp mesajı veya linkleri inceleyip içindeki **dolandırıcılık (oltalama / phishing) işaretlerini sade bir Türkçeyle açıklayan** web uygulaması. Bir de Türkiye'de o hafta dolaşan sahte mesajları gösteren **"Haftanın Dolandırıcılık Mesajları"** panosu var.

> Amaç sadece "riskli" demek değil, kullanıcıya **neden** riskli olduğunu öğretmek.

## Özellikler

- **Link analizi**: linkin asıl sahibini (kayıtlı alan adını) bulur ve vurgular
  - Marka taklidi (`ptt-gonderi-takip.xyz`, `garanti-bbva-guvenlik.com`)
  - Benzer yazım / typosquatting (`trendyoI.com`, `hepsiburda.com`), Levenshtein mesafesi ile
  - Homograf saldırıları (Kiril harfler, punycode `xn--`)
  - Asıl adresin sonda saklandığı alt alan adları (`turkiye.gov.tr.giris-dogrula.com`)
  - `@` hilesi, IP adresli linkler, link kısaltıcılar, riskli uzantılar, `http`
- **Metin analizi**: aciliyet dili, şifre/kod/kart bilgisi talebi, kargo bahanesi, ödül vaadi, "anne numaram değişti", IBAN, yasa dışı bahis/yatırım kalıpları (Türkçe karakter normalizasyonu ile)
- **Risk skoru (0–100)**, sade açıklamalar ve "Ne yapmalısın?" önerileri
- **Defang desteği**: `hxxps://site[.]com` biçimindeki linkleri de okur
- **Haftanın panosu**: temsili örnekler, tek tıkla analiz
- **Google Safe Browsing (v5)** entegrasyonu (isteğe bağlı): kara listedeki linkler her koşulda "Yüksek risk"
- **Sonucu paylaş**: mesajın kendisi paylaşılmadan, sadece karar ve işaretler
- SEO: dinamik paylaşım görseli (Open Graph), sitemap, robots

## Güvenlik tasarımı

| Önlem | Neden |
|---|---|
| **Linklere asla bağlanılmaz** | Sunucu, yapıştırılan linklere istek atmaz; metni statik inceler. Bu, sunucunun iç ağa ya da zararlı sitelere istek atmaya zorlanmasını (**SSRF**) engeller. Safe Browsing açıksa adres yalnızca Google'a sorulur. |
| **Gizlilik** | Metin kaydedilmez, loglanmaz; cevaplar `Cache-Control: no-store`. |
| **Girdi doğrulama** | İçerik türü (`415`), tip, boşluk ve uzunluk (en fazla 5000 karakter, `413`) kontrolleri. |
| **Hız sınırı** | IP başına dakikada 20 istek, aşılınca `429` + `Retry-After`. Bellek içi kayan pencere; ölçek büyürse Redis'e taşınabilir. |
| **Content-Security-Policy** | Sadece kendi kaynaklarımız; dış script, `object`, iframe'e gömülme (`frame-ancestors 'none'`) ve dış form gönderimi kapalı. |
| **Diğer başlıklar** | HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (kamera/mikrofon/konum kapalı), `X-Powered-By` gizli. |
| **Gizli anahtarlar** | API anahtarları yalnızca sunucuda, ortam değişkeninde; `.env.local` Git'e girmez. |
| **Dürüst sonuç** | "Düşük risk" çıksa bile kullanıcıya **"güvenli"** denmez; statik analiz kesinlik vermez. |

**CSP ödünleşimi:** Next.js statik sayfalara küçük satır içi script'ler gömer. Bunları da yasaklamak için her istekte bir *nonce* üretmek gerekir, bu da tüm sayfaları dinamik hâle getirip statik hızı kaybettirir. Bu proje statik sayfalar + `'unsafe-inline'` yolunu seçti; dış kaynaklı script yüklemesi ise tamamen kapalı.

## Teknolojiler

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui (Radix) · tldts (Public Suffix List) · Vitest · Vercel

## Proje yapısı

```
app/
  page.tsx               Ana sayfa (kontrol aracı)
  pano/page.tsx          Haftanın dolandırıcılık mesajları
  api/analyze/route.ts   POST /api/analyze
lib/analyzer/
  index.ts               Analiz motoru ve puanlama
  reputation.ts          Dış itibar sonucunu (Safe Browsing) analize ekler
  data.ts                Markalar, kısaltıcılar, riskli uzantılar, metin kalıpları
  text.ts                Normalizasyon, link çıkarma, benzerlik fonksiyonları
  analyzer.test.ts       Birim testleri
lib/reputation/          Google Safe Browsing istemcisi (önbellekli, zaman aşımlı)
lib/rate-limit.ts        Hız sınırlayıcı
data/weekly-scams.ts     Pano verisi
components/              Arayüz bileşenleri
```

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # birim testleri (27 test)
```

### Google Safe Browsing'i açmak (isteğe bağlı)

1. [Google Cloud Console](https://console.cloud.google.com/)'da bir proje oluştur, **Safe Browsing API**'yi etkinleştir ve bir API anahtarı al.
2. `.env.example` dosyasını `.env.local` adıyla kopyala ve `GOOGLE_SAFE_BROWSING_API_KEY` değerini doldur.
3. Vercel'de aynı değişkeni *Settings → Environment Variables* altına ekle.

Anahtar yoksa site yalnızca kendi kurallarıyla çalışır. Not: Google Safe Browsing API ticari olmayan kullanım içindir; ticari kullanımda Google Web Risk API önerilir.

## Yol haritası

- [x] Google Safe Browsing API entegrasyonu
- [x] Hız sınırlama (rate limiting)
- [ ] VirusTotal URL taraması
- [ ] Kullanıcı ihbarlarıyla beslenen pano (veritabanı)
- [ ] Kısaltılmış linklerin hedefini güvenli bir servis üzerinden çözme
