// module/profile/components/admin/ActivityCard.tsx
"use client";

import type { ActivityItem } from "@/types/profile";
import {
  UserPlus,
  CreditCard,
  CheckCircle,
  XCircle,
  Package,
  Hash,
  Shirt,
} from "lucide-react";

type Props = {
  activity: ActivityItem;
  showEventName?: boolean;
};

const TYPE_CONFIG = {
  registration: {
    icon: UserPlus,
    color: "text-green-600",
    bg: "bg-green-500",
    ringColor: "ring-green-100",
    lineColor: "bg-green-200",
  },
  payment: {
    icon: CreditCard,
    color: "text-purple-600",
    bg: "bg-purple-500",
    ringColor: "ring-purple-100",
    lineColor: "bg-purple-200",
  },
  confirmation: {
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-500",
    ringColor: "ring-blue-100",
    lineColor: "bg-blue-200",
  },
  cancellation: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-500",
    ringColor: "ring-red-100",
    lineColor: "bg-red-200",
  },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function ActivityCard({ activity, showEventName = false }: Props) {
  const config = TYPE_CONFIG[activity.type];
  const Icon = config.icon;

  return (
    <div className="relative flex gap-3 group">
      {/* Timeline Line */}
      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-100 group-last:hidden" />

      {/* Icon */}
      <div
        className={`relative z-10 flex-shrink-0 w-[30px] h-[30px] rounded-full ${config.bg} ring-4 ${config.ringColor} flex items-center justify-center`}
      >
        <Icon size={14} className="text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-start justify-between gap-2">
          {/* Left */}
          <div className="min-w-0">
            {/* Message */}
            <p className="text-sm text-gray-900 leading-snug">
              <span className="font-bold">{activity.user.name}</span>{" "}
              <span className="text-gray-600">
                {activity.type === "registration" && "registered for"}
                {activity.type === "payment" && "paid for"}
                {activity.type === "confirmation" && "was confirmed for"}
                {activity.type === "cancellation" && "was cancelled from"}
              </span>{" "}
              <span className="font-semibold text-gray-800">
                {activity.meta.packageName}
              </span>
            </p>

            {/* Description */}
            <p className="text-xs text-gray-400 mt-0.5">
              {activity.description}
            </p>

            {/* Event name (global view) */}
            {showEventName && activity.meta.eventName && (
              <p className="text-xs text-indigo-500 font-medium mt-0.5">
                {activity.meta.eventName}
              </p>
            )}

            {/* Meta Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {/* Distance */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-600 rounded-full font-bold">
                <Package size={10} />
                {activity.meta.distance}
              </span>

              {/* Amount */}
              {activity.type === "payment" && (
                <span className="px-2 py-0.5 text-[10px] bg-green-50 text-green-700 rounded-full font-bold">
                  ৳{Number(activity.meta.amount).toLocaleString()}
                </span>
              )}

              {/* Payment Method */}
              {activity.type === "payment" && activity.meta.paymentMethod && (
                <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full font-medium">
                  {activity.meta.paymentMethod}
                </span>
              )}

              {/* Transaction ID */}
              {activity.type === "payment" && activity.meta.transactionId && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded-full font-mono">
                  <Hash size={9} />
                  {activity.meta.transactionId.slice(0, 12)}...
                </span>
              )}

              {/* T-Shirt */}
              {activity.type === "registration" && activity.meta.tshirtSize && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] bg-yellow-50 text-yellow-700 rounded-full font-medium">
                  <Shirt size={10} />
                  {activity.meta.tshirtSize}
                </span>
              )}

              {/* Runner Category */}
              {activity.type === "registration" &&
                activity.meta.runnerCategory && (
                  <span className="px-2 py-0.5 text-[10px] bg-orange-50 text-orange-600 rounded-full font-medium">
                    {activity.meta.runnerCategory}
                  </span>
                )}

              {/* Qty */}
              {activity.meta.qty > 1 && (
                <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full font-medium">
                  × {activity.meta.qty}
                </span>
              )}
            </div>
          </div>

          {/* Right — Timestamp + Avatar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-gray-400 whitespace-nowrap">
              {formatRelativeTime(activity.timestamp)}
            </span>

            {/* Avatar */}
            {activity.user.image ? (
              <img
                src={activity.user.image}
                alt={activity.user.name}
                className="w-7 h-7 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-500">
                  {activity.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
