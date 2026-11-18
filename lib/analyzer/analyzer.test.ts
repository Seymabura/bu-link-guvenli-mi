import { describe, expect, it } from "vitest";

import { analyze } from "./index";
import { extractUrls, normalizeTr, refang, skeleton } from "./text";

const ids = (text: string) => analyze(text).findings.map((f) => f.id);

describe("metin yardımcıları", () => {
  it("Türkçe karakterleri sadeleştirir ve uzunluğu korur", () => {
    const s = "İŞLEMİNİZ ŞİMDİ Ğ";
    expect(normalizeTr(s)).toBe("isleminiz simdi g");
    expect(normalizeTr(s).length).toBe(s.length);
  });

  it("defang edilmiş linkleri geri çevirir", () => {
    expect(refang("hxxps://ptt-kargo[.]xyz/takip")).toBe("https://ptt-kargo.xyz/takip");
  });

  it("protokollü, protokolsüz ve IP linklerini bulur", () => {
    const urls = extractUrls(
      "Bak: https://a.com/x, şuraya da: ptt-teslimat.xyz/abc. Bir de 185.22.10.4/odeme"
    ).map((u) => u.raw);
    expect(urls).toEqual(["https://a.com/x", "ptt-teslimat.xyz/abc", "185.22.10.4/odeme"]);
  });

  it("benzer görünen harfleri aynı iskelete indirger", () => {
    expect(skeleton("trendyoI")).toBe(skeleton("trendyol"));
    expect(skeleton("paypa1")).toBe(skeleton("paypal"));
    expect(skeleton("rnicrosoft")).toBe(skeleton("microsoft"));
  });
});

describe("link kuralları", () => {
  it("marka taklidi alan adını yakalar", () => {
    const r = analyze("e-Devlet: tazminat başvurunuz onaylandı https://edevlet-tazminat-basvuru.xyz");
    expect(r.findings.map((f) => f.id)).toContain("brand-impersonation");
    expect(r.level).toBe("high");
  });

  it("asıl adresin sonda saklandığı alt alan adını yakalar", () => {
    expect(ids("https://turkiye.gov.tr.giris-dogrula.com/login")).toContain("deceptive-subdomain");
  });

  it("harf hilesiyle yazılmış adresi yakalar", () => {
    expect(ids("Siparişiniz için: https://trendyoI.com/kampanya")).toContain("lookalike");
    expect(ids("https://hepsiburda.com/odul")).toContain("lookalike");
  });

  it("Kiril harfli (punycode) adresi yakalar", () => {
    expect(ids("https://аpple.com/id")).toContain("punycode");
  });

  it("kısaltılmış linki yakalar", () => {
    expect(ids("Detaylar: bit.ly/3xYz9")).toContain("shortener");
  });

  it("IP adresli linki yakalar", () => {
    expect(ids("Ödeme için http://185.22.10.4/odeme")).toContain("ip-host");
  });

  it("@ hilesini yakalar", () => {
    expect(ids("https://turkiye.gov.tr@kotu-site.com/giris")).toContain("userinfo-trick");
  });

  it("marka anılıp başka siteye link verilirse uyarır", () => {
    expect(ids("PTT: Gönderiniz bekliyor, takip için https://kargo-takip-merkezi.com")).toContain(
      "brand-mismatch"
    );
  });
});

describe("resmi ve zararsız mesajlar", () => {
  it("resmi alan adını taklit sanmaz", () => {
    const r = analyze("e-Devlet üzerinden https://www.turkiye.gov.tr adresine girebilirsiniz.");
    expect(r.findings.map((f) => f.id)).toContain("official-domain");
    expect(r.findings.some((f) => f.severity === "high")).toBe(false);
    expect(r.level).toBe("low");
  });

  it("sıradan bir mesajı yüksek risk saymaz", () => {
    const r = analyze("Akşam 8'de kafede buluşalım mı? Konum: https://maps.google.com/?q=kadikoy");
    expect(r.level).toBe("low");
  });

  it("'gibi' kelimesini GİB sanmaz, 'pineapple' alan adını Apple sanmaz", () => {
    expect(ids("Bu da onun gibi bir şey https://pineapple-recipes.com")).not.toContain(
      "brand-impersonation"
    );
  });

  it("boş metinde bulgu üretmez", () => {
    expect(analyze("").findings).toEqual([]);
  });
});

describe("tipik dolandırıcılık senaryoları", () => {
  it("kargo SMS'i yüksek risktir", () => {
    const r = analyze(
      "PTT: Gönderiniz adres bilgisi eksik olduğu için teslim edilemedi. 24 saat içinde güncelleyin: hxxps://ptt-gonderi-takip[.]xyz/TR98"
    );
    expect(r.level).toBe("high");
    expect(r.findings.map((f) => f.id)).toEqual(
      expect.arrayContaining(["brand-impersonation", "urgency", "delivery", "risky-tld"])
    );
  });

  it("'anne numaram değişti' mesajını şüpheli bulur", () => {
    const r = analyze(
      "Merhaba anne, telefonum bozuldu bu yeni numaram. Acil bir ödeme yapmam lazım, TR12 0006 1000 0000 1234 5678 90 IBAN'a 4500 TL atar mısın?"
    );
    expect(r.level).not.toBe("low");
    expect(r.findings.map((f) => f.id)).toEqual(
      expect.arrayContaining(["impersonation-family", "iban", "urgency"])
    );
  });
});

describe("güçlü işaretler", () => {
  it("tek başına taklit adres bile yüksek risktir ve orijinal yazım gösterilir", () => {
    const r = analyze("https://trendyoI.com/kampanya");
    expect(r.level).toBe("high");
    expect(r.findings[0].explanation).toContain("trendyoI");
  });
});
