// module/profile/components/admin/analytics/charts.tsx
"use client";

import { useState } from "react";
import type { CountItem, CouponRow, PackageRow } from "@/types/analytics";

// Chart palette (validated reference palette, light mode). Text never uses
// these — values and labels stay in the gray text tokens.
export const SERIES_1 = "#2a78d6"; // blue — primary series
export const SERIES_2 = "#eb6834"; // orange — secondary series (held)
const TRACK = "#eef0f3";

/** ৳ with Bangladeshi digit grouping: ৳1,00,000 */
export const taka = (n: number) => `৳${Math.round(n).toLocaleString("en-IN")}`;
export const num = (n: number) => Math.round(n).toLocaleString("en-IN");

const shortDate = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

// Round an axis max up to 1/2/5 × 10^n so gridline labels are readable.
function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const m = v / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

// ─── Panel frame ───────────────────────────────────────
export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
      <header className="mb-4">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

// ─── Stat tile ─────────────────────────────────────────
export function StatTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate">
        {label}
      </p>
      <p className="text-2xl font-black text-gray-900 mt-1 tabular-nums truncate">
        {value}
      </p>
      {note && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{note}</p>}
    </div>
  );
}

// ─── Column chart (one series, hover tooltip) ──────────
export function ColumnChart({
  points,
  color = SERIES_1,
  format,
  unitLabel,
  bucket,
}: {
  points: { date: string; value: number }[];
  color?: string;
  format: (n: number) => string;
  unitLabel: string;
  bucket: "day" | "week";
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...points.map((p) => p.value)));
  const total = points.reduce((s, p) => s + p.value, 0);

  if (total === 0) {
    return (
      <p className="h-40 flex items-center justify-center text-sm text-gray-400">
        No {unitLabel} in this period
      </p>
    );
  }

  const hovered = hover !== null ? points[hover] : null;
  const labelIdx = new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]);

  return (
    <div>
      <div className="flex gap-2">
        {/* Y axis labels */}
        <div className="flex flex-col justify-between h-40 text-[10px] text-gray-400 tabular-nums text-right w-12 flex-shrink-0">
          <span>{format(max)}</span>
          <span>{format(max / 2)}</span>
          <span>0</span>
        </div>

        {/* Plot */}
        <div className="relative flex-1 min-w-0 h-40">
          {/* Recessive gridlines */}
          {[0, 50, 100].map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: `${t}%` }}
            />
          ))}

          <div
            className="absolute inset-0 flex items-end gap-[2px]"
            onMouseLeave={() => setHover(null)}
          >
            {points.map((p, i) => (
              // Full-height hit target, bigger than the bar itself.
              <div
                key={p.date}
                className="relative flex-1 h-full flex items-end cursor-default"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${shortDate(p.date)}: ${format(p.value)}`}
              >
                <div
                  className="w-full rounded-t-[4px] transition-opacity"
                  style={{
                    height: `${(p.value / max) * 100}%`,
                    minHeight: p.value > 0 ? 2 : 0,
                    background: color,
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {hovered && hover !== null && (
            <div
              className="absolute -top-2 z-10 pointer-events-none bg-gray-900 text-white rounded-lg px-2.5 py-1.5 text-xs shadow-lg whitespace-nowrap"
              style={{
                left: `${((hover + 0.5) / points.length) * 100}%`,
                transform: `translate(-${
                  hover < points.length / 4 ? 10 : hover > (points.length * 3) / 4 ? 90 : 50
                }%, -100%)`,
              }}
            >
              <span className="text-white/60">
                {bucket === "week" ? "Week of " : ""}
                {shortDate(hovered.date)}
              </span>{" "}
              <span className="font-bold tabular-nums">{format(hovered.value)}</span>
            </div>
          )}
        </div>
      </div>

      {/* X axis: first / middle / last only */}
      <div className="flex gap-2 mt-1.5">
        <div className="w-12 flex-shrink-0" />
        <div className="relative flex-1 h-4 text-[10px] text-gray-400">
          {points.map((p, i) =>
            labelIdx.has(i) ? (
              <span
                key={p.date}
                className="absolute whitespace-nowrap"
                style={{
                  left: `${((i + 0.5) / points.length) * 100}%`,
                  transform: `translateX(${i === 0 ? "-10%" : i === points.length - 1 ? "-90%" : "-50%"})`,
                }}
              >
                {shortDate(p.date)}
              </span>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Horizontal bar list (one measure per row) ─────────
export function BarList({
  items,
  empty = "No data yet",
  showShare = true,
}: {
  items: CountItem[];
  empty?: string;
  showShare?: boolean;
}) {
  const total = items.reduce((s, i) => s + i.value, 0);
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p className="text-sm text-gray-400 py-4">{empty}</p>;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.label}
          className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-3 text-xs"
          title={`${item.label}: ${num(item.value)}`}
        >
          <span className="text-gray-700 truncate">{item.label}</span>
          <span className="h-2 rounded-full" style={{ background: TRACK }}>
            <span
              className="block h-full rounded-full"
              style={{ width: `${(item.value / max) * 100}%`, background: SERIES_1 }}
            />
          </span>
          <span className="tabular-nums text-gray-900 font-semibold text-right min-w-[4.5rem]">
            {num(item.value)}
            {showShare && total > 0 && (
              <span className="text-gray-400 font-normal ml-1">
                {Math.round((item.value / total) * 100)}%
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─── Package capacity table ────────────────────────────
export function PackageTable({
  rows,
  showEvent,
}: {
  rows: PackageRow[];
  showEvent: boolean;
}) {
  if (rows.length === 0) return <p className="text-sm text-gray-400 py-4">No packages</p>;

  return (
    <div>
      <div className="flex flex-wrap gap-4 text-[11px] text-gray-600 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SERIES_1 }} /> Sold
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SERIES_2 }} /> Held (unpaid)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: TRACK }} /> Left
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <th className="font-bold py-2 pr-3">Package</th>
              <th className="font-bold py-2 pr-3 w-[38%]">Capacity</th>
              <th className="font-bold py-2 pr-3 text-right">Sold</th>
              <th className="font-bold py-2 pr-3 text-right">Left</th>
              <th className="font-bold py-2 pr-3 text-right">Revenue</th>
              <th className="font-bold py-2 text-right">Sell-out</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const cap = Math.max(r.capacity, r.sold + r.held, 1);
              return (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold text-gray-900">
                      {r.name}{" "}
                      <span className="font-normal text-gray-400">{r.distance}</span>
                    </p>
                    {showEvent && <p className="text-[11px] text-gray-400 truncate">{r.eventName}</p>}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div
                      className="flex h-2.5 rounded-full overflow-hidden gap-[2px]"
                      style={{ background: TRACK }}
                      title={`${num(r.sold)} sold · ${num(r.held)} held · ${num(r.left)} left of ${num(r.capacity)}`}
                    >
                      {r.sold > 0 && (
                        <span style={{ width: `${(r.sold / cap) * 100}%`, background: SERIES_1 }} />
                      )}
                      {r.held > 0 && (
                        <span style={{ width: `${(r.held / cap) * 100}%`, background: SERIES_2 }} />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 tabular-nums">
                      {Math.round(((r.sold + r.held) / cap) * 100)}% of {num(r.capacity)}
                      {r.held > 0 && ` · ${num(r.held)} held`}
                    </p>
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums font-semibold text-gray-900">
                    {num(r.sold)}
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700">{num(r.left)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700">{taka(r.revenue)}</td>
                  <td className="py-2.5 text-right text-gray-700 whitespace-nowrap">
                    {r.left === 0
                      ? "Sold out"
                      : r.daysToSellOut === null
                        ? "—"
                        : `~${r.daysToSellOut} day${r.daysToSellOut === 1 ? "" : "s"}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Sell-out estimate uses the last 7 days of paid registrations.
      </p>
    </div>
  );
}

// ─── Coupon performance ────────────────────────────────
export function CouponTable({ rows }: { rows: CouponRow[] }) {
  if (rows.length === 0)
    return <p className="text-sm text-gray-400 py-4">No coupons used by paid orders</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
            <th className="font-bold py-2 pr-3">Code</th>
            <th className="font-bold py-2 pr-3 text-right">Uses</th>
            <th className="font-bold py-2 pr-3 text-right">Discount given</th>
            <th className="font-bold py-2 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.code} className="border-b border-gray-50 last:border-0">
              <td className="py-2 pr-3 font-mono font-semibold text-gray-900">{c.code}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-gray-700">{num(c.uses)}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-gray-700">{taka(c.discount)}</td>
              <td className="py-2 text-right tabular-nums text-gray-900 font-semibold">{taka(c.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
