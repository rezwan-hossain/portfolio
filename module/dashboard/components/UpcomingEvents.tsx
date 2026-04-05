// module/dashboard/components/UpcomingEvents.tsx
import type { DashboardEvent } from "@/types/dashboard";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

type UpcomingEventsProps = {
  events: DashboardEvent[];
};

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center">
        <p className="text-gray-500">No active events right now</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.slug}`}
          className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Image */}
          <div className="relative h-32 w-full">
            <img
              src={event.bannerImage}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <span
              className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                event.eventType === "VIRTUAL"
                  ? "bg-purple-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {event.eventType}
            </span>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
              {event.name}
            </h3>
            <p className="text-xs text-indigo-500 mt-0.5">
              {event.organizer.name}
            </p>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{event.address}</span>
              </div>
            </div>

            {/* Package Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {event.packages.slice(0, 3).map((pkg) => (
                <span
                  key={pkg.id}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {pkg.distance} — ৳{pkg.price}
                </span>
              ))}
            </div>

            {/* Starting Price */}
            {event.packages.length > 0 && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">Starting from</span>
                <span className="text-sm font-bold text-indigo-600">
                  ৳{event.packages[0].price}
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}

      {/* View All */}
      <Link
        href="/events"
        className="block text-center py-3 text-sm text-indigo-500 hover:underline font-medium"
      >
        View All Events →
      </Link>
    </div>
  );
}
