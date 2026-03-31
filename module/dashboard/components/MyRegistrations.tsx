// module/dashboard/components/MyRegistrations.tsx
import type { DashboardOrder } from "@/types/dashboard";
import Link from "next/link";
import { Calendar, MapPin, CreditCard, User, ChevronRight } from "lucide-react";

type MyRegistrationsProps = {
  orders: DashboardOrder[];
  variant: "upcoming" | "pending" | "all";
};

export function MyRegistrations({ orders, variant }: MyRegistrationsProps) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <RegistrationCard key={order.id} order={order} variant={variant} />
      ))}
    </div>
  );
}

function RegistrationCard({
  order,
  variant,
}: {
  order: DashboardOrder;
  variant: string;
}) {
  const eventDate = new Date(order.event.date);
  const isPast = eventDate < new Date();
  const daysUntil = Math.ceil(
    (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <Link
      href={`/events/${order.event.slug}`}
      className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Event Image */}
        <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
          <img
            src={order.event.bannerImage}
            alt={order.event.name}
            className="w-full h-full object-cover"
          />
          {/* Event Type Badge */}
          <span
            className={`absolute top-2 left-2 px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
              order.event.eventType === "VIRTUAL"
                ? "bg-purple-500/90 text-white backdrop-blur-sm"
                : "bg-green-500/90 text-white backdrop-blur-sm"
            }`}
          >
            {order.event.eventType}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {order.event.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                by {order.event.organizer.name}
              </p>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <OrderStatusBadge status={order.status} />
              {order.payment && (
                <PaymentStatusBadge status={order.payment.status} />
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">
                {eventDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{order.event.address}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">
                {order.registration?.fullName || "—"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-900">
                ৳{order.payment?.amount ?? order.package.price}
              </span>
            </div>
          </div>

          {/* Package + Bottom Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
            {/* Left: Tags & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full font-medium">
                {order.package.distance}
              </span>
              <span className="text-sm text-gray-600">
                {order.package.name}
              </span>

              {order.registration?.tshirtSize && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  T-Shirt: {order.registration.tshirtSize}
                </span>
              )}

              {order.registration?.bibNumber && (
                <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                  BIB:{" "}
                  <span className="font-mono font-semibold">
                    {order.registration.bibNumber}
                  </span>
                </span>
              )}
            </div>

            {/* Right: Actions & Info */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
              {/* Days Until Event */}
              {!isPast && order.status === "CONFIRMED" && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                  {daysUntil === 0
                    ? "Today!"
                    : daysUntil === 1
                      ? "Tomorrow"
                      : `${daysUntil} days left`}
                </span>
              )}

              {/* Retry Payment */}
              {variant === "pending" && order.payment?.status !== "PAID" && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/payment/retry?orderId=${order.id}`;
                  }}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
                >
                  Pay Now
                </button>
              )}

              {/* Transaction ID */}
              {order.payment?.transactionId && (
                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                  TRX: {order.payment.transactionId}
                </span>
              )}

              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-orange-100 text-orange-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
