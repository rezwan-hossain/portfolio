// lib/page-views.ts
//
// Built-in page-view counter. Stores daily COUNTS per page — no IP addresses,
// no personal data. A visitor is an anonymous hash of (day, IP, browser, salt):
// it changes every day, so nobody can be followed from one day to the next,
// and the raw hashes are deleted after 2 days.
//
// ⚠️ Not a "use server" file — called only from the /api/track route.

import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { cleanCampaign, isSource } from "@/lib/traffic-source";
import { isShareChannel, isSharePlace } from "@/lib/share";

const REPEAT_WINDOW_MS = 10_000; // same visitor + page within 10s = one view
const SITE = "*";

// Pages we count by name; everything else public becomes "other", so random
// URLs can't bloat the table. Admin, auth and API routes are never counted.
const KNOWN_PAGES = new Set([
  "/",
  "/events",
  "/gallery",
  "/teams",
  "/contact",
  "/cart",
  "/checkout",
  "/login",
  "/register",
  "/register/confirm",
  "/dashboard",
  "/order-confirmation",
  "/payment/success",
  "/payment/failed",
  "/payment/processing",
  "/payment/retry",
  "/privacy-policy",
  "/terms-and-conditions",
]);
const NEVER = /^\/(profile|api|_next|auth)(\/|$)/;

const BOT =
  /bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|whatsapp|telegram|twitterbot|linkedinbot|discord|slack|embedly|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch|go-http/i;

export function isBot(userAgent: string | null | undefined): boolean {
  return !userAgent || BOT.test(userAgent);
}

// Event slugs → ids, refreshed every 5 minutes.
let slugCache: { at: number; map: Map<string, string> } | null = null;
async function eventSlugs(): Promise<Map<string, string>> {
  if (slugCache && Date.now() - slugCache.at < 5 * 60_000) return slugCache.map;
  const events = await prisma.event.findMany({ select: { id: true, slug: true } });
  slugCache = { at: Date.now(), map: new Map(events.map((e) => [e.slug, e.id])) };
  return slugCache.map;
}

/** Page key to count under, or null if this path is never counted. */
export async function normalisePath(
  rawPath: string,
): Promise<{ key: string; eventId: string | null } | null> {
  if (typeof rawPath !== "string" || !rawPath.startsWith("/")) return null;
  let path = rawPath.split(/[?#]/)[0] || "/";
  try {
    path = decodeURIComponent(path);
  } catch {
    return { key: "other", eventId: null };
  }
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (NEVER.test(path)) return null;
  if (KNOWN_PAGES.has(path)) return { key: path, eventId: null };

  const m = /^\/events\/([^/]+)$/.exec(path);
  if (m) {
    const eventId = (await eventSlugs()).get(m[1]);
    if (eventId) return { key: `/events/${m[1]}`, eventId };
  }
  return { key: "other", eventId: null };
}

const dhakaDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
export const dayKey = (d: Date) => dhakaDay.format(d);

// Secret salt so hashes can't be reversed by guessing IPs. Set PAGEVIEW_SALT to
// keep unique-visitor counts stable across restarts; otherwise a random salt is
// made per server start (a restart mid-day may count a returning visitor again).
const SALT = process.env.PAGEVIEW_SALT || createHash("sha256").update(`${Date.now()}-${Math.random()}`).digest("hex");

function visitorHash(day: string, ip: string, ua: string): string {
  const salt = SALT;
  return createHash("sha256").update(`${day}|${ip}|${ua}|${salt}`).digest("hex").slice(0, 32);
}

/**
 * Count one page view. Returns what was counted (for tests/logging).
 * Never throws — a counting problem must never break a page.
 */
export async function recordPageView(input: {
  path: string;
  ip: string;
  userAgent: string;
  now?: Date;
  /** First page of a visit: which channel brought them (lib/traffic-source). */
  landing?: { source: unknown; campaign?: unknown } | null;
}): Promise<"counted" | "repeat" | "ignored"> {
  try {
    if (isBot(input.userAgent)) return "ignored";
    const page = await normalisePath(input.path);
    if (!page) return "ignored";

    const now = input.now ?? new Date();
    const day = dayKey(now);
    const hash = visitorHash(day, input.ip, input.userAgent);
    const cutoff = new Date(now.getTime() - REPEAT_WINDOW_MS);

    // Page level: insert the visitor, or refresh lastSeen if their previous
    // view is older than 10s. No row back = a rapid repeat → not counted.
    const pageRows = await prisma.$queryRaw<{ inserted: boolean }[]>`
      INSERT INTO "page_visitors" ("day", "path", "hash", "lastSeen")
      VALUES (${day}, ${page.key}, ${hash}, ${now})
      ON CONFLICT ("day", "path", "hash") DO UPDATE SET "lastSeen" = EXCLUDED."lastSeen"
      WHERE "page_visitors"."lastSeen" < ${cutoff}
      RETURNING (xmax = 0) AS "inserted"`;
    if (pageRows.length === 0) return "repeat";
    const newOnPage = pageRows[0].inserted ? 1 : 0;

    // Site level: unique once per day, whatever the page.
    const siteRows = await prisma.$queryRaw<{ inserted: boolean }[]>`
      INSERT INTO "page_visitors" ("day", "path", "hash", "lastSeen")
      VALUES (${day}, ${SITE}, ${hash}, ${now})
      ON CONFLICT ("day", "path", "hash") DO NOTHING
      RETURNING true AS "inserted"`;
    const newOnSite = siteRows.length > 0 ? 1 : 0;

    await prisma.$executeRaw`
      INSERT INTO "page_view_daily" ("day", "path", "eventId", "views", "uniques")
      VALUES (${day}, ${page.key}, ${page.eventId}, 1, ${newOnPage}),
             (${day}, ${SITE}, NULL, 1, ${newOnSite})
      ON CONFLICT ("day", "path") DO UPDATE SET
        "views" = "page_view_daily"."views" + 1,
        "uniques" = "page_view_daily"."uniques" + EXCLUDED."uniques"`;

    // A counted landing → one visit for its channel.
    if (input.landing && isSource(input.landing.source)) {
      const campaign = cleanCampaign(typeof input.landing.campaign === "string" ? input.landing.campaign : "");
      await prisma.$executeRaw`
        INSERT INTO "traffic_source_daily" ("day", "source", "campaign", "visits")
        VALUES (${day}, ${input.landing.source}, ${campaign}, 1)
        ON CONFLICT ("day", "source", "campaign") DO UPDATE SET
          "visits" = "traffic_source_daily"."visits" + 1`;
    }
    return "counted";
  } catch (err) {
    console.error("recordPageView failed:", err);
    return "ignored";
  }
}

/**
 * Count one share-button click (lib/share.ts). Same privacy model as page
 * views: a daily anonymous hash, used only to count distinct sharers and to
 * ignore rapid repeat clicks. Never throws.
 */
export async function recordShareClick(input: {
  slug: unknown;
  place: unknown;
  channel: unknown;
  ip: string;
  userAgent: string;
  now?: Date;
}): Promise<"counted" | "repeat" | "ignored"> {
  try {
    if (isBot(input.userAgent)) return "ignored";
    if (typeof input.slug !== "string" || !isSharePlace(input.place) || !isShareChannel(input.channel)) {
      return "ignored";
    }
    const eventId = (await eventSlugs()).get(input.slug);
    if (!eventId) return "ignored";

    const now = input.now ?? new Date();
    const day = dayKey(now);
    const hash = visitorHash(day, input.ip, input.userAgent);
    const cutoff = new Date(now.getTime() - REPEAT_WINDOW_MS);
    const key = `share:${input.place}:${input.channel}:${eventId}`;

    const rows = await prisma.$queryRaw<{ inserted: boolean }[]>`
      INSERT INTO "page_visitors" ("day", "path", "hash", "lastSeen")
      VALUES (${day}, ${key}, ${hash}, ${now})
      ON CONFLICT ("day", "path", "hash") DO UPDATE SET "lastSeen" = EXCLUDED."lastSeen"
      WHERE "page_visitors"."lastSeen" < ${cutoff}
      RETURNING (xmax = 0) AS "inserted"`;
    if (rows.length === 0) return "repeat";
    const newSharer = rows[0].inserted ? 1 : 0;

    await prisma.$executeRaw`
      INSERT INTO "share_click_daily" ("day", "eventId", "place", "channel", "clicks", "sharers")
      VALUES (${day}, ${eventId}, ${input.place}, ${input.channel}, 1, ${newSharer})
      ON CONFLICT ("day", "eventId", "place", "channel") DO UPDATE SET
        "clicks" = "share_click_daily"."clicks" + 1,
        "sharers" = "share_click_daily"."sharers" + EXCLUDED."sharers"`;
    return "counted";
  } catch (err) {
    console.error("recordShareClick failed:", err);
    return "ignored";
  }
}

/** Delete visitor hashes older than 2 days (the daily counts stay). */
export async function purgeOldVisitors(now = new Date()): Promise<number> {
  const keepFrom = dayKey(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000));
  const r = await prisma.pageVisitor.deleteMany({ where: { day: { lt: keepFrom } } });
  return r.count;
}
