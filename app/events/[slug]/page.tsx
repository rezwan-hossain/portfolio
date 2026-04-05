// app/events/[slug]/page.tsx
import type { Metadata } from "next";
import { getEventBySlug } from "@/app/actions/event";
import EventDetailPage from "@/module/event/pages/EventDetailPage";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EventDetailSkeleton from "@/module/event/components/EventDetailSkeleton";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
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
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/events/${slug}`;

  return {
    title: event.name,
    description:
      event.shortDesc || `${event.name} — ${formattedDate} at ${event.address}`,

    openGraph: {
      title: event.name,
      description:
        event.shortDesc || `Join us for ${event.name} on ${formattedDate}`,
      type: "article",
      url,
      siteName: "merchsports.com",
      locale: "en_US",
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
      canonical: url,
    },
  };
}

// ── Page Component ───────────────────────────
export default async function Page({ params, searchParams }: Props) {
  // Move data fetching into a suspended component
  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventPageContent paramsPromise={params} searchParams={searchParams} />
    </Suspense>
  );
}

// This component handles the data fetching and will be suspended
async function EventPageContent({
  paramsPromise,
  searchParams,
}: {
  paramsPromise: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { slug } = await paramsPromise;
  const { event, error } = await getEventBySlug(slug);
  const resolvedSearchParams = await searchParams;

  if (!event || error) {
    notFound();
  }

  return <EventDetailPage event={event} searchParams={resolvedSearchParams} />;
}
