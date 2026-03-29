import {
  Activity,
  Calendar,
  Clock,
  MapPin,
  User,
  Globe,
  Building2,
} from "lucide-react";

type EventInfoCardProps = {
  status: string;
  date: string;
  time: string;
  address: string;
  eventType: "LIVE" | "VIRTUAL";
  organizer?: {
    name: string;
    logo?: string | null;
  } | null;
};

const EventInfoCard = ({
  status,
  date,
  time,
  address,
  eventType,
  organizer,
}: EventInfoCardProps) => {
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
    <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
      <h3 className="font-display text-2xl lg:text-3xl tracking-wide mb-6 border-b border-border pb-4">
        EVENT INFO
      </h3>

      <div className="space-y-5">
        {/* Status */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-event-gold/10 flex items-center justify-center flex-shrink-0">
            <Activity size={20} className="text-event-gold" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] lg:text-xs text-muted-foreground tracking-widest uppercase mb-1">
              Status
            </p>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                status,
              )}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
              {getStatusLabel(status)}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-event-gold/10 flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-event-gold" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] lg:text-xs text-muted-foreground tracking-widest uppercase mb-1">
              Date
            </p>
            <p className="font-body text-sm lg:text-base font-medium text-foreground">
              {date}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-event-gold/10 flex items-center justify-center flex-shrink-0">
            <Clock size={20} className="text-event-gold" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] lg:text-xs text-muted-foreground tracking-widest uppercase mb-1">
              Time
            </p>
            <p className="font-body text-sm lg:text-base font-medium text-foreground">
              {time}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-event-gold/10 flex items-center justify-center flex-shrink-0">
            <MapPin size={20} className="text-event-gold" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] lg:text-xs text-muted-foreground tracking-widest uppercase mb-1">
              Location
            </p>
            <p className="font-body text-sm lg:text-base font-medium text-foreground leading-relaxed">
              {address}
            </p>
          </div>
        </div>

        {/* Event Type */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-event-gold/10 flex items-center justify-center flex-shrink-0">
            <Globe size={20} className="text-event-gold" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] lg:text-xs text-muted-foreground tracking-widest uppercase mb-1">
              Event Type
            </p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                eventType === "VIRTUAL"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-neon-lime/20 text-neon-lime"
              }`}
            >
              {eventType === "LIVE" ? "🎪 In-Person" : "💻 Virtual"}
            </span>
          </div>
        </div>
      </div>

      {/* Organized By Section */}
      <div className="-mx-4 lg:-mx-6 -mb-4 lg:-mb-6 mt-6 rounded-b-lg bg-gray-50 px-4 lg:px-6 py-4">
        <p className="mb-3 text-xs font-medium tracking-wider text-gray-400 uppercase">
          Organized By
        </p>
        <div className="flex items-center gap-3">
          {organizer?.logo ? (
            <img
              src={organizer.logo}
              alt={organizer.name}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Building2 className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {organizer?.name || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventInfoCard;
