import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * İçerik Güvenlik Politikası (CSP): tarayıcıya sadece kendi sitemizden
 * script, stil, yazı tipi ve görsel yüklemesine izin verir. XSS ve
 * clickjacking saldırılarına karşı ikinci savunma hattıdır.
 *
 * Ödünleşim: Next.js statik sayfalara küçük satır içi (inline) script'ler gömer.
 * Bunları da yasaklamak için her istekte "nonce" üretmek gerekir; bu da tüm
 * sayfaları dinamik yapar ve statik hızı kaybettirir. Bu yüzden 'unsafe-inline'
 * açık, ama dış kaynaklı script, eklenti (object), iframe'e gömülme ve başka
 * sitelere form gönderimi tamamen kapalı.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // HTTPS'i zorunlu kıl (2 yıl)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Tarayıcı dosya türünü tahmin etmesin
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Site başka bir sitenin içine gömülemesin (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Başka sitelere giderken tam adresimizi sızdırma
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Kamera, mikrofon, konum gibi izinleri tamamen kapat
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
