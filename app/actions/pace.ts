// app/actions/pace.ts
"use server";

// "This event vs last event" registration pace. Cumulative paid runners per
// day, for two events, lined up either by days since registration opened
// (first order) or by days before race day. Admin only; existing data only.

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export type PaceSeries = {
  id: string;
  name: string;
  raceDate: string;
  openedAt: string | null; // first order (any status) — "registration opened"
  /** Cumulative paid runners; index = days since opening (day 0 = opening day). */
  cumulative: number[];
  /** Day index of race day (can be beyond today for upcoming events). */
  raceDayIndex: number;
  /** Days since opening covered so far (last index with data). */
  lastDay: number;
  total: number;
};

export type PaceOption = { id: string; name: string; raceDate: string; runners: number };

const DAY = 24 * 60 * 60 * 1000;
const dhakaDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dayNum = (d: Date) => Math.round(Date.parse(`${dhakaDay.format(d)}T00:00:00Z`) / DAY);

async function buildSeries(eventId: string): Promise<PaceSeries | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, name: true, date: true },
  });
  if (!event) return null;

  const [first, paid] = await Promise.all([
    prisma.order.findFirst({
      where: { eventId, isArchived: false },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.order.findMany({
      where: { eventId, isArchived: false, status: "CONFIRMED" },
      select: { createdAt: true, qty: true },
    }),
  ]);

  const raceDay = dayNum(event.date);
  if (!first) {
    return {
      id: event.id,
      name: event.name,
      raceDate: event.date.toISOString(),
      openedAt: null,
      cumulative: [],
      raceDayIndex: 0,
      lastDay: -1,
      total: 0,
    };
  }

  const openDay = dayNum(first.createdAt);
  const today = dayNum(new Date());
  // Past events: up to race day. Running events: up to today.
  const lastDay = Math.max(0, Math.min(today, Math.max(raceDay, openDay)) - openDay);
  const perDay = new Array(lastDay + 1).fill(0);
  for (const o of paid) {
    const i = dayNum(o.createdAt) - openDay;
    if (i >= 0 && i <= lastDay) perDay[i] += o.qty;
    else if (i > lastDay) perDay[lastDay] += o.qty; // late (e.g. manual after race day)
  }
  const cumulative: number[] = [];
  perDay.reduce((sum, n, i) => (cumulative[i] = sum + n), 0);

  return {
    id: event.id,
    name: event.name,
    raceDate: event.date.toISOString(),
    openedAt: first.createdAt.toISOString(),
    cumulative,
    raceDayIndex: raceDay - openDay,
    lastDay,
    total: cumulative[cumulative.length - 1] ?? 0,
  };
}

export async function getPaceComparison(
  eventId: string | "all",
  compareId?: string | null,
): Promise<{
  current: PaceSeries | null;
  compare: PaceSeries | null;
  options: PaceOption[];
  error: string | null;
}> {
  const empty = { current: null, compare: null, options: [] as PaceOption[] };
  const { error } = await requireAdmin();
  if (error) return { ...empty, error };

  try {
    // Events that have paid runners, newest race first.
    const counts = await prisma.order.groupBy({
      by: ["eventId"],
      where: { status: "CONFIRMED", isArchived: false },
      _sum: { qty: true },
    });
    const withRunners = new Map(counts.map((c) => [c.eventId, c._sum.qty ?? 0]));
    const events = await prisma.event.findMany({
      where: { isArchived: false },
      select: { id: true, name: true, date: true },
      orderBy: { date: "desc" },
    });
    const options: PaceOption[] = events
      .filter((e) => withRunners.has(e.id) || e.id === eventId)
      .map((e) => ({ id: e.id, name: e.name, raceDate: e.date.toISOString(), runners: withRunners.get(e.id) ?? 0 }));

    // "All events" → the newest event that has runners.
    const currentId = eventId !== "all" ? eventId : options.find((o) => o.runners > 0)?.id;
    if (!currentId) return { ...empty, options, error: null };
    const current = await buildSeries(currentId);

    // Default comparison: the previous race (by date) that has runners.
    const currentDate = current ? Date.parse(current.raceDate) : Infinity;
    const defaultCompare = options.find(
      (o) => o.id !== currentId && o.runners > 0 && Date.parse(o.raceDate) < currentDate,
    );
    const chosen =
      compareId && compareId !== currentId && options.some((o) => o.id === compareId)
        ? compareId
        : defaultCompare?.id;
    const compare = chosen ? await buildSeries(chosen) : null;

    return { current, compare, options, error: null };
  } catch (err) {
    console.error("getPaceComparison error:", err);
    return { ...empty, error: "Failed to load the pace comparison" };
  }
}
