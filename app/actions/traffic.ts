// app/actions/traffic.ts
"use server";

// Website traffic for the admin Dashboard, from the built-in page-view counter
// (lib/page-views.ts) joined with real orders for the view → checkout → paid
// funnel. Admin only.

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { AnalyticsRange, CountItem } from "@/types/analytics";
import {
  CHANNEL_LABELS,
  PLACE_LABELS,
  SHARE_PLACES,
  isShareChannel,
  isSharePlace,
  placeOfCampaign,
  shareCampaign,
  type SharePlace,
} from "@/lib/share";

export type TrafficFunnelRow = {
  eventId: string;
  eventName: string;
  views: number;
  checkouts: number; // orders started (online, any status)
  paid: number; // confirmed orders
};

export type SourceRow = {
  source: string; // channel, or "Not tracked" for orders from before tracking
  visits: number; // site-wide landings from this channel
  checkouts: number; // online orders started
  paid: number; // confirmed online orders
  revenue: number; // BDT from PAID payments
};

export type CampaignRow = { campaign: string; source: string; visits: number; paid: number };

export type ShareRow = {
  place: SharePlace;
  label: string;
  clicks: number; // share-button clicks
  sharers: number; // distinct people clicking, summed per day
  visits: number; // visits that landed from a shared link
  checkouts: number; // online orders credited to a shared link
  paid: number;
  revenue: number;
};

export type TrafficData = {
  countingSince: string | null; // first day with any data
  series: { date: string; views: number; uniques: number }[];
  totals: { views: number; uniques: number };
  topPages: CountItem[];
  funnel: TrafficFunnelRow[];
  sources: SourceRow[];
  campaigns: CampaignRow[];
  shares: { places: ShareRow[]; channels: CountItem[] };
};

const DAY = 24 * 60 * 60 * 1000;
const dhakaDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dayKey = (d: Date) => dhakaDay.format(d);
const addDays = (key: string, n: number) =>
  new Date(Date.parse(`${key}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
/** Start of a Dhaka calendar day, as an instant. */
const dhakaStart = (key: string) => new Date(`${key}T00:00:00+06:00`);

const PAGE_NAMES: Record<string, string> = {
  "/": "Homepage",
  "/events": "Events list",
  "/gallery": "Gallery",
  "/teams": "Team",
  "/contact": "Contact",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/login": "Login",
  "/register": "Sign up",
  "/register/confirm": "Sign-up confirmation",
  "/dashboard": "Runner dashboard",
  "/order-confirmation": "Order confirmation",
  "/payment/success": "Payment success",
  "/payment/failed": "Payment failed",
  "/payment/processing": "Payment confirming",
  "/payment/retry": "Payment retry",
  "/privacy-policy": "Privacy policy",
  "/terms-and-conditions": "Terms",
  other: "Other pages",
};

export async function getTraffic(
  eventId: string | "all",
  range: AnalyticsRange,
): Promise<{ data: TrafficData | null; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { data: null, error };

  try {
    const first = await prisma.pageViewDaily.findFirst({ orderBy: { day: "asc" }, select: { day: true } });
    const today = dayKey(new Date());
    if (!first) {
      return {
        data: {
          countingSince: null,
          series: [],
          totals: { views: 0, uniques: 0 },
          topPages: [],
          funnel: [],
          sources: [],
          campaigns: [],
          shares: { places: [], channels: [] },
        },
        error: null,
      };
    }
    const from =
      range === "all"
        ? first.day
        : [addDays(today, -(Number(range) - 1)), first.day].sort().at(-1)!; // not before counting began

    const where =
      eventId === "all"
        ? { path: "*", day: { gte: from, lte: today } }
        : { eventId, day: { gte: from, lte: today } };
    const rows = await prisma.pageViewDaily.findMany({ where, select: { day: true, views: true, uniques: true } });

    // Daily series with zero-filled gaps.
    const byDay = new Map<string, { views: number; uniques: number }>();
    for (const r of rows) {
      const d = byDay.get(r.day) ?? { views: 0, uniques: 0 };
      d.views += r.views;
      d.uniques += r.uniques;
      byDay.set(r.day, d);
    }
    const series: TrafficData["series"] = [];
    for (let d = from; d <= today; d = addDays(d, 1)) {
      series.push({ date: d, ...(byDay.get(d) ?? { views: 0, uniques: 0 }) });
    }
    const totals = series.reduce(
      (t, p) => ({ views: t.views + p.views, uniques: t.uniques + p.uniques }),
      { views: 0, uniques: 0 },
    );

    // Top pages (whole site) in the range.
    const pages = await prisma.pageViewDaily.groupBy({
      by: ["path", "eventId"],
      where: { path: { not: "*" }, day: { gte: from, lte: today } },
      _sum: { views: true },
    });
    const allEvents = await prisma.event.findMany({ select: { id: true, name: true, slug: true } });
    const eventNames = new Map(allEvents.map((e) => [e.id, e.name]));
    const topPages: CountItem[] = pages
      .map((p) => ({
        label: p.eventId ? (eventNames.get(p.eventId) ?? p.path) : (PAGE_NAMES[p.path] ?? p.path),
        value: p._sum.views ?? 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Funnel per event: event page views → checkouts started → paid.
    const since = dhakaStart(from);
    const eventFilter = eventId === "all" ? {} : { eventId };
    const [viewsByEvent, started, paid] = await Promise.all([
      prisma.pageViewDaily.groupBy({
        by: ["eventId"],
        where: { eventId: eventId === "all" ? { not: null } : eventId, day: { gte: from, lte: today } },
        _sum: { views: true },
      }),
      prisma.order.groupBy({
        by: ["eventId"],
        where: { ...eventFilter, source: "ONLINE", isArchived: false, createdAt: { gte: since } },
        _count: true,
      }),
      prisma.order.groupBy({
        by: ["eventId"],
        where: { ...eventFilter, source: "ONLINE", isArchived: false, status: "CONFIRMED", createdAt: { gte: since } },
        _count: true,
      }),
    ]);
    const ids = new Set<string>([
      ...viewsByEvent.map((v) => v.eventId!).filter(Boolean),
      ...started.map((s) => s.eventId),
    ]);
    const funnel: TrafficFunnelRow[] = [...ids]
      .map((id) => ({
        eventId: id,
        eventName: eventNames.get(id) ?? "Deleted event",
        views: viewsByEvent.find((v) => v.eventId === id)?._sum.views ?? 0,
        checkouts: started.find((s) => s.eventId === id)?._count ?? 0,
        paid: paid.find((p) => p.eventId === id)?._count ?? 0,
      }))
      .sort((a, b) => b.views - a.views || b.paid - a.paid);

    // ── Channels: visits (site-wide) and the orders they led to ──
    const [visitsBySource, visitsByCampaign, ordersBySource] = await Promise.all([
      prisma.trafficSourceDaily.groupBy({
        by: ["source"],
        where: { day: { gte: from, lte: today } },
        _sum: { visits: true },
      }),
      prisma.trafficSourceDaily.groupBy({
        by: ["campaign", "source"],
        where: { day: { gte: from, lte: today }, campaign: { not: "" } },
        _sum: { visits: true },
      }),
      prisma.order.findMany({
        where: { ...eventFilter, source: "ONLINE", isArchived: false, createdAt: { gte: since } },
        select: {
          status: true,
          trafficSource: true,
          trafficCampaign: true,
          payment: { select: { status: true, amount: true } },
        },
      }),
    ]);
    const bySource = new Map<string, SourceRow>();
    const row = (source: string) => {
      const r = bySource.get(source) ?? { source, visits: 0, checkouts: 0, paid: 0, revenue: 0 };
      bySource.set(source, r);
      return r;
    };
    for (const v of visitsBySource) row(v.source).visits += v._sum.visits ?? 0;
    const paidByCampaign = new Map<string, number>();
    for (const o of ordersBySource) {
      const r = row(o.trafficSource ?? "Not tracked");
      r.checkouts++;
      if (o.status === "CONFIRMED") {
        r.paid++;
        if (o.trafficCampaign) paidByCampaign.set(o.trafficCampaign, (paidByCampaign.get(o.trafficCampaign) ?? 0) + 1);
      }
      if (o.payment?.status === "PAID") r.revenue += o.payment.amount;
    }
    const sources = [...bySource.values()].sort(
      (a, b) =>
        (a.source === "Not tracked" ? 1 : 0) - (b.source === "Not tracked" ? 1 : 0) ||
        b.paid - a.paid ||
        b.visits - a.visits,
    );
    const campaigns: CampaignRow[] = visitsByCampaign
      .map((c) => ({
        campaign: c.campaign,
        source: c.source,
        visits: c._sum.visits ?? 0,
        paid: paidByCampaign.get(c.campaign) ?? 0,
      }))
      .sort((a, b) => b.paid - a.paid || b.visits - a.visits)
      .slice(0, 15);

    // ── Shares: button clicks → visits from shared links → orders ──
    const slug = eventId === "all" ? null : allEvents.find((e) => e.id === eventId)?.slug;
    const [clicks, shareVisits] = await Promise.all([
      prisma.shareClickDaily.groupBy({
        by: ["place", "channel"],
        where: { ...eventFilter, day: { gte: from, lte: today } },
        _sum: { clicks: true, sharers: true },
      }),
      prisma.trafficSourceDaily.groupBy({
        by: ["campaign"],
        where: {
          day: { gte: from, lte: today },
          ...(eventId === "all"
            ? { OR: [{ campaign: { startsWith: "share-" } }, { campaign: { startsWith: "runner-" } }] }
            : { campaign: { in: slug ? SHARE_PLACES.map((p) => shareCampaign(slug, p)) : [] } }),
        },
        _sum: { visits: true },
      }),
    ]);
    const places = new Map<SharePlace, ShareRow>(
      SHARE_PLACES.map((p) => [
        p,
        { place: p, label: PLACE_LABELS[p], clicks: 0, sharers: 0, visits: 0, checkouts: 0, paid: 0, revenue: 0 },
      ]),
    );
    const byChannel = new Map<string, number>();
    for (const c of clicks) {
      if (!isSharePlace(c.place)) continue;
      const r = places.get(c.place)!;
      r.clicks += c._sum.clicks ?? 0;
      r.sharers += c._sum.sharers ?? 0;
      const label = isShareChannel(c.channel) ? CHANNEL_LABELS[c.channel] : c.channel;
      byChannel.set(label, (byChannel.get(label) ?? 0) + (c._sum.clicks ?? 0));
    }
    for (const v of shareVisits) {
      const p = placeOfCampaign(v.campaign);
      if (p) places.get(p)!.visits += v._sum.visits ?? 0;
    }
    for (const o of ordersBySource) {
      const p = placeOfCampaign(o.trafficCampaign);
      if (!p) continue;
      const r = places.get(p)!;
      r.checkouts++;
      if (o.status === "CONFIRMED") r.paid++;
      if (o.payment?.status === "PAID") r.revenue += o.payment.amount;
    }
    const shares = {
      places: [...places.values()],
      channels: [...byChannel].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    };

    return {
      data: { countingSince: first.day, series, totals, topPages, funnel, sources, campaigns, shares },
      error: null,
    };
  } catch (err) {
    console.error("getTraffic error:", err);
    return { data: null, error: "Failed to load traffic" };
  }
}
