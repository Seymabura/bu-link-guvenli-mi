import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Bu Link Güvenli mi? Şüpheli SMS ve link kontrolü";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Türkçe karakterler için Geist yazı tipini kullan (ş, ğ, ı, İ)
const fontDir = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");
const [semibold, regular] = await Promise.all([
  readFile(join(fontDir, "Geist-SemiBold.ttf")),
  readFile(join(fontDir, "Geist-Regular.ttf")),
]);

const NAVY = "#17397b";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f8f9fc",
          backgroundImage:
            "linear-gradient(to right, rgba(23,57,123,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,57,123,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          fontFamily: "Geist",
          color: "#1a2233",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill={NAVY} />
            <path
              d="M16 6.5 23.5 9.3v6.1c0 4.7-3.1 8.3-7.5 9.9-4.4-1.6-7.5-5.2-7.5-9.9V9.3L16 6.5Z"
              fill="none"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600 }}>
            Bu Link Güvenli mi<span style={{ color: NAVY }}>?</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05 }}>
            Tıklamadan önce <span style={{ color: NAVY, marginLeft: 22 }}>bir sor.</span>
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#5b6478", maxWidth: 900, lineHeight: 1.35 }}>
            Şüpheli SMS ve linklerdeki dolandırıcılık işaretlerini sade bir Türkçeyle açıklıyoruz.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            alignSelf: "flex-start",
            background: "white",
            border: "1px solid #e3e7ef",
            borderRadius: 16,
            padding: "16px 24px",
            fontSize: 28,
            fontFamily: "monospace",
            color: "#7a8296",
          }}
        >
          https://turkiye.gov.tr.
          <span
            style={{
              color: "#c8102e",
              background: "rgba(200,16,46,0.08)",
              padding: "2px 8px",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            giris-dogrula.com
          </span>
          /login
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
        { name: "Geist", data: regular, weight: 400, style: "normal" },
      ],
    }
  );
}
