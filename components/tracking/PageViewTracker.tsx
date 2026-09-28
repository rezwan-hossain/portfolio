// components/tracking/PageViewTracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  SOURCE_COOKIE,
  SOURCE_COOKIE_DAYS,
  classifyVisit,
  encodeSourceCookie,
} from "@/lib/traffic-source";

// First page of this browser tab's visit? Then work out the channel, and
// remember it for 30 days so a later order can be credited to it (the last
// channel that wasn't "Direct" wins).
function landingSource() {
  try {
    if (sessionStorage.getItem("ms_landed")) return null;
    sessionStorage.setItem("ms_landed", "1");
  } catch {
    return null; // storage blocked — skip attribution, still count the view
  }
  const visit = classifyVisit({
    url: window.location.href,
    referrer: document.referrer,
    siteHost: window.location.host,
  });
  const hasCookie = document.cookie.split("; ").some((c) => c.startsWith(`${SOURCE_COOKIE}=`));
  if (visit.source !== "Direct" || !hasCookie) {
    document.cookie = `${SOURCE_COOKIE}=${encodeSourceCookie(visit)}; Max-Age=${SOURCE_COOKIE_DAYS * 86400}; Path=/; SameSite=Lax`;
  }
  return visit;
}

// Sends one small beacon per page to /api/track (the built-in view counter
// shown on the admin Dashboard). Admin pages are skipped here and on the server.
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/profile")) return;
    const body = JSON.stringify({ path: pathname, landing: landingSource() });
    try {
      const sent = navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }));
      if (!sent) {
        void fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
      }
    } catch {
      // never let tracking break the page
    }
  }, [pathname]);

  return null;
}
