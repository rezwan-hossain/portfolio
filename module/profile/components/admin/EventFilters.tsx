// module/profile/components/admin/EventFilters.tsx
"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import type { AdminEvent } from "@/types/profile";

type FilterState = {
  search: string;
  status: string;
  eventType: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

type Props = {
  events: AdminEvent[];
  onFilter: (filtered: AdminEvent[]) => void;
};

export function EventFilters({ events, onFilter }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    eventType: "all",
    sortBy: "date",
    sortOrder: "desc",
  });

  const applyFilters = (newFilters: FilterState) => {
    let result = [...events];

    // Search
    if (newFilters.search) {
      const q = newFilters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.slug.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q) ||
          e.organizer.name.toLowerCase().includes(q),
      );
    }

    // Status
    if (newFilters.status !== "all") {
      if (newFilters.status === "inactive_flag") {
        result = result.filter((e) => !e.isActive);
      } else {
        result = result.filter((e) => e.status === newFilters.status);
      }
    }

    // Event Type
    if (newFilters.eventType !== "all") {
      result = result.filter((e) => e.eventType === newFilters.eventType);
    }

    // Sort
    result.sort((a, b) => {
      let compare = 0;
      switch (newFilters.sortBy) {
        case "date":
          compare = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "name":
          compare = a.name.localeCompare(b.name);
          break;
        case "orders":
          compare = a._count.orders - b._count.orders;
          break;
        case "packages":
          compare = a.packages.length - b.packages.length;
          break;
      }
      return newFilters.sortOrder === "desc" ? -compare : compare;
    });

    onFilter(result);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    applyFilters(updated);
  };

  const clearFilters = () => {
    const reset: FilterState = {
      search: "",
      status: "all",
      eventType: "all",
      sortBy: "date",
      sortOrder: "desc",
    };
    setFilters(reset);
    applyFilters(reset);
  };

  const hasActiveFilters =
    filters.search || filters.status !== "all" || filters.eventType !== "all";

  return (
    <div className="mb-5 space-y-3">
      {/* Search + Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search events by name, slug, location..."
            className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 h-10 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            showFilters || hasActiveFilters
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-neon-lime" />
          )}
        </button>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="inactive_flag">Deactivated</option>
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Type
            </label>
            <select
              value={filters.eventType}
              onChange={(e) => updateFilter("eventType", e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="LIVE">Live</option>
              <option value="VIRTUAL">Virtual</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter("sortBy", e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none cursor-pointer"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="orders">Orders</option>
              <option value="packages">Packages</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilter("sortOrder", e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none cursor-pointer"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="self-end h-9 px-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
