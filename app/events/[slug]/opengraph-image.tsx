// app/events/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/og-fonts";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export const alt = "Event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function EventOGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [event, titleFont, bodyFont] = await Promise.all([
    prisma.event.findUnique({
      where: { slug },
      select: {
        name: true,
        thumbImage: true,
        bannerImage: true,
        date: true,
        address: true,
        eventType: true,
        shortDesc: true,
        minPackagePrice: true,
        organizer: {
          select: { name: true },
        },
      },
    }),
    loadGoogleFont("Bebas Neue", 400),
    loadGoogleFont("Inter", 400),
  ]);

  if (!event) {
    return new ImageResponse(
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#99cd43",
          color: "#fff",
          fontSize: 48,
          fontFamily: "Bebas Neue",
        }}
      >
        Event Not Found
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Bebas Neue",
            data: titleFont,
            weight: 400,
            style: "normal",
          },
        ],
      },
    );
  }

  const eventImage = event.thumbImage || event.bannerImage || null;

  const formattedDateEn = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Truncate address to prevent overflow
  const truncatedAddress = event.address
    ? event.address.length > 45
      ? event.address.substring(0, 45) + "..."
      : event.address
    : "";

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        position: "relative",
        background: "#1a1a1a",
      }}
    >
      {/* Background Image */}
      {eventImage ? (
        <img
          src={eventImage}
          width={1200}
          height={630}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: "linear-gradient(135deg, #99cd43 0%, #5a9a1e 100%)",
            display: "flex",
          }}
        />
      )}

      {/* Simplified Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 1200,
          height: 280,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
          display: "flex",
        }}
      />

      {/* Bottom Content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 1200,
          padding: "40px 50px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Event Name - using loaded font "Inter" */}
        <div
          style={{
            fontSize: 52,
            fontFamily: "Inter",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.2,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {event.name}
        </div>

        {/* Accent Line - removed boxShadow */}
        <div
          style={{
            width: 100,
            height: 4,
            background: "#99cd43",
            borderRadius: 2,
            display: "flex",
          }}
        />

        {/* Date & Location Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            marginTop: 8,
          }}
        >
          {/* Date */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ display: "flex" }}
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                stroke="#99cd43"
                strokeWidth="2"
              />
              <path d="M3 10H21" stroke="#99cd43" strokeWidth="2" />
              <path d="M8 2V6" stroke="#99cd43" strokeWidth="2" />
              <path d="M16 2V6" stroke="#99cd43" strokeWidth="2" />
            </svg>
            <div
              style={{
                fontSize: 22,
                fontFamily: "Inter",
                color: "rgba(255,255,255,0.9)",
                fontWeight: 400,
                display: "flex",
              }}
            >
              {formattedDateEn}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 2,
              height: 30,
              background: "rgba(255,255,255,0.3)",
              display: "flex",
            }}
          />

          {/* Location */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ display: "flex" }}
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
                stroke="#99cd43"
                strokeWidth="2"
              />
              <circle cx="12" cy="9" r="2.5" fill="#99cd43" />
            </svg>
            <div
              style={{
                fontSize: 20,
                fontFamily: "Inter",
                color: "rgba(255,255,255,0.8)",
                fontWeight: 400,
                display: "flex",
              }}
            >
              {truncatedAddress}
            </div>
          </div>
        </div>
      </div>

      {/* Brand watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 40,
          fontSize: 14,
          fontFamily: "Inter",
          color: "rgba(255,255,255,0.4)",
          letterSpacing: 2,
          display: "flex",
        }}
      >
        merchsports.com
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Bebas Neue", data: titleFont, weight: 400, style: "normal" },
        { name: "Inter", data: bodyFont, weight: 400, style: "normal" },
      ],
    },
  );
}
