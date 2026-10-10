// module/event/components/ShareButtons.tsx
"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Check, Copy, Facebook, Instagram, MessageCircle, Send, Share2 } from "lucide-react";
import { shareLink, shareTarget, type ShareChannel, type SharePlace } from "@/lib/share";

type Props = {
  slug: string;
  eventName: string;
  /** "event" = event page, "paid" = runner sharing right after paying. */
  place: SharePlace;
  /** NEXT_PUBLIC_SITE_URL from the server; falls back to this page's origin. */
  siteUrl?: string;
  /** "card" = sidebar card matching EventInfoCard / TicketSelector; "compact" = no card chrome. */
  variant?: "card" | "compact";
  title?: string;
  subtitle?: string;
  className?: string;
};

// Browser capabilities, read without a render mismatch (false on the server).
const noop = () => () => {};
const useCanNativeShare = () =>
  useSyncExternalStore(noop, () => typeof navigator !== "undefined" && typeof navigator.share === "function", () => false);
// Messenger's share link only opens the phone app.
const useIsPhone = () =>
  useSyncExternalStore(noop, () => window.matchMedia("(pointer: coarse)").matches, () => false);

// Counts the click on the admin Dashboard (app/api/track → lib/page-views).
function trackShare(slug: string, place: SharePlace, channel: ShareChannel) {
  const body = JSON.stringify({ share: { slug, place, channel } });
  try {
    const sent = navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }));
    if (!sent) {
      void fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
    }
  } catch {
    // never let tracking break sharing
  }
}

function Tile({
  icon,
  label,
  onClick,
  ariaLabel,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  ariaLabel?: string;
  /** Highlighted (e.g. "Copied") — same look as hover. */
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`group flex flex-col items-center gap-2 rounded-lg border py-3 cursor-pointer transition hover:border-neon-lime hover:bg-neon-lime/10 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-lime/50 ${
        active ? "border-neon-lime bg-neon-lime/10" : "border-border"
      }`}
    >
      <span
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition group-hover:bg-neon-lime group-hover:text-white ${
          active ? "bg-neon-lime text-white" : "bg-event-gold/10 text-event-gold"
        }`}
      >
        {icon}
      </span>
      <span className="text-[10px] text-muted-foreground tracking-wider uppercase whitespace-nowrap transition group-hover:text-gray-900">
        {label}
      </span>
    </button>
  );
}

export default function ShareButtons({
  slug,
  eventName,
  place,
  siteUrl,
  variant = "card",
  title = "Share Event",
  subtitle,
  className = "",
}: Props) {
  const canNativeShare = useCanNativeShare();
  const isPhone = useIsPhone();
  const [copied, setCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(false);

  const text =
    place === "paid"
      ? `I just registered for ${eventName}! Join me 🏃`
      : `Join me at ${eventName} 🏃`;
  const linkFor = (channel: ShareChannel) =>
    shareLink(siteUrl || window.location.origin, slug, channel, place);

  const open = (channel: ShareChannel) => {
    trackShare(slug, place, channel);
    const target = shareTarget(channel, linkFor(channel), text);
    if (!target) return;
    if (target.startsWith("http")) window.open(target, "_blank", "noopener,noreferrer,width=640,height=560");
    else window.location.href = target; // app link (Messenger)
  };

  const copy = async () => {
    trackShare(slug, place, "copy");
    const link = linkFor("copy");
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copy this link:", link);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Instagram can't be handed a link from a website. On phones, the share sheet
  // lists Instagram (Stories, Direct); elsewhere, copy the link and open it.
  const shareInstagram = async () => {
    trackShare(slug, place, "instagram");
    const link = linkFor("instagram");
    if (isPhone && canNativeShare) {
      try {
        await navigator.share({ title: eventName, text, url: link });
      } catch {
        // cancelled — nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copy this link, then paste it in Instagram:", link);
      return;
    }
    setIgCopied(true);
    setTimeout(() => setIgCopied(false), 5000);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const nativeShare = async () => {
    trackShare(slug, place, "native");
    try {
      await navigator.share({ title: eventName, text, url: linkFor("native") });
    } catch {
      // cancelled — nothing to do
    }
  };

  const isCard = variant === "card";

  return (
    <div className={`${isCard ? "border border-gray-200 rounded-lg p-4 sm:p-6" : ""} ${className}`}>
      {isCard ? (
        <div className="flex items-center gap-2 mb-4 sm:mb-5 border-b border-border pb-3 sm:pb-4">
          <Share2 size={20} className="text-event-gold" aria-hidden />
          <h3 className="font-display text-2xl sm:text-3xl tracking-wide uppercase">{title}</h3>
        </div>
      ) : (
        <p className="text-sm font-bold text-gray-900">{title}</p>
      )}
      {subtitle && <p className={`text-muted-foreground text-sm ${isCard ? "mb-4" : "mt-0.5 mb-3"}`}>{subtitle}</p>}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(68px,1fr))] gap-2">
        <Tile icon={<MessageCircle size={20} aria-hidden />} label="WhatsApp" onClick={() => open("whatsapp")} />
        <Tile icon={<Facebook size={20} aria-hidden />} label="Facebook" onClick={() => open("facebook")} />
        {isPhone && <Tile icon={<Send size={20} aria-hidden />} label="Messenger" onClick={() => open("messenger")} />}
        <Tile
          icon={igCopied ? <Check size={20} aria-hidden /> : <Instagram size={20} aria-hidden />}
          label="Instagram"
          ariaLabel="Share on Instagram"
          active={igCopied}
          onClick={shareInstagram}
        />
        <Tile
          icon={copied ? <Check size={20} aria-hidden /> : <Copy size={20} aria-hidden />}
          label={copied ? "Copied" : "Copy link"}
          active={copied}
          onClick={copy}
        />
        {canNativeShare && <Tile icon={<Share2 size={20} aria-hidden />} label="More" onClick={nativeShare} />}
      </div>
      <p className="text-xs text-muted-foreground mt-2 min-h-4" aria-live="polite">
        {igCopied ? "Link copied — paste it in your Instagram story or message." : ""}
        <span className="sr-only">{copied ? "Link copied" : ""}</span>
      </p>

    </div>
  );
}
