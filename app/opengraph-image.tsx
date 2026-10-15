import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BASE_PRICE } from "@/lib/catalog";

// Link preview for WhatsApp, Facebook, X etc. (1200×630), generated at build time
export const alt = "Forever Arctic Sea — everyday Omega-3 for kids, from Evergreen Remedy Ghana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/fp1.png"));
  const photoSrc = `data:image/png;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0d1f1a" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 600,
            padding: "60px 56px",
            color: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 600 }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: "#0f8a5f" }} />
            Evergreen Remedy Ghana
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, letterSpacing: 4, color: "#cfe8d9", textTransform: "uppercase" }}>
              Forever Arctic Sea
            </div>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, marginTop: 16, letterSpacing: -2 }}>
              Everyday Omega-3 for your child’s growing brain
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 24 }}>
            <div style={{ display: "flex", padding: "12px 22px", borderRadius: 999, background: "#f7f6f1", color: "#0d1f1a", fontWeight: 700 }}>
              {/* The default OG font has no ₵ glyph, so use the ISO code */}
              From GHS {BASE_PRICE}
            </div>
            <div style={{ display: "flex", padding: "12px 22px", borderRadius: 999, border: "2px solid rgba(255,255,255,0.25)" }}>
              Pay on delivery
            </div>
          </div>
        </div>
        <img src={photoSrc} alt="" width={600} height={630} style={{ objectFit: "cover" }} />
      </div>
    ),
    size
  );
}
