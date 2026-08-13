import HoverLine from "@/components/ui/HoverLine";
import { Clock, Calendar, MapPin, Ticket, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EventProps {
  slug: string;
  title: string;
  description: string;
  shortDesc: string | null;
  time: string;
  date: string;
  location: string;
  pricing: React.ReactNode;
  image: string;
  eventType?: "LIVE" | "VIRTUAL";
  highlighted?: boolean;
  status: "ACTIVE" | "INACTIVE" | "CANCELLED" | "COMPLETED";
}

interface EventCardProps {
  event: EventProps;
}

const EventCard = ({ event }: EventCardProps) => {
  const isCompleted = event.status === "COMPLETED";

  // shared text colors so everything dims together
  const headingColor = isCompleted ? "text-gray-500" : "text-card-foreground";
  const bodyColor = isCompleted ? "text-gray-400" : "text-card-foreground";
  const iconColor = isCompleted ? "text-gray-400" : "text-muted-foreground";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
      {/* Info Card */}
      <div
        className={`lg:col-span-2 border rounded-2xl p-8 md:p-10 flex flex-col justify-between transition-colors duration-200 ${
          isCompleted
            ? "border-gray-300 bg-gray-100 dark:bg-gray-900/40"
            : "border-gray-400 bg-card"
        }`}
      >
        <div>
          <div className="flex items-start justify-between gap-4">
            <h2
              className={`text-3xl md:text-4xl uppercase tracking-normal leading-tight ${headingColor}`}
            >
              {event.title}
            </h2>
            {isCompleted && (
              <span className="mt-1 shrink-0 rounded-full border border-gray-300 bg-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Completed
              </span>
            )}
          </div>

          <p
            className={`mt-3 text-sm md:text-base leading-relaxed line-clamp-2 ${
              event.highlighted && !isCompleted
                ? "bg-highlight px-1 py-0.5 box-decoration-clone"
                : isCompleted
                  ? "text-gray-400"
                  : "text-muted-foreground"
            }`}
          >
            {event.shortDesc ?? event.description ?? "No description available"}
          </p>

          <div
            className={`w-full border-b mt-6 mb-6 ${
              isCompleted ? "border-gray-300" : "border-gray-200"
            }`}
          />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <span
                className={`text-sm font-medium tracking-wide ${bodyColor}`}
              >
                {event.time}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <span
                className={`text-sm font-medium tracking-wide ${bodyColor}`}
              >
                {event.date}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <span
                className={`text-sm font-medium tracking-wide ${bodyColor}`}
              >
                {event.location}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Ticket className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <span
                className={`text-sm font-medium tracking-wide uppercase ${bodyColor}`}
              >
                {event.pricing}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href={`/events/${event.slug}`}
            className={`cursor-pointer inline-flex items-center gap-3 border rounded-full pl-6 pr-1.5 py-1.5 text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${
              isCompleted
                ? "border-gray-300 bg-gray-200 text-gray-500 hover:bg-gray-300"
                : "border-gray-400 bg-neon-lime text-white hover:bg-gray-800! hover:text-white"
            }`}
          >
            {isCompleted ? "View Recap" : "Event Details"}
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                isCompleted
                  ? "bg-gray-400 text-white"
                  : "bg-foreground text-background"
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>

      {/* Image */}
      <div className="hidden md:block lg:col-span-3 rounded-2xl overflow-hidden h-64 md:h-auto">
        <img
          src={event.image}
          alt={event.title}
          className={`w-full h-full object-cover transition-all duration-200 ${
            isCompleted ? "grayscale opacity-60" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default EventCard;
