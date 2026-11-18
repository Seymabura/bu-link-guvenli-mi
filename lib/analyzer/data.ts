/**
 * Analiz motorunun bilgi tabanı.
 * Yeni bir marka, kısaltıcı ya da dolandırıcılık kalıbı eklemek için
 * sadece bu dosyayı düzenlemek yeterli.
 *
 * Not: Metin kalıpları "normalize" edilmiş hâlde yazılır:
 * küçük harf + Türkçe karakterler sadeleştirilmiş (ş→s, ı→i, ğ→g, ü→u, ö→o, ç→c).
 */

export type Brand = {
  name: string;
  /** Markaya ait resmi (kayıtlı) alan adları */
  official: string[];
  /** Alan adında geçerse taklit şüphesi doğuran parçalar (tire/nokta olmadan) */
  hostKeywords: string[];
  /** Benzer yazım (typosquatting) kontrolü için asıl etiketler */
  labels: string[];
  /** Mesaj metninde markanın anıldığını gösteren ifadeler */
  mentions: string[];
};

export const BRANDS: Brand[] = [
  {
    name: "e-Devlet",
    official: ["turkiye.gov.tr"],
    hostKeywords: ["edevlet", "turkiyegov", "edevletkapisi"],
    labels: ["turkiye", "edevlet"],
    mentions: ["e-devlet", "edevlet", "e devlet"],
  },
  {
    name: "PTT",
    official: ["ptt.gov.tr", "pttavm.com", "pttbank.com.tr"],
    hostKeywords: ["ptt"],
    labels: ["pttavm"],
    mentions: ["ptt"],
  },
  {
    name: "Gelir İdaresi (GİB)",
    official: ["gib.gov.tr", "hazine.gov.tr"],
    hostKeywords: ["gib", "gelirdaresi", "gelirlerdaresi", "vergiiade"],
    labels: [],
    mentions: ["gelir idaresi", "vergi iadesi", "vergi borcu"],
  },
  {
    name: "SGK",
    official: ["sgk.gov.tr"],
    hostKeywords: ["sgk"],
    labels: [],
    mentions: ["sgk", "sosyal guvenlik"],
  },
  {
    name: "HGS / KGM",
    official: ["kgm.gov.tr", "hgs.com.tr", "ptt.gov.tr"],
    hostKeywords: ["hgs", "kgm", "otoyol"],
    labels: [],
    mentions: ["hgs", "ogs", "otoyol gecis", "kopru gecis"],
  },
  {
    name: "Ziraat Bankası",
    official: ["ziraatbank.com.tr", "ziraat.com.tr"],
    hostKeywords: ["ziraat"],
    labels: ["ziraatbank", "ziraat"],
    mentions: ["ziraat"],
  },
  {
    name: "Garanti BBVA",
    official: ["garantibbva.com.tr", "garanti.com.tr", "bonus.com.tr"],
    hostKeywords: ["garantibbva", "garantibank"],
    labels: ["garantibbva"],
    mentions: ["garanti bbva", "garanti bankasi"],
  },
  {
    name: "İş Bankası",
    official: ["isbank.com.tr", "maximum.com.tr"],
    hostKeywords: ["isbank", "isbankasi"],
    labels: ["isbank"],
    mentions: ["is bankasi", "isbank"],
  },
  {
    name: "Akbank",
    official: ["akbank.com", "akbank.com.tr"],
    hostKeywords: ["akbank"],
    labels: ["akbank"],
    mentions: ["akbank"],
  },
  {
    name: "Yapı Kredi",
    official: ["yapikredi.com.tr", "worldcard.com.tr"],
    hostKeywords: ["yapikredi"],
    labels: ["yapikredi"],
    mentions: ["yapi kredi", "yapikredi"],
  },
  {
    name: "VakıfBank",
    official: ["vakifbank.com.tr"],
    hostKeywords: ["vakifbank"],
    labels: ["vakifbank"],
    mentions: ["vakifbank"],
  },
  {
    name: "Halkbank",
    official: ["halkbank.com.tr"],
    hostKeywords: ["halkbank"],
    labels: ["halkbank"],
    mentions: ["halkbank", "halk bankasi"],
  },
  {
    name: "QNB",
    official: ["qnb.com.tr", "enpara.com"],
    hostKeywords: ["qnbfinans", "qnb", "enpara"],
    labels: ["enpara"],
    mentions: ["qnb", "enpara"],
  },
  {
    name: "Papara",
    official: ["papara.com"],
    hostKeywords: ["papara"],
    labels: ["papara"],
    mentions: ["papara"],
  },
  {
    name: "Trendyol",
    official: ["trendyol.com"],
    hostKeywords: ["trendyol"],
    labels: ["trendyol"],
    mentions: ["trendyol"],
  },
  {
    name: "Hepsiburada",
    official: ["hepsiburada.com"],
    hostKeywords: ["hepsiburada"],
    labels: ["hepsiburada"],
    mentions: ["hepsiburada"],
  },
  {
    name: "Yurtiçi Kargo",
    official: ["yurticikargo.com"],
    hostKeywords: ["yurticikargo", "yurtici"],
    labels: ["yurticikargo"],
    mentions: ["yurtici kargo"],
  },
  {
    name: "Aras Kargo",
    official: ["araskargo.com.tr"],
    hostKeywords: ["araskargo"],
    labels: ["araskargo"],
    mentions: ["aras kargo"],
  },
  {
    name: "MNG Kargo",
    official: ["mngkargo.com.tr"],
    hostKeywords: ["mngkargo"],
    labels: ["mngkargo"],
    mentions: ["mng kargo"],
  },
  {
    name: "Turkcell",
    official: ["turkcell.com.tr"],
    hostKeywords: ["turkcell"],
    labels: ["turkcell"],
    mentions: ["turkcell"],
  },
  {
    name: "Vodafone",
    official: ["vodafone.com.tr", "vodafone.com"],
    hostKeywords: ["vodafone"],
    labels: ["vodafone"],
    mentions: ["vodafone"],
  },
  {
    name: "Türk Telekom",
    official: ["turktelekom.com.tr"],
    hostKeywords: ["turktelekom"],
    labels: ["turktelekom"],
    mentions: ["turk telekom"],
  },
  {
    name: "Instagram",
    official: ["instagram.com", "facebook.com", "meta.com"],
    hostKeywords: ["instagram", "insta"],
    labels: ["instagram"],
    mentions: ["instagram", "mavi tik"],
  },
  {
    name: "WhatsApp",
    official: ["whatsapp.com", "wa.me"],
    hostKeywords: ["whatsapp"],
    labels: ["whatsapp"],
    mentions: ["whatsapp"],
  },
  {
    name: "Apple",
    official: ["apple.com", "icloud.com"],
    hostKeywords: ["apple", "icloud"],
    labels: ["icloud"],
    mentions: ["apple id", "icloud"],
  },
  {
    name: "Netflix",
    official: ["netflix.com"],
    hostKeywords: ["netflix"],
    labels: ["netflix"],
    mentions: ["netflix"],
  },
];

/** Gerçek adresi gizleyen link kısaltma servisleri */
export const SHORTENERS = new Set([
  "bit.ly",
  "bitly.com",
  "tinyurl.com",
  "t.co",
  "cutt.ly",
  "rebrand.ly",
  "is.gd",
  "v.gd",
  "s.id",
  "shorturl.at",
  "t.ly",
  "rb.gy",
  "tiny.cc",
  "ow.ly",
  "goo.su",
  "clck.ru",
  "shorturl.gg",
  "bl.ink",
  "lnkd.in",
  "qr.ae",
  "short.gy",
  "urlkisa.com",
  "kisalt.com",
  "u.to",
]);

/** Dolandırıcılıkta sık görülen, ucuz ve denetimi zayıf uzantılar */
export const RISKY_TLDS = new Set([
  "xyz",
  "top",
  "click",
  "live",
  "shop",
  "online",
  "site",
  "icu",
  "buzz",
  "cfd",
  "sbs",
  "rest",
  "monster",
  "cyou",
  "lol",
  "bond",
  "support",
  "info",
  "store",
  "fun",
  "vip",
  "win",
  "loan",
  "work",
  "zip",
  "mov",
  "ru",
  "su",
]);

export type PhraseRule = {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  explanation: string;
  phrases: string[];
};

export const PHRASE_RULES: PhraseRule[] = [
  {
    id: "credential-request",
    severity: "high",
    title: "Şifre, kod veya kart bilgisi istiyor",
    explanation:
      "Bankalar, e-Devlet ve resmi kurumlar SMS ya da mesajla asla şifre, doğrulama kodu veya kart bilgisi istemez. Bu bilgiyi isteyen mesaj neredeyse her zaman dolandırıcılıktır.",
    phrases: [
      "sifre",
      "parola",
      "dogrulama kodu",
      "onay kodu",
      "sms kodu",
      "tek kullanimlik",
      "kart bilgi",
      "kart numara",
      "cvv",
      "cvc",
      "son kullanma tarihi",
      "tc kimlik",
      "kimlik numara",
      "internet bankaciligi bilgi",
      "hesap bilgilerinizi",
      "bilgilerinizi guncelle",
      "bilgilerinizi dogrula",
    ],
  },
  {
    id: "urgency",
    severity: "medium",
    title: "Aciliyet ve korku dili",
    explanation:
      "Dolandırıcılar düşünmeden tıklaman için acele ettirir: “24 saat içinde”, “hesabınız kapatılacak” gibi. Gerçek kurumlar sana süre baskısı yapan linkler göndermez.",
    phrases: [
      "son gun",
      "son saat",
      "24 saat",
      "48 saat",
      "hemen",
      "acil",
      "derhal",
      "askiya alin",
      "askiya alinacak",
      "kapatilacak",
      "kapatilmistir",
      "bloke",
      "iptal edilecek",
      "son uyari",
      "yasal islem",
      "icra",
      "haciz",
      "aksi takdirde",
      "sureniz doluyor",
      "suresi doluyor",
    ],
  },
  {
    id: "too-good",
    severity: "medium",
    title: "Gerçek olamayacak kadar iyi teklif",
    explanation:
      "“Kazandınız”, “hediye”, “iade” gibi sözler merak ve heyecan uyandırıp linke tıklatmak için kullanılır. Katılmadığın bir çekilişi kazanamazsın.",
    phrases: [
      "kazandiniz",
      "kazandin",
      "tebrikler",
      "hediye",
      "cekilis",
      "bedava",
      "ucretsiz",
      "odul",
      "iadeniz",
      "iade edilecek",
      "tazminat",
      "geri odeme",
      "bonus",
      "puaniniz",
      "hediye ceki",
    ],
  },
  {
    id: "delivery",
    severity: "medium",
    title: "Kargo / teslimat bahanesi",
    explanation:
      "“Kargonuz teslim edilemedi, adresinizi güncelleyin” mesajları en yaygın oltalama türlerinden biridir. Kargo durumunu her zaman firmanın resmi uygulamasından kontrol et.",
    phrases: [
      "kargonuz",
      "gonderiniz",
      "paketiniz",
      "teslim edilemedi",
      "teslimat",
      "adres bilgi",
      "adresinizi guncel",
      "gumruk ucret",
      "gumruk vergisi",
      "dagitima cikamadi",
    ],
  },
  {
    id: "money-request",
    severity: "medium",
    title: "Para veya ödeme talebi",
    explanation:
      "Küçük bir “işlem ücreti”, “gümrük bedeli” ya da “borç” ödemeni isteyen mesajlar, kart bilgilerini çalmak için sahte ödeme sayfalarına yönlendirir.",
    phrases: [
      "odeme yap",
      "odemeniz",
      "borcunuz",
      "borcunuzu",
      "islem ucreti",
      "hizmet bedeli",
      "tutar",
      "ceza",
      "para gonder",
      "eft",
      "havale",
    ],
  },
  {
    id: "impersonation-family",
    severity: "medium",
    title: "Tanıdık taklidi",
    explanation:
      "“Anne, numaram değişti” gibi mesajlarla aile üyesi ya da arkadaş taklidi yapılır, ardından acil para istenir. Kişiyi eski numarasından arayarak doğrula.",
    phrases: [
      "numaram degisti",
      "yeni numaram",
      "bu numarami kaydet",
      "telefonum bozuldu",
      "merhaba anne",
      "merhaba baba",
      "anne ben",
      "baba ben",
    ],
  },
  {
    id: "investment",
    severity: "medium",
    title: "Yatırım veya bahis vaadi",
    explanation:
      "Garantili kazanç, “günlük %10 getiri” ya da “deneme bonusu” vaat eden mesajlar yasa dışı bahis ve sahte yatırım dolandırıcılıklarının klasik işaretidir.",
    phrases: [
      "garantili kazanc",
      "gunluk kazanc",
      "pasif gelir",
      "yatirim firsati",
      "kripto",
      "borsa uzmani",
      "deneme bonusu",
      "freespin",
      "bahis",
      "casino",
      "yuksek getiri",
    ],
  },
];
