/** Sitenin genel ayarları: adres, isim, GitHub linki */
export const SITE = {
  name: "Bu Link Güvenli mi?",
  description:
    "Şüpheli bir SMS veya link mi aldın? Yapıştır, dolandırıcılık işaretlerini sade bir Türkçeyle açıklayalım: sahte alan adı, aciliyet dili, kısaltılmış link ve daha fazlası.",
  // Vercel'de NEXT_PUBLIC_SITE_URL ayarlanınca otomatik olarak o kullanılır
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://bu-link-guvenli-mi.vercel.app").replace(/\/$/, ""),
  github: "https://github.com/Seymabura/bu-link-guvenli-mi",
};
