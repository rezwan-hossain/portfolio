// module/profile/components/admin/ActivityStatsBar.tsx
"use client";

import type { ActivityItem, ActivityStats } from "@/types/profile";
import {
  Activity,
  UserPlus,
  CreditCard,
  XCircle,
  CalendarDays,
  CalendarClock,
} from "lucide-react";

type Props = {
  activities: ActivityItem[];
};

function computeStats(activities: ActivityItem[]): ActivityStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  return {
    total: activities.length,
    registrations: activities.filter((a) => a.type === "registration").length,
    payments: activities.filter((a) => a.type === "payment").length,
    cancellations: activities.filter((a) => a.type === "cancellation").length,
    confirmations: activities.filter((a) => a.type === "confirmation").length,
    todayCount: activities.filter((a) => new Date(a.timestamp) >= todayStart)
      .length,
    weekCount: activities.filter((a) => new Date(a.timestamp) >= weekStart)
      .length,
  };
}

export function ActivityStatsBar({ activities }: Props) {
  const stats = computeStats(activities);

  const items = [
    {
      label: "Total",
      value: stats.total,
      icon: Activity,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Registrations",
      value: stats.registrations,
      icon: UserPlus,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Payments",
      value: stats.payments,
      icon: CreditCard,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Cancellations",
      value: stats.cancellations,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Today",
      value: stats.todayCount,
      icon: CalendarDays,
      color: "bg-yellow-50 text-yellow-600",
      sub: `${stats.weekCount} this week`,
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100"
        >
          <div className={`p-1.5 rounded-lg ${item.color}`}>
            <item.icon size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {item.value}
            </p>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider truncate">
              {item.label}
            </p>
            {"sub" in item && item.sub && (
              <p className="text-[9px] text-gray-400 truncate">{item.sub}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
