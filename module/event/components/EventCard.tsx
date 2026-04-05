import HoverLine from "@/components/ui/HoverLine";
import { Clock, Calendar, MapPin, Ticket, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EventProps {
  slug: string;
  title: string;
  description: string;
  time: string;
  date: string;
  location: string;
  pricing: React.ReactNode;
  image: string;
  eventType?: "LIVE" | "VIRTUAL";
  highlighted?: boolean;
}

interface EventCardProps  {
  event: EventProps;
};

const EventCard = ({
  event
}: EventCardProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
      {/* Info Card */}
      <div className="lg:col-span-2 border border-gray-400 rounded-2xl p-8 md:p-10 flex flex-col justify-between bg-card">
        <div>
          <h2 className="text-3xl md:text-4xl uppercase tracking-normal text-card-foreground leading-tight">
            {event.title}
          </h2>
          <p
            className={`mt-3 text-sm md:text-base leading-relaxed line-clamp-2  ${
              event.highlighted
                ? "bg-highlight px-1 py-0.5 decoration-clone box-decoration-clone"
                : "text-muted-foreground"
            }`}
          >
            {event.description}
          </p>

          <div className="w-full border-b border-gray-200 mt-6 mb-6" />
         

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide text-card-foreground">
                {event.time}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide text-card-foreground">
                {event.date}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide text-card-foreground">
                {event.location}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide uppercase text-card-foreground">
                {event.pricing}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href={`/events/${event.slug}`}
            className="cursor-pointer inline-flex items-center gap-3 border border-gray-400 rounded-full pl-6 pr-1.5 py-1.5 text-sm font-semibold uppercase tracking-widest text-white bg-neon-lime hover:bg-gray-800! hover:text-white transition-colors duration-200"
          >
            Event Details
            <span className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>

      {/* Image */}
      <div className="hidden md:block lg:col-span-3 rounded-2xl overflow-hidden h-64 md:h-auto">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default EventCard;
