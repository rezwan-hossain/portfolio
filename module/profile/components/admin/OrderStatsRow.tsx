// module/profile/components/admin/OrderStatsRow.tsx
"use client";

import type { EventOrder, OrderStats } from "@/types/profile";
import {
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";

type Props = {
  orders: EventOrder[];
};

function computeStats(orders: EventOrder[]): OrderStats {
  const confirmed = orders.filter((o) => o.status === "CONFIRMED");
  const pending = orders.filter((o) => o.status === "PENDING");
  const cancelled = orders.filter((o) => o.status === "CANCELLED");

  const paidOrders = orders.filter((o) => o.payment?.status === "PAID");

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.payment?.amount || o.package.price * o.qty),
    0,
  );
  const paidRevenue = paidOrders.reduce(
    (sum, o) => sum + (o.payment?.amount || 0),
    0,
  );

  return {
    total: orders.length,
    confirmed: confirmed.length,
    pending: pending.length,
    cancelled: cancelled.length,
    totalRevenue,
    paidRevenue,
  };
}

export function OrderStatsRow({ orders }: Props) {
  const stats = computeStats(orders);

  const items = [
    {
      label: "Total",
      value: stats.total,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Paid Revenue",
      value: `৳${stats.paidRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-50 text-purple-600",
      sub: `of ৳${stats.totalRevenue.toLocaleString()} total`,
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
