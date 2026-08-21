// module/profile/components/admin/OrderStatsRow.tsx
"use client";

import type { OrderStats } from "@/types/profile";
import { ShoppingBag, CheckCircle2, Clock, XCircle } from "lucide-react";

type Props = {
  /** Null while the aggregate query is still in flight. */
  stats: OrderStats | null;
};

/**
 * Whole-event totals.
 *
 * These used to be summed in the browser from every order on the event, which
 * meant the modal had to download all of them first. They're now computed by
 * Postgres via groupBy/aggregate, so this component just renders numbers.
 */
export function OrderStatsRow({ stats }: Props) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[68px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total",
      value: stats.total.toLocaleString(),
      icon: ShoppingBag,
      tone: "text-gray-400",
    },
    {
      label: "Confirmed",
      value: stats.confirmed.toLocaleString(),
      icon: CheckCircle2,
      tone: "text-green-500",
    },
    {
      label: "Pending",
      value: stats.pending.toLocaleString(),
      icon: Clock,
      tone: "text-amber-500",
    },
    {
      label: "Cancelled",
      value: stats.cancelled.toLocaleString(),
      icon: XCircle,
      tone: "text-red-500",
    },
  ];

  return (
    <div className="mb-4 space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-3"
          >
            <div className="flex items-center gap-1.5">
              <card.icon size={12} className={card.tone} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {card.label}
              </span>
            </div>
            <p className="mt-1 text-lg font-bold text-gray-900 tabular-nums">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Collected
          </span>
          <p className="mt-1 text-lg font-bold text-green-600 tabular-nums">
            ৳{stats.paidRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Total value
          </span>
          <p className="mt-1 text-lg font-bold text-gray-900 tabular-nums">
            ৳{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
