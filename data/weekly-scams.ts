/**
 * "Haftanın Dolandırıcılık Mesajları" panosu.
 *
 * Örnekler, Türkiye'de yaygın görülen gerçek dolandırıcılık kalıplarından
 * derlenmiş TEMSİLİ mesajlardır. Linkler bilerek "defang" edilmiştir
 * (hxxps, [.]) ki yanlışlıkla tıklanamasın. Numaralar maskelenmiştir.
 *
 * İleride bu liste bir veritabanından (ör. Supabase) ve kullanıcı
 * ihbarlarından beslenecek.
 */

export type Channel = "SMS" | "WhatsApp" | "E-posta" | "Instagram";

export type ScamSample = {
  id: string;
  channel: Channel;
  category: string;
  /** Kartın başlığı */
  title: string;
  /** Mesajda görünen gönderen */
  sender: string;
  message: string;
  /** "Nasıl anlarsın?" tek cümlelik ipucu */
  tell: string;
  trending?: boolean;
};

export const CURRENT_WEEK = {
  label: "17 – 23 Kasım 2026",
  intro:
    "Bu hafta en çok kargo, e-Devlet tazminatı ve sahte banka güvenlik mesajları dolaşıyor. Aşağıdaki örneklerin hepsi temsilidir; linkler tıklanamaz hâle getirildi.",
};

export const WEEKLY_SCAMS: ScamSample[] = [
  {
    id: "ptt-adres",
    channel: "SMS",
    category: "Kargo",
    title: "“Adres bilginiz eksik” kargo mesajı",
    sender: "PTT-BILGI",
    message:
      "Sayın müşterimiz, TR7841 numaralı gönderiniz adres bilgisi eksik olduğu için teslim edilemedi. 24 saat içinde güncellemezseniz iade edilecektir: hxxps://ptt-gonderi-takip[.]xyz/TR7841",
    tell: "PTT’nin adresi ptt.gov.tr’dir; “ptt-gonderi-takip.xyz” PTT’ye ait değil.",
    trending: true,
  },
  {
    id: "edevlet-tazminat",
    channel: "SMS",
    category: "Kamu taklidi",
    title: "e-Devlet “tazminat hakkınız var”",
    sender: "E-DEVLET",
    message:
      "e-Devlet: Adınıza 8.450 TL tazminat ödemesi tanımlanmıştır. Son başvuru tarihi bugündür. Başvuru için: hxxps://turkiye.gov.tr.tazminat-sorgula[.]com/basvuru",
    tell: "Adres “turkiye.gov.tr” ile başlıyor ama asıl sahibi sondaki “tazminat-sorgula.com”.",
    trending: true,
  },
  {
    id: "banka-bloke",
    channel: "SMS",
    category: "Banka",
    title: "“Kartınız bloke edildi” güvenlik uyarısı",
    sender: "GUVENLIK",
    message:
      "Değerli müşterimiz, şüpheli işlem nedeniyle kartınız bloke edilmiştir. Kartınızı aktif etmek için bilgilerinizi doğrulayın: hxxps://garanti-bbva-guvenlik[.]com",
    tell: "Bankalar SMS ile “bilgilerinizi doğrulayın” linki göndermez; alan adı da bankaya ait değil.",
  },
  {
    id: "anne-numara",
    channel: "WhatsApp",
    category: "Tanıdık taklidi",
    title: "“Anne, numaram değişti”",
    sender: "+90 5•• ••• •• 47",
    message:
      "Merhaba anne, telefonum bozuldu bu yeni numaram, kaydet. Acil bir ödeme yapmam lazım ama bankam açılmıyor. TR12 0006 1000 0000 1234 5678 90 IBAN’a 4.500 TL atar mısın, akşam veririm.",
    tell: "Yeni numaradan gelen acil para isteği: kişiyi eski numarasından arayarak doğrula.",
    trending: true,
  },
  {
    id: "hgs-borc",
    channel: "SMS",
    category: "Ceza / borç",
    title: "HGS “geçiş ihlali” cezası",
    sender: "HGS",
    message:
      "HGS: Ödenmemiş 3 adet geçiş ihlaliniz bulunmaktadır. Aksi takdirde 10 kat ceza uygulanacaktır. Ödeme için: hxxp://hgs-odeme-merkezi[.]online",
    tell: "Kısa sürede yüksek ceza tehdidi + resmi olmayan “.online” alan adı.",
  },
  {
    id: "trendyol-cekilis",
    channel: "SMS",
    category: "Çekiliş / hediye",
    title: "Trendyol çekilişi “kazandınız”",
    sender: "KAMPANYA",
    message:
      "Tebrikler! Trendyol yılbaşı çekilişinde iPhone 17 kazandınız. Hediyenizi teslim almak için sadece 49,90 TL kargo ücretini ödeyin: bit[.]ly/trnd-hdy26",
    tell: "Katılmadığın çekilişi kazanamazsın; “sadece kargo ücreti” kart bilgisi çalmak içindir.",
  },
  {
    id: "insta-mavi-tik",
    channel: "Instagram",
    category: "Hesap çalma",
    title: "“Mavi tik başvurunuz onaylandı”",
    sender: "instagram.verify.badge",
    message:
      "Hesabınız mavi tik için uygun bulundu! Onaylamak için 48 saat içinde giriş yapın, aksi takdirde başvurunuz iptal edilecek: hxxps://instagram-verify-badge[.]site/login",
    tell: "Instagram DM ile şifre isteyen bir giriş sayfası göndermez; adres instagram.com değil.",
  },
  {
    id: "deneme-bonusu",
    channel: "SMS",
    category: "Yasa dışı bahis",
    title: "“500 TL deneme bonusu”",
    sender: "+90 8•• ••• •• 12",
    message:
      "Üye ol, anında 500 TL deneme bonusu + 100 freespin kazan! Garantili kazanç için: hxxps://win-bet-giris[.]vip/tr",
    tell: "Yasa dışı bahis siteleri sık sık adres değiştirir; verdiğin bilgiler başka dolandırıcılıklarda kullanılır.",
  },
];

/** Kimliğe göre panodaki örneği bulur (ana sayfadaki "Bunu analiz et" için) */
export function getSample(id: string | null | undefined): ScamSample | undefined {
  if (!id) return undefined;
  return WEEKLY_SCAMS.find((s) => s.id === id);
}
