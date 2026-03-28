// module/profile/components/admin/EventActivityModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { getEventActivity } from "@/app/actions/admin";
import type {
  AdminEvent,
  ActivityItem,
  ActivityFilterState,
} from "@/types/profile";
import { ActivityStatsBar } from "./ActivityStatsBar";
import { ActivityFilters } from "./ActivityFilters";
import { ActivityCard } from "./ActivityCard";
import { X, Loader2, Activity, RefreshCw } from "lucide-react";

type Props = {
  event: AdminEvent;
  onClose: () => void;
};

export function EventActivityModal({ event, onClose }: Props) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<ActivityFilterState>({
    type: "all",
    search: "",
  });

  // ─── Load ─────────────────────────────────────────
  const loadActivity = useCallback(async () => {
    const { activities: data } = await getEventActivity(event.id);
    setActivities(data);
  }, [event.id]);

  useEffect(() => {
    const init = async () => {
      await loadActivity();
      setLoading(false);
    };
    init();
  }, [loadActivity]);

  // ─── Escape key ───────────────────────────────────
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  // ─── Lock body scroll ─────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ─── Refresh ──────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivity();
    setRefreshing(false);
  };

  // ─── Filter ───────────────────────────────────────
  const filtered = activities.filter((item) => {
    // Type
    if (filters.type !== "all" && item.type !== filters.type) return false;

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        item.user.name.toLowerCase().includes(q) ||
        item.user.email.toLowerCase().includes(q) ||
        item.meta.packageName.toLowerCase().includes(q) ||
        item.meta.distance.toLowerCase().includes(q) ||
        (item.meta.transactionId &&
          item.meta.transactionId.toLowerCase().includes(q)) ||
        (item.meta.registrationName &&
          item.meta.registrationName.toLowerCase().includes(q)) ||
        item.message.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // ─── Group by Date ────────────────────────────────
  const grouped = groupByDate(filtered);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900 truncate">
                Activity Log
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {event.name} · Recent activity
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">Loading activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-bold text-lg">No activity yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Activity will appear here when orders come in
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <ActivityStatsBar activities={activities} />

              {/* Filters */}
              <ActivityFilters
                filters={filters}
                onChange={setFilters}
                resultCount={filtered.length}
                totalCount={activities.length}
              />

              {/* Timeline */}
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-medium">
                    No activity matches your filters
                  </p>
                  <button
                    onClick={() => setFilters({ type: "all", search: "" })}
                    className="text-sm text-gray-900 font-bold mt-2 hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-0">
                  {grouped.map(({ label, items }) => (
                    <div key={label}>
                      {/* Date Header */}
                      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-2 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                            {label}
                          </span>
                          <div className="flex-1 h-px bg-gray-100" />
                          <span className="text-[10px] text-gray-300">
                            {items.length}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      {items.map((item) => (
                        <ActivityCard key={item.id} activity={item} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Footer ─── */}
        {!loading && activities.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50 rounded-b-2xl">
            <p className="text-xs text-gray-400">
              Showing {filtered.length} of {activities.length} activities
            </p>
            <p className="text-xs text-gray-400">Last 50 orders</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Group Activities by Date ───────────────────────
function groupByDate(
  activities: ActivityItem[],
): { label: string; items: ActivityItem[] }[] {
  const groups: Record<string, ActivityItem[]> = {};

  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  for (const activity of activities) {
    const date = new Date(activity.timestamp);
    const dateStr = date.toDateString();

    let label: string;
    if (dateStr === todayStr) {
      label = "Today";
    } else if (dateStr === yesterdayStr) {
      label = "Yesterday";
    } else {
      label = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(activity);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}
