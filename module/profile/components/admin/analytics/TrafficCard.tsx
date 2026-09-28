// module/profile/components/admin/analytics/TrafficCard.tsx
"use client";

import { useEffect, useState } from "react";
import { getTraffic, type TrafficData } from "@/app/actions/traffic";
import type { AnalyticsRange } from "@/types/analytics";
import { BarList, Card, ColumnChart, StatTile, num } from "./charts";

const pct = (a: number, b: number) => (b > 0 ? `${(Math.round((a / b) * 1000) / 10).toLocaleString("en-IN")}%` : "—");
const fmtDay = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function TrafficCard({ eventId, range }: { eventId: string; range: AnalyticsRange }) {
  const [data, setData] = useState<TrafficData | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    void getTraffic(eventId, range).then((r) => {
      if (!alive) return;
      setData(r.data);
      setError(r.error ?? "");
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [eventId, range]);

  const heading = (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h3 className="text-sm font-bold text-gray-900">Website traffic</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {eventId === "all" ? "Whole site" : "This event's page"} · built-in counter, bots excluded
          {data?.countingSince && ` · counting since ${fmtDay(data.countingSince)}`}
        </p>
      </div>
    </div>
  );

  if (!loaded) {
    return (
      <div className="space-y-3">
        {heading}
        <div className="h-48 bg-white border border-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-3">
        {heading}
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }
  if (!data || !data.countingSince) {
    return (
      <div className="space-y-3">
        {heading}
        <div className="bg-white border border-gray-200 rounded-xl py-10 text-center">
          <p className="text-gray-900 font-bold">No visits counted yet</p>
          <p className="text-gray-400 text-sm mt-1">Numbers appear here as soon as people visit the site.</p>
        </div>
      </div>
    );
  }

  const funnelTotals = data.funnel.reduce(
    (t, f) => ({ views: t.views + f.views, checkouts: t.checkouts + f.checkouts, paid: t.paid + f.paid }),
    { views: 0, checkouts: 0, paid: 0 },
  );

  return (
    <div className="space-y-3">
      {heading}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Page views" value={num(data.totals.views)} note="Refreshes within 10s count once" />
        <StatTile label="Unique visitors" value={num(data.totals.uniques)} note="Summed per day" />
        <StatTile
          label="Visit → checkout"
          value={pct(funnelTotals.checkouts, funnelTotals.views)}
          note={`${num(funnelTotals.checkouts)} checkouts started`}
        />
        <StatTile
          label="Visit → paid"
          value={pct(funnelTotals.paid, funnelTotals.views)}
          note={`${num(funnelTotals.paid)} paid online orders`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Page views" subtitle="Per day (Dhaka time)">
          <ColumnChart
            points={data.series.map((p) => ({ date: p.date, value: p.views }))}
            format={num}
            unitLabel="page views"
            bucket="day"
          />
        </Card>
        <Card title="Top pages" subtitle="Whole site, in this period">
          <BarList items={data.topPages} empty="No page views yet" />
        </Card>
      </div>

      <Card title="From visit to payment" subtitle="Event page views → checkouts started → paid, in this period">
        {data.funnel.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No event page visits yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[520px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="font-bold py-2 pr-3">Event</th>
                  <th className="font-bold py-2 pr-3 text-right">Page views</th>
                  <th className="font-bold py-2 pr-3 text-right">Checkouts</th>
                  <th className="font-bold py-2 pr-3 text-right">Paid</th>
                  <th className="font-bold py-2 pr-3 text-right">Visit → checkout</th>
                  <th className="font-bold py-2 text-right">Checkout → paid</th>
                </tr>
              </thead>
              <tbody>
                {data.funnel.map((f) => (
                  <tr key={f.eventId} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-3 font-semibold text-gray-900">{f.eventName}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700">{num(f.views)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700">{num(f.checkouts)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-gray-900 font-semibold">{num(f.paid)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700">{pct(f.checkouts, f.views)}</td>
                    <td className="py-2.5 text-right tabular-nums text-gray-700">{pct(f.paid, f.checkouts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] text-gray-400 mt-2">
          Checkouts and paid count online orders placed since the counter started, so the rates compare like with like.
        </p>
      </Card>
    </div>
  );
}
