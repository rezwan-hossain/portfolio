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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Event Image */}
        <div className="relative w-full sm:w-40 h-32 sm:h-auto flex-shrink-0">
          <img
            src={order.event.bannerImage}
            alt={order.event.name}
            className="w-full h-full object-cover"
          />
          {/* Event Type Badge */}
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
              order.event.eventType === "VIRTUAL"
                ? "bg-purple-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {order.event.eventType}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <Link
                href={`/events/${order.event.slug}`}
                className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {order.event.name}
              </Link>
              <p className="text-xs text-gray-400 mt-0.5">
                by {order.event.organizer.name}
              </p>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={order.status} />
              {order.payment && (
                <PaymentStatusBadge status={order.payment.status} />
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {eventDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{order.event.address}</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <User className="w-3.5 h-3.5" />
              <span>{order.registration?.fullName || "—"}</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <CreditCard className="w-3.5 h-3.5" />
              <span>৳{order.payment?.amount ?? order.package.price}</span>
            </div>
          </div>

          {/* Package + Bottom Row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded-full font-medium">
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
            </div>

            <div className="flex items-center gap-2">
              {/* Days Until Event */}
              {!isPast && order.status === "CONFIRMED" && (
                <span className="text-xs text-green-600 font-medium">
                  {daysUntil === 0
                    ? "Today!"
                    : daysUntil === 1
                      ? "Tomorrow"
                      : `${daysUntil} days left`}
                </span>
              )}

              {/* Retry Payment */}
              {variant === "pending" && order.payment?.status !== "PAID" && (
                <Link
                  href={`/payment/retry?orderId=${order.id}`}
                  className="px-3 py-1.5 text-xs font-medium bg-indigo-500 text-white rounded-full hover:opacity-90"
                >
                  Pay Now
                </Link>
              )}

              {/* Transaction ID */}
              {order.payment?.bkashTrxId && (
                <span className="text-xs text-gray-400 font-mono">
                  TRX: {order.payment.bkashTrxId}
                </span>
              )}

              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
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
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
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
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
