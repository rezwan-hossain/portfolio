// app/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = "Merch Sports — Gear Up. Stand Out.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const [titleFont, bodyFont] = await Promise.all([
    loadGoogleFont("Bebas Neue", 400),
    loadGoogleFont("Inter", 400),
  ]);

  // ── Load logo as base64 (most reliable method) ──
  const logoData = await fetch(
    new URL("../public/logo.png", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const logoBase64 = `data:image/png;base64,${Buffer.from(logoData).toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #99cd43 0%, #7ab532 50%, #5a9a1e 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Abstract diagonal lines ─────────── */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 1400,
          height: 900,
          display: "flex",
          transform: "rotate(-25deg)",
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            width: "140%",
            height: 3,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
          }}
        />
        {/* Line 2 */}
        <div
          style={{
            position: "absolute",
            top: 140,
            left: -50,
            width: "140%",
            height: 6,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
          }}
        />
        {/* Line 3 — thick */}
        <div
          style={{
            position: "absolute",
            top: 260,
            left: 0,
            width: "140%",
            height: 40,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
          }}
        />
        {/* Line 4 */}
        <div
          style={{
            position: "absolute",
            top: 380,
            left: -100,
            width: "150%",
            height: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent)",
          }}
        />
        {/* Line 5 — thick */}
        <div
          style={{
            position: "absolute",
            top: 480,
            left: 0,
            width: "140%",
            height: 60,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
          }}
        />
        {/* Line 6 */}
        <div
          style={{
            position: "absolute",
            top: 600,
            left: -50,
            width: "140%",
            height: 4,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          }}
        />
        {/* Line 7 */}
        <div
          style={{
            position: "absolute",
            top: 700,
            left: 0,
            width: "140%",
            height: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />
      </div>

      {/* ── Abstract curved shapes ──────────── */}
      {/* Large circle — top right */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.08)",
          top: -200,
          right: -100,
        }}
      />
      {/* Medium circle — bottom left */}
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.06)",
          bottom: -150,
          left: -80,
        }}
      />
      {/* Small circle — center right */}
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          top: 200,
          right: 80,
        }}
      />

      {/* ── Light glow — top left ───────────── */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)",
          top: -250,
          left: -150,
        }}
      />

      {/* ── Light glow — bottom right ───────── */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,0,0,0.10) 0%, transparent 60%)",
          bottom: -200,
          right: -100,
        }}
      />

      {/* ── Top accent line ─────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
        }}
      />

      {/* ── Bottom accent line ──────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        }}
      />

      {/* ── Main content ────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        {/* Logo with white ring */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "3px solid rgba(255,255,255,0.3)",
            marginBottom: 24,
            boxShadow:
              "0 0 40px rgba(255,255,255,0.15), inset 0 0 30px rgba(255,255,255,0.05)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={process.env.NEXT_PUBLIC_SITE_URL + "/logo.png"}
            width={200}
            height={200}
            alt="Merch Sports Logo"
            style={{
              objectFit: "contain",
              filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))",
            }}
          />
        </div>

        {/* Title — Bebas Neue */}
        <div
          style={{
            fontSize: 96,
            fontFamily: "Bebas Neue",
            fontWeight: 400,
            color: "#ffffff",
            letterSpacing: "8px",
            textTransform: "uppercase",
            lineHeight: 1,
            textShadow:
              "0 2px 10px rgba(0,0,0,0.2), 0 0 40px rgba(255,255,255,0.15)",
          }}
        >
          Merch Sports
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 80,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.7))",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 0 15px rgba(255,255,255,0.6)",
            }}
          />
          <div
            style={{
              width: 80,
              height: 2,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.7), transparent)",
            }}
          />
        </div>

        {/* Subtitle — Inter */}
        <div
          style={{
            fontSize: 24,
            fontFamily: "Inter",
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "10px",
            textTransform: "uppercase",
            textShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          Gear Up. Stand Out.
        </div>
      </div>

      {/* ── Corner accents (white) ──────────── */}
      {/* Top-left */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          width: 40,
          height: 40,
          borderTop: "3px solid rgba(255,255,255,0.4)",
          borderLeft: "3px solid rgba(255,255,255,0.4)",
        }}
      />
      {/* Top-right */}
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          borderTop: "3px solid rgba(255,255,255,0.3)",
          borderRight: "3px solid rgba(255,255,255,0.3)",
        }}
      />
      {/* Bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          width: 40,
          height: 40,
          borderBottom: "3px solid rgba(255,255,255,0.3)",
          borderLeft: "3px solid rgba(255,255,255,0.3)",
        }}
      />
      {/* Bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 40,
          height: 40,
          borderBottom: "3px solid rgba(255,255,255,0.4)",
          borderRight: "3px solid rgba(255,255,255,0.4)",
        }}
      />

      {/* ── Bottom URL ──────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          fontSize: 16,
          fontFamily: "Inter",
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        merchsports.com
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Bebas Neue", data: titleFont, weight: 400, style: "normal" },
        { name: "Inter", data: bodyFont, weight: 400, style: "normal" },
      ],
    },
  );
}
