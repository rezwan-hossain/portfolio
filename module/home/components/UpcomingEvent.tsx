import EventCard from "@/module/event/components/EventCard";
import { ChevronDown } from "lucide-react";

export default function UpcomingEvent() {
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
          <EventCard
          event={{
            slug: "my-event",
            title: "My Event",
            description: "Cool event",
            time: "10:00 AM",
            date: "2026-03-26",
            location: "Dhaka",
            pricing: "Free",
            image: "/img.jpg",
            highlighted: true,
          }}
        />
        </div>
      </div>
    </section>
  );
}
