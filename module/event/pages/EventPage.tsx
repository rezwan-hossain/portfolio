import { HeroText } from "@/components/ui/HeroText";
import EventCard from "../components/EventCard";
import { EventData } from "@/types/event";
import { formatEventTime } from "@/utils/date";

type EventsPageProps = {
  events: EventData[];
  error?: string;
};

const EventsPage = ({ events, error }: EventsPageProps) => {
  return (
    <div className="min-h-screen bg-background  px-4 md:px-8 py-4 md:py-8">
      <div className="mt-42 ">
        <HeroText title="Events" />
      </div>
      <div className="max-w-7xl mx-auto space-y-10 mt-12">
        {events.map((event, index) => {
          const formattedEvent = {
            slug: event.slug,
            title: event.name,
            description: event.description,
            shortDesc: event.shortDesc,
            // time: new Date(event.time).toLocaleTimeString("en-US", {
            //   hour: "2-digit",
            //   minute: "2-digit",
            // }),
            time: formatEventTime(event.time),
            date: new Date(event.date)
              .toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
              .toUpperCase(),
            location: event.address.toUpperCase(),
            // pricing:
            //   event.packages.length > 0
            //     ? event.packages
            //         .map((pkg) => `${pkg.name} ৳${pkg.price}`)
            //         .join(" / ")
            //     : "No packages available",

            pricing:
              event.packages.length > 0 ? (
                <>
                  {event.packages.map((pkg, i) => (
                    <span key={i}>
                      {pkg.name}{" "}
                      <span className="font-semibold text-neon-lime">
                        ৳{pkg.price}
                      </span>
                      {i !== event.packages.length - 1 && " / "}
                    </span>
                  ))}
                </>
              ) : (
                "No packages available"
              ),
            image: event.bannerImage,
            eventType: event.eventType,
            highlighted: index === 0,
          };

          return <EventCard key={event.id} event={formattedEvent} />;
        })}
      </div>
    </div>
  );
};

export default EventsPage;
