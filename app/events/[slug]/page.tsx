// app/events/[slug]/page.tsx
import type { Metadata } from "next";
import { getEventBySlug } from "@/app/actions/event";
import EventDetailPage from "@/module/event/pages/EventDetailPage";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// ── Dynamic Metadata ─────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { event } = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  const eventImage = event.thumbImage || event.bannerImage;
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    title: event.name,
    description:
      event.shortDesc || `${event.name} — ${formattedDate} at ${event.address}`,

    openGraph: {
      title: event.name,
      description:
        event.shortDesc || `Join us for ${event.name} on ${formattedDate}`,
      type: "article",
      ...(eventImage && {
        images: [
          {
            url: eventImage,
            width: 1200,
            height: 630,
            alt: event.name,
          },
        ],
      }),
    },

    twitter: {
      card: "summary_large_image",
      title: event.name,
      description: event.shortDesc || `${event.name} — ${formattedDate}`,
    },

    alternates: {
      canonical: `/events/${slug}`,
    },
  };
}

// ── Page Component ───────────────────────────
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { event, error } = await getEventBySlug(slug);

  if (!event || error) {
    notFound();
  }

  return <EventDetailPage event={event} />;
}
