// module/dashboard/pages/DashboardPage.tsx
"use client";

import { HeroText } from "@/components/ui/HeroText";
import { StatCard } from "../components/StatCard";

import { CalendarCheck, CreditCard, ShoppingBag, Timer } from "lucide-react";
import type {
  DashboardUser,
  DashboardStats,
  DashboardOrder,
  DashboardEvent,
} from "@/types/dashboard";
import { UserProfileCard } from "../components/UserProfileCard";
import { MyRegistrations } from "../components/MyRegistrations";
import { UpcomingEvents } from "../components/UpcomingEvents";

type DashboardPageProps = {
  user: DashboardUser;
  stats: DashboardStats;
  orders: DashboardOrder[];
  activeEvents: DashboardEvent[];
};

const DashboardPage = ({
  user,
  stats,
  orders,
  activeEvents,
}: DashboardPageProps) => {
  // Separate orders by status
  const confirmedOrders = orders.filter((o) => o.status === "CONFIRMED");
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const paidOrders = orders.filter((o) => o.payment?.status === "PAID");

  // Upcoming registered events
  const upcomingRegistrations = confirmedOrders.filter(
    (o) => new Date(o.event.date) >= new Date(),
  );

  const statCards = [
    {
      title: "My Registrations",
      value: String(stats.totalOrders),
      change:
        stats.confirmedOrders > 0
          ? `${stats.confirmedOrders} confirmed`
          : "No registrations yet",
      changeType:
        stats.confirmedOrders > 0
          ? ("positive" as const)
          : ("neutral" as const),
      icon: ShoppingBag,
    },
    {
      title: "Upcoming Events",
      value: String(stats.upcomingEvents),
      change:
        stats.upcomingEvents > 0
          ? "Events you're registered for"
          : "No upcoming events",
      changeType:
        stats.upcomingEvents > 0 ? ("positive" as const) : ("neutral" as const),
      icon: CalendarCheck,
    },
    {
      title: "Total Paid",
      value: `৳${stats.totalPaid.toLocaleString()}`,
      change:
        paidOrders.length > 0
          ? `${paidOrders.length} payment(s) completed`
          : "No payments yet",
      changeType:
        paidOrders.length > 0 ? ("positive" as const) : ("neutral" as const),
      icon: CreditCard,
    },
    {
      title: "Pending",
      value: String(stats.pendingOrders),
      change:
        stats.pendingOrders > 0
          ? "Awaiting payment"
          : "All payments up to date",
      changeType:
        stats.pendingOrders > 0 ? ("negative" as const) : ("positive" as const),
      icon: Timer,
    },
  ];

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="mt-52">
        <HeroText title="Dashboard" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Welcome + Profile */}
        <div className="mb-8">
          <UserProfileCard user={user} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: My Registrations (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Registered Events */}
            {upcomingRegistrations.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-green-600" />
                  Upcoming Registered Events
                </h2>
                <MyRegistrations
                  orders={upcomingRegistrations}
                  variant="upcoming"
                />
              </div>
            )}

            {/* Pending Payments */}
            {pendingOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-yellow-600" />
                  Pending Payments
                </h2>
                <MyRegistrations orders={pendingOrders} variant="pending" />
              </div>
            )}

            {/* All Registrations */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                All Registrations
              </h2>
              {orders.length > 0 ? (
                <MyRegistrations orders={orders} variant="all" />
              ) : (
                <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No registrations yet
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Browse events and register for your first run!
                  </p>
                  <a
                    href="/events"
                    className="inline-block mt-4 px-6 py-2 bg-indigo-500 text-white rounded-full text-sm font-medium hover:opacity-90"
                  >
                    Browse Events
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right: Active Events (1 col) */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              🔥 Active Events
            </h2>
            <UpcomingEvents events={activeEvents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
