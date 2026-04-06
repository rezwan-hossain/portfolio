import { getUpcomingEvents } from "@/app/actions/event";
import EventCard from "@/module/event/components/EventCard";
import { ChevronDown } from "lucide-react";

export default async function UpcomingEvents() {
  const { events } = await getUpcomingEvents(2);

  if (events.length === 0) return null;

  return (
    <section id="testimonials" className=" px-[5%] py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-widest text-gray-500">
            Upcomming
          </div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            Marathon <br />
            <span className="text-neon-lime">Event</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto space-y-10 mt-12">
          {events.map((event, index) => {
            const formattedEvent = {
              slug: event.slug,
              title: event.name,
              description: event.description,
              shortDesc: event.shortDesc,
              time: new Date(event.time).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
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
    </section>
  );
}
