// lib/share.ts
//
// Share links for event pages. Pure functions (no database), shared by the
// share buttons and the admin "Shares" card.
//
// Every shared link carries utm tags, so the existing channel tracking
// (lib/traffic-source.ts) credits the visit — and any order it leads to — to
// the share. The campaign says where the share came from:
//   share-<slug>   shared from the event page
//   runner-<slug>  shared by a runner right after paying ("runners bringing runners")

import { cleanCampaign } from "@/lib/traffic-source";

// "x" is no longer offered as a button, but stays so earlier clicks keep their label.
export const SHARE_CHANNELS = ["whatsapp", "facebook", "messenger", "instagram", "x", "copy", "native"] as const;
export type ShareChannel = (typeof SHARE_CHANNELS)[number];

export const SHARE_PLACES = ["event", "paid"] as const;
export type SharePlace = (typeof SHARE_PLACES)[number];

export const isShareChannel = (v: unknown): v is ShareChannel =>
  typeof v === "string" && (SHARE_CHANNELS as readonly string[]).includes(v);
export const isSharePlace = (v: unknown): v is SharePlace =>
  typeof v === "string" && (SHARE_PLACES as readonly string[]).includes(v);

export const CHANNEL_LABELS: Record<ShareChannel, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  messenger: "Messenger",
  instagram: "Instagram",
  x: "X / Twitter",
  copy: "Copied link",
  native: "Phone share menu",
};

export const PLACE_LABELS: Record<SharePlace, string> = {
  event: "Event page",
  paid: "Runners after paying",
};

const PLACE_PREFIX: Record<SharePlace, string> = { event: "share", paid: "runner" };

export function shareCampaign(slug: string, place: SharePlace): string {
  return cleanCampaign(`${PLACE_PREFIX[place]}-${slug}`);
}

/** Which place a tracked campaign came from, or null if it isn't a share. */
export function placeOfCampaign(campaign: string | null | undefined): SharePlace | null {
  if (!campaign) return null;
  if (campaign.startsWith("share-")) return "event";
  if (campaign.startsWith("runner-")) return "paid";
  return null;
}

// utm_source values understood by lib/traffic-source.ts. Copied links and the
// phone share menu go anywhere, so they carry only the campaign and the
// channel is worked out from the referrer.
const UTM_SOURCE: Partial<Record<ShareChannel, string>> = {
  whatsapp: "whatsapp",
  facebook: "facebook",
  messenger: "messenger",
  instagram: "instagram",
  x: "x",
};

/** The event link to share, tagged for this channel and place. */
export function shareLink(siteUrl: string, slug: string, channel: ShareChannel, place: SharePlace): string {
  const url = new URL(`/events/${encodeURIComponent(slug)}`, siteUrl);
  const source = UTM_SOURCE[channel];
  if (source) url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "share");
  url.searchParams.set("utm_campaign", shareCampaign(slug, place));
  return url.toString();
}

/**
 * Where a share button sends the browser (null = handled in the page: copy,
 * native, and Instagram — which has no web address for sharing a link).
 */
export function shareTarget(channel: ShareChannel, link: string, text: string): string | null {
  const u = encodeURIComponent(link);
  switch (channel) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "messenger":
      return `fb-messenger://share/?link=${u}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${u}`;
    default:
      return null;
  }
}
