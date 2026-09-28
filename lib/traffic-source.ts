// lib/traffic-source.ts
//
// Which marketing channel a visit came from. Pure functions (no database), so
// the browser tracker and the server share them.
//
// Order of evidence: campaign tags in the link (utm_source / utm_campaign) →
// ad click ids (fbclid, gclid) → the referring site (incl. Android app
// referrers like android-app://com.facebook.katana) → Direct.

export const SOURCES = [
  "Facebook",
  "Instagram",
  "Messenger",
  "WhatsApp",
  "Google",
  "Other search",
  "YouTube",
  "X / Twitter",
  "LinkedIn",
  "TikTok",
  "Email",
  "SMS",
  "Other sites",
  "Direct",
] as const;
export type TrafficSource = (typeof SOURCES)[number];

export const isSource = (v: unknown): v is TrafficSource =>
  typeof v === "string" && (SOURCES as readonly string[]).includes(v);

// utm_source values people actually type, mapped to a channel.
const UTM: Record<string, TrafficSource> = {
  facebook: "Facebook", fb: "Facebook", meta: "Facebook",
  instagram: "Instagram", ig: "Instagram",
  messenger: "Messenger",
  whatsapp: "WhatsApp", wa: "WhatsApp",
  google: "Google", adwords: "Google",
  youtube: "YouTube", yt: "YouTube",
  twitter: "X / Twitter", x: "X / Twitter",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  email: "Email", newsletter: "Email", mail: "Email",
  sms: "SMS",
};

const REFERRERS: [RegExp, TrafficSource][] = [
  [/(^|\.)messenger\.com$|com\.facebook\.orca/, "Messenger"],
  [/(^|\.)(facebook|fb)\.(com|me)$|com\.facebook\.(katana|lite)/, "Facebook"],
  [/(^|\.)instagram\.com$|com\.instagram\.android/, "Instagram"],
  [/(^|\.)whatsapp\.(com|net)$|wa\.me$|com\.whatsapp/, "WhatsApp"],
  [/(^|\.)google\.[a-z.]+$|com\.google\.android\.(gm|googlequicksearchbox)/, "Google"],
  [/(^|\.)(bing|duckduckgo|yahoo|yandex|baidu|ecosia)\.[a-z.]+$/, "Other search"],
  [/(^|\.)(youtube\.com|youtu\.be)$|com\.google\.android\.youtube/, "YouTube"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X / Twitter"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)(mail\.google\.com|outlook\.(live|office)\.com|mail\.yahoo\.com)$/, "Email"],
];

/** Lowercase, safe characters only, max 60 — so tags can't inject junk. */
export function cleanCampaign(v: string | null | undefined): string {
  return (v ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_\-.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Classify a landing. `siteHost` is our own host, so internal navigation isn't
 * mistaken for a referral.
 */
export function classifyVisit(input: {
  url: string; // full landing URL (with query string)
  referrer: string; // document.referrer ("" when none)
  siteHost: string;
}): { source: TrafficSource; campaign: string } {
  let params: URLSearchParams;
  try {
    params = new URL(input.url).searchParams;
  } catch {
    params = new URLSearchParams();
  }
  const utmSource = (params.get("utm_source") ?? "").trim().toLowerCase();
  const campaign = cleanCampaign(params.get("utm_campaign"));

  if (utmSource) {
    const src = UTM[utmSource] ?? (params.get("utm_medium")?.toLowerCase() === "email" ? "Email" : "Other sites");
    // Unknown utm_source: keep it visible as the campaign name.
    return { source: src, campaign: campaign || (UTM[utmSource] ? "" : cleanCampaign(utmSource)) };
  }
  if (params.has("fbclid")) return { source: "Facebook", campaign };
  if (params.has("gclid") || params.has("gbraid") || params.has("wbraid")) return { source: "Google", campaign };

  const ref = input.referrer.trim();
  if (!ref) return { source: "Direct", campaign };
  let host = "";
  try {
    const u = new URL(ref);
    host = u.protocol === "android-app:" ? u.host.toLowerCase() : u.hostname.toLowerCase();
  } catch {
    return { source: "Other sites", campaign };
  }
  if (host === input.siteHost.toLowerCase()) return { source: "Direct", campaign };
  for (const [re, src] of REFERRERS) if (re.test(host)) return { source: src, campaign };
  return { source: "Other sites", campaign };
}

// ─── Attribution cookie ───────────────────────────────
// Holds only a channel label and campaign name — no ids, nothing personal.
export const SOURCE_COOKIE = "ms_src";
export const SOURCE_COOKIE_DAYS = 30;

export function encodeSourceCookie(v: { source: TrafficSource; campaign: string }): string {
  return encodeURIComponent(`${v.source}|${v.campaign}`);
}

export function decodeSourceCookie(
  raw: string | null | undefined,
): { source: TrafficSource; campaign: string } | null {
  if (!raw) return null;
  let text: string;
  try {
    text = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const [source, campaign = ""] = text.split("|");
  return isSource(source) ? { source, campaign: cleanCampaign(campaign) } : null;
}
