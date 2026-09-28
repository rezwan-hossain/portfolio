// module/profile/components/admin/analytics/PaceCard.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { getPaceComparison, type PaceOption, type PaceSeries } from "@/app/actions/pace";
import { SERIES_1, SERIES_2, num } from "./charts";

type Align = "open" | "race";

// Chart geometry (SVG user units; scales to the card width).
const W = 640;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };

function niceMax(v: number) {
  if (v <= 0) return 10;
  const p = 10 ** Math.floor(Math.log10(v));
  const m = v / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

/** Points {x, y} for a series under the chosen alignment. */
export function pointsFor(s: PaceSeries, align: Align): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= s.lastDay; i++) {
    const x = align === "open" ? i : s.raceDayIndex - i; // "race": days before race day
    if (align === "race" && x < 0) continue;
    pts.push({ x, y: s.cumulative[i] ?? 0 });
  }
  return pts;
}

/** Runners at a given x (step: last known value at or before x). */
export function valueAt(pts: { x: number; y: number }[], x: number, align: Align): number | null {
  if (pts.length === 0) return null;
  // "open": x grows over time; "race": x shrinks over time.
  const before = align === "open" ? pts.filter((p) => p.x <= x) : pts.filter((p) => p.x >= x);
  if (before.length === 0) return 0;
  return before[before.length - 1].y;
}

export function PaceCard({ eventId }: { eventId: string }) {
  const [current, setCurrent] = useState<PaceSeries | null>(null);
  const [compare, setCompare] = useState<PaceSeries | null>(null);
  const [options, setOptions] = useState<PaceOption[]>([]);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [align, setAlign] = useState<Align>("open");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [hoverX, setHoverX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let alive = true;
    void getPaceComparison(eventId, compareId).then((r) => {
      if (!alive) return;
      setCurrent(r.current);
      setCompare(r.compare);
      setOptions(r.options);
      setError(r.error ?? "");
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [eventId, compareId]);

  const header = (
    <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900">Registration pace</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Paid runners so far, this event vs another · day 0 = first order
        </p>
      </div>
      {current && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="pace-compare" className="text-xs text-gray-500">Compare with</label>
          <select
            id="pace-compare"
            value={compare?.id ?? ""}
            onChange={(e) => setCompareId(e.target.value || null)}
            className="h-8 max-w-[14rem] px-2 rounded-lg border border-gray-200 bg-white text-xs text-gray-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            {!compare && <option value="">— choose an event —</option>}
            {options
              .filter((o) => o.id !== current.id && o.runners > 0)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({num(o.runners)})
                </option>
              ))}
          </select>
          <div className="flex rounded-lg border border-gray-200 p-0.5" role="group" aria-label="Line up by">
            {(
              [
                ["open", "Since opening"],
                ["race", "Before race day"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setAlign(v)}
                aria-pressed={align === v}
                className={`px-2.5 h-7 rounded-md text-[11px] font-semibold cursor-pointer ${
                  align === v ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );

  const frame = (body: React.ReactNode) => (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      {header}
      {body}
    </section>
  );

  if (!loaded) return frame(<div className="h-60 bg-gray-50 rounded-lg animate-pulse" />);
  if (error) return frame(<p className="text-sm text-red-600">{error}</p>);
  if (!current || current.lastDay < 0)
    return frame(<p className="text-sm text-gray-400 py-10 text-center">No registrations for this event yet.</p>);

  // ── Geometry ──
  const cur = pointsFor(current, align);
  const cmp = compare ? pointsFor(compare, align) : [];
  const allX = [...cur, ...cmp].map((p) => p.x);
  if (align === "open") allX.push(current.raceDayIndex); // show the runway to race day
  const xMax = Math.max(1, ...allX);
  const yMax = niceMax(Math.max(1, ...cur.map((p) => p.y), ...cmp.map((p) => p.y)));
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  // "open": day 0 on the left. "race": most days-before on the left, race day at the right.
  const sx = (x: number) => PAD.left + (align === "open" ? x / xMax : 1 - x / xMax) * iw;
  const sy = (y: number) => PAD.top + ih - (y / yMax) * ih;
  const path = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");

  // ── Headline: where are we vs the other event at the same point? ──
  const nowX = align === "open" ? current.lastDay : current.raceDayIndex - current.lastDay;
  const nowCur = current.cumulative[current.lastDay] ?? 0;
  const nowCmp = compare ? valueAt(cmp, nowX, align) : null;
  const finished = current.lastDay >= current.raceDayIndex;
  const diff = nowCmp !== null && nowCmp > 0 ? Math.round(((nowCur - nowCmp) / nowCmp) * 100) : null;
  const when = finished
    ? "at the finish"
    : align === "open"
      ? `on day ${current.lastDay}`
      : `${Math.max(0, current.raceDayIndex - current.lastDay)} days before race day`;

  // ── Hover ──
  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const t = Math.min(1, Math.max(0, (px - PAD.left) / iw));
    setHoverX(Math.round(align === "open" ? t * xMax : (1 - t) * xMax));
  };
  const hCur = hoverX !== null ? valueAt(cur, hoverX, align) : null;
  const hCmp = hoverX !== null && compare ? valueAt(cmp, hoverX, align) : null;
  const xLabel = (x: number) => (align === "open" ? `Day ${x}` : x === 0 ? "Race day" : `${x}d to race`);
  const ticks = [0, 0.5, 1].map((t) => Math.round(t * xMax));
  const raceX = align === "open" ? current.raceDayIndex : 0;

  return frame(
    <>
      {/* Headline + legend */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <p className="text-2xl font-black text-gray-900 tabular-nums">
            {num(nowCur)} <span className="text-sm font-semibold text-gray-500">runners {when}</span>
          </p>
          {compare && nowCmp !== null && (
            <p className={`text-xs font-semibold mt-0.5 ${diff === null ? "text-gray-500" : diff >= 0 ? "text-green-700" : "text-amber-700"}`}>
              {diff === null
                ? `${compare.name} had no runners yet at this point`
                : `${diff >= 0 ? "+" : ""}${diff}% ${diff >= 0 ? "ahead of" : "behind"} ${compare.name} (${num(nowCmp)}) at the same point`}
            </p>
          )}
          {!compare && <p className="text-xs text-gray-500 mt-0.5">No earlier event with runners to compare with.</p>}
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded" style={{ background: SERIES_1 }} /> {current.name}
          </span>
          {compare && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded" style={{ background: SERIES_2 }} /> {compare.name}
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
          aria-label={`Cumulative paid runners: ${current.name}${compare ? ` vs ${compare.name}` : ""}`}>
          {/* Recessive grid + y labels */}
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={sy(t * yMax)} y2={sy(t * yMax)} stroke="#eef0f3" />
              <text x={PAD.left - 6} y={sy(t * yMax) + 3} textAnchor="end" fontSize="10" fill="#9ca3af">
                {num(t * yMax)}
              </text>
            </g>
          ))}
          {/* x labels */}
          {ticks.map((x, i) => (
            <text key={i} x={sx(x)} y={H - 8} fontSize="10" fill="#9ca3af"
              textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}>
              {xLabel(x)}
            </text>
          ))}
          {/* race day marker for the current event */}
          {!finished && raceX <= xMax && (
            <g>
              <line x1={sx(raceX)} x2={sx(raceX)} y1={PAD.top} y2={PAD.top + ih} stroke="#d1d5db" strokeDasharray="3 3" />
              <text x={sx(raceX) - 4} y={PAD.top + 10} fontSize="10" fill="#6b7280" textAnchor="end">race day</text>
            </g>
          )}
          {/* lines */}
          {cmp.length > 0 && <path d={path(cmp)} fill="none" stroke={SERIES_2} strokeWidth={2} strokeLinejoin="round" />}
          <path d={path(cur)} fill="none" stroke={SERIES_1} strokeWidth={2} strokeLinejoin="round" />
          {/* end points */}
          {cmp.length > 0 && (
            <circle cx={sx(cmp[cmp.length - 1].x)} cy={sy(cmp[cmp.length - 1].y)} r={4} fill={SERIES_2} stroke="#fff" strokeWidth={2} />
          )}
          <circle cx={sx(cur[cur.length - 1].x)} cy={sy(cur[cur.length - 1].y)} r={4} fill={SERIES_1} stroke="#fff" strokeWidth={2} />
          {/* crosshair */}
          {hoverX !== null && (
            <line x1={sx(hoverX)} x2={sx(hoverX)} y1={PAD.top} y2={PAD.top + ih} stroke="#9ca3af" />
          )}
          <rect x={PAD.left} y={PAD.top} width={iw} height={ih} fill="transparent"
            onMouseMove={onMove} onMouseLeave={() => setHoverX(null)} />
        </svg>

        {hoverX !== null && (
          <div
            className="absolute top-2 pointer-events-none bg-gray-900 text-white rounded-lg px-2.5 py-1.5 text-xs shadow-lg whitespace-nowrap"
            style={{ left: `${(sx(hoverX) / W) * 100}%`, transform: `translateX(${sx(hoverX) > W * 0.6 ? "-105%" : "5%"})` }}
          >
            <p className="text-white/60 mb-0.5">{xLabel(hoverX)}</p>
            <p className="tabular-nums">
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: SERIES_1 }} />
              {hCur !== null && (align === "open" ? hoverX <= current.lastDay : hoverX >= current.raceDayIndex - current.lastDay)
                ? num(hCur)
                : "—"}
            </p>
            {compare && (
              <p className="tabular-nums">
                <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: SERIES_2 }} />
                {hCmp !== null ? num(hCmp) : "—"}
              </p>
            )}
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Counts paid registrations by the day they were ordered (Dhaka time). The date range above doesn&apos;t apply.
      </p>
    </>,
  );
}
