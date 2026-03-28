// module/profile/components/admin/EventStatsBar.tsx
"use client";

import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Package,
} from "lucide-react";
import type { AdminEvent } from "@/types/profile";

type Props = {
  events: AdminEvent[];
};

export function EventStatsBar({ events }: Props) {
  const totalEvents = events.length;
  const activeEvents = events.filter(
    (e) => e.isActive && e.status === "ACTIVE",
  ).length;
  const totalOrders = events.reduce((sum, e) => sum + e._count.orders, 0);
  const totalPackages = events.reduce((sum, e) => sum + e.packages.length, 0);
  const totalSlots = events.reduce(
    (sum, e) => sum + e.packages.reduce((s, p) => s + p.availableSlots, 0),
    0,
  );
  const usedSlots = events.reduce(
    (sum, e) => sum + e.packages.reduce((s, p) => s + p.usedSlots, 0),
    0,
  );
  const fillRate =
    totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0;

  const estimatedRevenue = events.reduce(
    (sum, e) =>
      sum + e.packages.reduce((s, p) => s + p.usedSlots * Number(p.price), 0),
    0,
  );

  const stats = [
    {
      label: "Total Events",
      value: totalEvents,
      sub: `${activeEvents} active`,
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      sub: `across all events`,
      icon: Users,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Est. Revenue",
      value: `৳${estimatedRevenue.toLocaleString()}`,
      sub: "from registrations",
      icon: DollarSign,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Fill Rate",
      value: `${fillRate}%`,
      sub: `${usedSlots}/${totalSlots} slots`,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-gray-900 leading-tight">
                {stat.value}
              </p>
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{stat.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
