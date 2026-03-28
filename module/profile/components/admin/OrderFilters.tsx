// module/profile/components/admin/OrderFilters.tsx
"use client";

import { Search, X } from "lucide-react";
import type { OrderFilterState } from "@/types/profile";

type Props = {
  filters: OrderFilterState;
  onChange: (filters: OrderFilterState) => void;
  resultCount: number;
  totalCount: number;
};

export function OrderFilters({
  filters,
  onChange,
  resultCount,
  totalCount,
}: Props) {
  const update = (key: keyof OrderFilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActive =
    filters.search ||
    filters.paymentStatus !== "all" ||
    filters.orderStatus !== "all";

  return (
    <div className="space-y-3 mb-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search by name, email, phone, transaction ID..."
          className="w-full h-10 pl-9 pr-9 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
        />
        {filters.search && (
          <button
            onClick={() => update("search", "")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Order Status Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            Order:
          </span>
          {[
            { value: "all", label: "All" },
            { value: "CONFIRMED", label: "Confirmed" },
            { value: "PENDING", label: "Pending" },
            { value: "CANCELLED", label: "Cancelled" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => update("orderStatus", option.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                filters.orderStatus === option.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Payment Status Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            Payment:
          </span>
          {[
            { value: "all", label: "All" },
            { value: "PAID", label: "Paid" },
            { value: "PENDING", label: "Pending" },
            { value: "FAILED", label: "Failed" },
            { value: "REFUNDED", label: "Refunded" },
          ].map((option) => (
            <button
              key={`pay-${option.value}`}
              onClick={() => update("paymentStatus", option.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                filters.paymentStatus === option.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => update("sortBy", e.target.value)}
          className="h-8 px-3 border border-gray-200 rounded-lg bg-white text-xs font-medium text-gray-600 focus:outline-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount_high">Amount: High → Low</option>
          <option value="amount_low">Amount: Low → High</option>
        </select>

        {/* Result count */}
        <span className="ml-auto text-xs text-gray-400">
          {resultCount === totalCount
            ? `${totalCount} orders`
            : `${resultCount} of ${totalCount}`}
        </span>

        {/* Clear */}
        {hasActive && (
          <button
            onClick={() =>
              onChange({
                search: "",
                paymentStatus: "all",
                orderStatus: "all",
                sortBy: "newest",
              })
            }
            className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
