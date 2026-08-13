import { HeroText } from "@/components/ui/HeroText";
import EventCard from "../components/EventCard";
import { EventData } from "@/types/event";
import { formatEventTime, formatEventTimeUTC } from "@/utils/date";

type EventsPageProps = {
  upcomingEvents: EventData[];
  previousEvents: EventData[];
  error?: string;
};

// ✅ Format raw event into EventCard-friendly shape
function formatEvent(event: EventData, index: number) {
  return {
    slug: event.slug,
    title: event.name,
    description: event.description,
    status: event.status,
    shortDesc: event.shortDesc,
    time: formatEventTimeUTC(event.time),
    date: new Date(event.date)
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .toUpperCase(),
    location: event.address.toUpperCase(),
    pricing:
      event.packages.length > 0 ? (
        <>
          {event.packages.map((pkg, i) => (
            <span key={i}>
              {pkg.name}{" "}
              <span className="font-semibold text-neon-lime">৳{pkg.price}</span>
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
}

const EventsPage = ({
  upcomingEvents,
  previousEvents,
  error,
}: EventsPageProps) => {
  return (
    <div className="min-h-screen bg-background  px-4 md:px-8 py-4 md:py-8">
      <div className="mt-42 ">
        <HeroText title="Events" />
      </div>
      <div className="max-w-7xl mx-auto space-y-10 mt-12">
        <div className="text-center mb-16">
          <div className="text-lg uppercase tracking-widest text-gray-500"></div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            upcomming <br />
            <span className="text-neon-lime">events</span>
          </h2>
        </div>

        {upcomingEvents.map((event, index) => {
          const formattedEvent = {
            slug: event.slug,
            title: event.name,
            description: event.description,
            shortDesc: event.shortDesc,
            // time: new Date(event.time).toLocaleTimeString("en-US", {
            //   hour: "2-digit",
            //   minute: "2-digit",
            // }),
            time: formatEventTimeUTC(event.time),
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

          return <EventCard key={event.id} event={formatEvent(event, index)} />;
        })}
      </div>

      <div className="max-w-7xl mx-auto space-y-10 mt-20">
        <div className="text-center mb-16">
          <div className="text-lg uppercase tracking-widest text-gray-500">
            our
          </div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            previous <br />
            <span className="text-neon-lime">events</span>
          </h2>
        </div>

        {previousEvents.map((event, index) => {
          const formattedEvent = {
            slug: event.slug,
            title: event.name,
            description: event.description,
            shortDesc: event.shortDesc,
            // time: new Date(event.time).toLocaleTimeString("en-US", {
            //   hour: "2-digit",
            //   minute: "2-digit",
            // }),
            time: formatEventTimeUTC(event.time),
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

          return <EventCard key={event.id} event={formatEvent(event, index)} />;
        })}
      </div>
    </div>
  );
};

export default EventsPage;
