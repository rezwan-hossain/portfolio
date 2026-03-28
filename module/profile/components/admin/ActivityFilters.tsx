// module/profile/components/admin/ActivityFilters.tsx
"use client";

import { Search, X } from "lucide-react";
import type { ActivityFilterState } from "@/types/profile";

type Props = {
  filters: ActivityFilterState;
  onChange: (filters: ActivityFilterState) => void;
  resultCount: number;
  totalCount: number;
};

export function ActivityFilters({
  filters,
  onChange,
  resultCount,
  totalCount,
}: Props) {
  const update = (key: keyof ActivityFilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActive = filters.search || filters.type !== "all";

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
          placeholder="Search by name, email, package..."
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

      {/* Type Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { value: "all", label: "All Activity" },
            { value: "registration", label: "Registrations" },
            { value: "payment", label: "Payments" },
            { value: "confirmation", label: "Confirmations" },
            { value: "cancellation", label: "Cancellations" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            onClick={() => update("type", option.value)}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors cursor-pointer ${
              filters.type === option.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}

        {/* Count */}
        <span className="ml-auto text-xs text-gray-400">
          {resultCount === totalCount
            ? `${totalCount} activities`
            : `${resultCount} of ${totalCount}`}
        </span>

        {/* Clear */}
        {hasActive && (
          <button
            onClick={() => onChange({ search: "", type: "all" })}
            className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
