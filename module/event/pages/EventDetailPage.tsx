import {
  Lightbulb,
  Users,
  Rocket,
  Globe,
  Calendar,
  MapPin,
  User,
  Activity,
  Clock,
} from "lucide-react";
import TicketSelector from "../components/TicketSelector";
import { HeroText } from "@/components/ui/HeroText";

import type { EventData } from "@/types/event";
import EventInfoCard from "../components/EventInfoCard";
import CountdownTimer from "../components/CountdownTimer";
import EventDescription from "../components/EventDescription";

const highlights = [
  {
    icon: Lightbulb,
    title: "Keynote Speakers",
    desc: "Hear from world-renowned innovators and thought leaders shaping the future of technology.",
  },
  {
    icon: Users,
    title: "Networking",
    desc: "Connect with thousands of entrepreneurs, investors, and industry professionals.",
  },
  {
    icon: Rocket,
    title: "Startup Showcase",
    desc: "Discover cutting-edge startups and groundbreaking products ready to disrupt industries.",
  },
  {
    icon: Globe,
    title: "Global Community",
    desc: "Join a diverse community of innovators from over 50 countries worldwide.",
  },
];

type EventDetailPageProps = {
  event: EventData;
};

// Set event date ~143 days from now
const eventDate = new Date(Date.now() + 143 * 24 * 60 * 60 * 1000);

const EventDetailPage = ({ event }: EventDetailPageProps) => {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(event.time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Status badge styling helper
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "INACTIVE":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Upcoming";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      case "INACTIVE":
        return "Inactive";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-42 ">
        <HeroText
          title={event.name}
          date={formattedDate}
          time={formattedTime}
          location={event.address}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Main grid */}
        <div className="hidden md:block relative rounded-xl overflow-hidden mt-4 mb-8">
          <img
            src={event.bannerImage}
            alt={event.name}
            className="w-full h-[300px] sm:h-[360px] lg:h-[540px] object-contain lg:object-cover overflow-hidden rounded-xl"
            loading="lazy"
          />
          <span
            className={`absolute top-4 right-4 px-4 py-1.5 text-xs font-semibold rounded-full ${
              event.eventType === "VIRTUAL"
                ? "bg-purple-500 text-white"
                : "bg-neon-lime text-white"
            }`}
          >
            {event.eventType === "LIVE" ? "UPCOMING" : event.eventType}
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
          {/* Left column */}
          <div>
            {/* Hero Image */}
            <div className="block md:hidden relative rounded-xl overflow-hidden">
              <img
                src={event.thumbImage ?? event.bannerImage}
                alt={event.name}
                className="w-full h-[280px] sm:h-[360px] lg:h-[440px] object-cover"
                loading="lazy"
              />
              <div className="absolute top-0 left-0 h-16 w-16 overflow-visible">
                <div className="absolute -rotate-45 bg-neon-lime text-white font-body font-semibold text-xs text-center py-1 w-[170px] left-[-34px] top-[32px]">
                  {event.status === "ACTIVE" ? "Upcoming" : event.status}
                </div>
              </div>
            </div>

            <section className="mt-10 lg:mt-14">
              <div
                className="prose mt-14 prose-slate [&>h2]:mt-12 [&>h2]:flex [&>h2]:items-center [&>h2]:font-mono [&>h2]:text-sm/7 [&>h2]:font-medium [&>h2]:text-slate-900 [&>h2]:before:mr-3 [&>h2]:before:h-3 [&>h2]:before:w-1.5 [&>h2]:before:rounded-r-full [&>h2]:before:bg-cyan-200 [&>h2:nth-of-type(3n)]:before:bg-violet-200 [&>h2:nth-of-type(3n+2)]:before:bg-indigo-200 [&>ul]:mt-6 [&>ul]:list-['\2013\20'] [&>ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </section>

            <section className="mt-10 lg:mt-14">
              <h2 className="font-display text-3xl lg:text-4xl tracking-wide mb-6">
                EVENT DETAILS
              </h2>
              <EventDescription description={event.description} />
            </section>
          </div>

          {/* Right column */}
          <div className="lg:sticky lg:top-20 h-fit space-y-8 mt-10">
            <CountdownTimer targetDate={new Date(event.date)} />

            <EventInfoCard
              status={event.status}
              date={formattedDate}
              time={formattedTime}
              address={event.address}
              eventType={event.eventType}
              organizer={event.organizer}
            />

            <TicketSelector
              packages={event.packages}
              eventSlug={event.slug}
              eventId={event.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
