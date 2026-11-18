import { afterEach, describe, expect, it, vi } from "vitest";

import { analyze } from "../analyzer";
import { applyReputation } from "../analyzer/reputation";
import { checkSafeBrowsing } from "./safe-browsing";

afterEach(() => vi.unstubAllGlobals());

describe("Google Safe Browsing", () => {
  it("anahtar yoksa hiç istek atmaz", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const r = await checkSafeBrowsing(["http://a.com/"], undefined);
    expect(r.status).toBe("disabled");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("eşleşmeleri okur ve doğru adrese istek atar", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          threats: [{ url: "http://kotu.test/", threatTypes: ["SOCIAL_ENGINEERING"] }],
          cacheDuration: "300s",
        })
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    const r = await checkSafeBrowsing(["http://kotu.test/"], "ANAHTAR");
    expect(r.status).toBe("checked");
    expect(r.matches[0].threatTypes).toEqual(["SOCIAL_ENGINEERING"]);
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain("safebrowsing.googleapis.com/v5/urls:search");
    expect(calledUrl).toContain("urls=http%3A%2F%2Fkotu.test%2F");

    // İkinci sorgu önbellekten gelir
    await checkSafeBrowsing(["http://kotu.test/"], "ANAHTAR");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("servis hata verirse siteyi bozmaz", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ağ yok")));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await checkSafeBrowsing(["http://baska.test/"], "ANAHTAR");
    expect(r.status).toBe("error");
  });

  it("kara listedeki link sonucu her zaman yüksek riske çeker", () => {
    const base = analyze("Merhaba, şu siteye bak: https://masum-gorunen.com");
    expect(base.level).toBe("low");
    const r = applyReputation(base, {
      provider: "Google Safe Browsing",
      status: "checked",
      matches: [{ url: "https://masum-gorunen.com/", threatTypes: ["MALWARE"] }],
    });
    expect(r.level).toBe("high");
    expect(r.findings[0].id).toBe("blocklisted");
    expect(r.findings[0].explanation).toContain("zararlı yazılım");
  });
});
