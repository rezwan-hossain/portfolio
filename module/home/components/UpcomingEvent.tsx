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
            title="RunRise Nation Noboborsho Run 1433"
            description="A full-day summit featuring keynote speakers, interactive workshops, and networking."
            time="9:31 PM - 12:31 AM"
            date="JUL 25, 2026"
            location="ADELAIDE, SOUTH AUSTRALIA"
            pricing="General $99 / Student $159 / VIP $299"
            image="https://plus.unsplash.com/premium_photo-1664537975122-9c598d85816e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            highlighted
          />
        </div>
      </div>
    </section>
  );
}
