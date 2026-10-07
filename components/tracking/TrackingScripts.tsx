"use client";

import { useEffect, useRef } from "react";
import { scheduleTrackingLoad } from "@/lib/tracking-loader";
import { usePathname, useSearchParams } from "next/navigation";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function TrackingScripts() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMounted = useRef(false);

  // First page: queue PageView now; the Meta/Google files load later
  // (lib/tracking-loader.ts) so they don't block the page. GA's own
  // config call sends its first page_view when gtag.js arrives.
  useEffect(() => {
    scheduleTrackingLoad(); // also creates the queueing fbq()/gtag()
    if (META_PIXEL_ID) window.fbq?.("track", "PageView");
  }, []);

  // ── Track SPA route changes ──────────────────────
  useEffect(() => {
    // Skip very first render
    // Scripts already fire PageView on initial load
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const search = searchParams.toString();
    const url = `${pathname}${search ? `?${search}` : ""}`;

    // GA4 page view on route change
    if (GA_ID && window.gtag) {
      window.gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: url,
      });
    }

    // Meta Pixel page view on route change
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  // No-JavaScript fallback for the Meta Pixel. The scripts themselves are
  // added by lib/tracking-loader.ts.
  return META_PIXEL_ID ? (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  ) : null;
}
