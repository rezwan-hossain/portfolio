// components/tracking/PageViewTracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Sends one small beacon per page to /api/track (the built-in view counter
// shown on the admin Dashboard). Admin pages are skipped here and on the server.
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/profile")) return;
    const body = JSON.stringify({ path: pathname });
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
