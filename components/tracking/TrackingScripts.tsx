"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function TrackingScripts() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMounted = useRef(false);

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

  return (
    <>
      {/* ═══════════════════════════════════════════
          GOOGLE ANALYTICS GA4
      ═══════════════════════════════════════════ */}
      {GA_ID && (
        <>
          {/* Load GA4 script */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />

          {/* Initialize GA4 */}
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      )}

      {/* ═══════════════════════════════════════════
          META PIXEL
      ═══════════════════════════════════════════ */}
      {META_PIXEL_ID && (
        <>
          {/* Load and initialize Meta Pixel */}
          <Script
            id="meta-pixel-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />

          {/* Fallback for no-JavaScript browsers */}
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}
