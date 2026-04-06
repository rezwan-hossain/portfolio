// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Merch Sports — Gear Up. Stand Out.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ✅ This will be generated at BUILD TIME, not on every request
export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #99cd43 0%, #7ab532 50%, #5a9a1e 100%)",
        color: "white",
        fontSize: 60,
        fontWeight: "bold",
      }}
    >
      <div style={{ fontSize: 96, letterSpacing: 8 }}>MERCH SPORTS</div>
      <div style={{ fontSize: 24, letterSpacing: 10, opacity: 0.9 }}>
        GEAR UP. STAND OUT.
      </div>
    </div>,
    {
      ...size,
    },
  );
}
