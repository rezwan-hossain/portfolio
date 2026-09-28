// module/profile/components/admin/AdminReturningRunnersPanel.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getReturningRunners,
  type ReturningRunner,
  type ReturningSummary,
} from "@/app/actions/returning-runners";
import { ChevronLeft, ChevronRight, Download, Repeat, Search, X } from "lucide-react";

const PAGE = 50;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
const num = (n: number) => n.toLocaleString("en-IN");

/** RFC-4180 escaping — quote only when needed. */
const esc = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function AdminReturningRunnersPanel({
  events,
  eventId: controlledEventId,
  embedded = false,
}: {
  events: { id: string; name: string }[];
  /** When given (e.g. by the Dashboard), the event filter follows it. */
  eventId?: string;
  /** Compact heading and no own event dropdown, for use inside another page. */
  embedded?: boolean;
}) {
  const [ownEventId, setEventId] = useState("all");
  const eventId = controlledEventId ?? ownEventId;
  const [minEvents, setMinEvents] = useState(2);
  const [search, setSearch] = useState("");
  const [runners, setRunners] = useState<ReturningRunner[] | null>(null);
  const [summary, setSummary] = useState<ReturningSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const seq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback((ev: string, min: number, term: string) => {
    const id = ++seq.current;
    return getReturningRunners({ eventId: ev, minEvents: min, search: term }).then((r) => {
      if (id !== seq.current) return; // a newer request won
      setRunners(r.runners);
      setSummary(r.summary);
      setError(r.error ?? "");
      setLoading(false);
      setPage(1);
    });
  }, []);

  // Latest min/search, for the event-change effect below (kept in sync by
  // refetch, which every filter change goes through).
  const minRef = useRef(2);
  const searchRef = useRef("");

  useEffect(() => {
    void load(eventId, minRef.current, searchRef.current);
  }, [eventId, load]);

  const refetch = (ev = eventId, min = minEvents, term = search, debounce = false) => {
    minRef.current = min;
    searchRef.current = term;
    if (timer.current) clearTimeout(timer.current);
    const go = () => {
      setLoading(true);
      void load(ev, min, term);
    };
    if (debounce) timer.current = setTimeout(go, 300);
    else go();
  };

  const exportCsv = () => {
    if (!runners) return;
    const header = ["Name", "Phone", "Email", "Events", "Event list", "First event", "Last event", "Total paid (BDT)"];
    const rows = runners.map((r) => [
      r.name,
      r.phone,
      r.email,
      r.eventCount,
      r.events.map((e) => `${e.name} (${e.packageName})`).join("; "),
      fmtDate(r.firstEventDate),
      fmtDate(r.lastEventDate),
      r.totalPaid,
    ]);
    // BOM so Excel opens Bangla names correctly.
    const csv = "﻿" + [header, ...rows].map((row) => row.map(esc).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `returning-runners-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const total = runners?.length ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const visible = runners?.slice((page - 1) * PAGE, page * PAGE) ?? [];
  const share =
    summary && summary.runners > 0 ? Math.round((summary.returning / summary.runners) * 1000) / 10 : 0;
  const scopeName = eventId === "all" ? null : events.find((e) => e.id === eventId)?.name;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {embedded ? (
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-gray-400" /> Returning runners
            </h3>
          ) : (
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-gray-400" /> Returning Runners
            </h2>
          )}
          <p className={embedded ? "text-xs text-gray-500 mt-0.5" : "text-sm text-gray-500 mt-1"}>
            People with paid registrations in two or more of your events, matched by phone number
            {embedded ? " · all time (the date range above doesn't apply)" : ""}.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!runners || runners.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download everyone in the current list"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Returning runners</p>
          <p className="text-2xl font-black text-gray-900 mt-1 tabular-nums">{summary ? num(summary.returning) : "—"}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
            {scopeName ? `of ${scopeName}'s runners` : "ran 2 or more events"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Share of runners</p>
          <p className="text-2xl font-black text-gray-900 mt-1 tabular-nums">{summary ? `${share}%` : "—"}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {summary ? `of ${num(summary.runners)} unique runners${scopeName ? " in this event" : ""}` : ""}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Events with runners</p>
          <p className="text-2xl font-black text-gray-900 mt-1 tabular-nums">{summary ? num(summary.eventsWithRunners) : "—"}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">paid registrations only</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[12rem]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <label htmlFor="rr-search" className="sr-only">Search</label>
          <input
            id="rr-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              refetch(eventId, minEvents, e.target.value, true);
            }}
            placeholder="Search name, phone or email"
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                refetch(eventId, minEvents, "");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
        {controlledEventId === undefined && (
        <>
        <label htmlFor="rr-event" className="sr-only">Event</label>
        <select
          id="rr-event"
          value={eventId}
          onChange={(e) => {
            setEventId(e.target.value);
            refetch(e.target.value);
          }}
          className="h-9 max-w-[16rem] px-3 rounded-lg border border-gray-200 bg-white text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="all">All events</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        </>
        )}
        <label htmlFor="rr-min" className="sr-only">Minimum events</label>
        <select
          id="rr-min"
          value={minEvents}
          onChange={(e) => {
            setMinEvents(Number(e.target.value));
            refetch(eventId, Number(e.target.value));
          }}
          className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}+ events</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* List */}
      {runners === null ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-white border border-gray-200 rounded-xl" />
          ))}
        </div>
      ) : runners.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-14 text-center">
          <p className="text-gray-900 font-bold">No returning runners {search ? "match this search" : "yet"}</p>
          <p className="text-gray-400 text-sm mt-1">
            {scopeName
              ? `Nobody from ${scopeName} has run ${minEvents}+ of your events.`
              : `Runners show up here once they've registered for ${minEvents}+ events.`}
          </p>
        </div>
      ) : (
        <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-opacity ${loading ? "opacity-60" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100 bg-gray-50/60">
                  <th className="font-bold py-2.5 px-4">Runner</th>
                  <th className="font-bold py-2.5 px-4">Contact</th>
                  <th className="font-bold py-2.5 px-4">Events</th>
                  <th className="font-bold py-2.5 px-4 text-right">Paid</th>
                  <th className="font-bold py-2.5 px-4 text-right">Last event</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.key} className="border-b border-gray-50 last:border-0 align-top">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      <p className="text-[11px] text-gray-500">{r.eventCount} events</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {r.phone && <p className="tabular-nums select-all">{r.phone}</p>}
                      {r.email && <p className="break-all select-all">{r.email}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {r.events.map((e) => (
                          <span
                            key={e.id}
                            className="text-[11px] rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-gray-700"
                            title={`${e.name} · ${e.packageName} · ${fmtDate(e.date)}`}
                          >
                            {e.name} <span className="text-gray-400">· {e.packageName}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-900">৳{num(r.totalPaid)}</td>
                    <td className="py-3 px-4 text-right text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.lastEventDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500 tabular-nums">
              {num((page - 1) * PAGE + 1)}–{num(Math.min(page * PAGE, total))} of {num(total)}
            </p>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer disabled:opacity-30" title="Previous page">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-gray-600 px-2 tabular-nums">{page} / {pages}</span>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer disabled:opacity-30" title="Next page">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
