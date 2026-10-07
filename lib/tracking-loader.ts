// lib/tracking-loader.ts
//
// Meta Pixel and Google Analytics, loaded without slowing the page down.
//
// Their script files cost ~5 s of main-thread time on a mid-range phone
// (Lighthouse: Total Blocking Time 7.3 s → 0.3 s without them). So:
//   1. Tiny stand-ins for fbq() and gtag() exist from the first call. They only
//      QUEUE events — the same stubs as Meta's and Google's official snippets.
//   2. The real files load later: on the visitor's first interaction, or once
//      the page has loaded and the browser is idle, whichever comes first.
//      When they arrive they replay the queue, so no event is lost.
//   3. Money events (checkout, purchase) load them at once — those must not
//      depend on the visitor staying a few seconds.
//
// Browser-only; every function is a no-op on the server.

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// After the page's own load, wait this long (then for an idle moment).
const LOAD_DELAY_MS = 3500;

type Queued = { (...args: unknown[]): void; queue: unknown[]; callMethod?: (...a: unknown[]) => void };
type TrackingWindow = Window & {
  _fbq?: unknown;
  __trackingLoad?: "scheduled" | "loaded";
};

/** Create the queueing fbq()/gtag() (and init/config) once. Safe to call often. */
export function ensureTrackingStubs(): void {
  if (typeof window === "undefined") return;
  const w = window as TrackingWindow;

  if (META_PIXEL_ID && !w.fbq) {
    // Meta's official stub: calls are queued until fbevents.js takes over.
    const n = function (this: unknown) {
      // eslint-disable-next-line prefer-rest-params, prefer-spread
      if (n.callMethod) n.callMethod.apply(n, arguments as unknown as unknown[]);
      // eslint-disable-next-line prefer-rest-params
      else n.queue.push(arguments);
    } as unknown as Queued & Record<string, unknown>;
    n.queue = [];
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    w.fbq = n as unknown as Window["fbq"];
    if (!w._fbq) w._fbq = n;
    w.fbq("init", META_PIXEL_ID);
  }

  if (GA_ID && !w.gtag) {
    // Google's official stub. gtag.js needs the `arguments` object itself,
    // not an array copy, so this can't be an arrow function.
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    } as Window["gtag"];
    w.gtag("js", new Date());
    // The first page_view is sent explicitly with THIS page's address: gtag.js
    // arrives later, and would otherwise read the address of wherever the
    // visitor has navigated to by then.
    w.gtag("config", GA_ID, { send_page_view: false });
    w.gtag("event", "page_view", { page_location: window.location.href, page_title: document.title });
  }
}

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Load the real Meta/Google files now (once). */
export function loadTrackingNow(): void {
  if (typeof window === "undefined") return;
  const w = window as TrackingWindow;
  ensureTrackingStubs();
  if (w.__trackingLoad === "loaded") return;
  w.__trackingLoad = "loaded";
  if (META_PIXEL_ID) addScript("https://connect.facebook.net/en_US/fbevents.js");
  if (GA_ID) addScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
}

/** Load them on first interaction, or after the page loads and goes idle. */
export function scheduleTrackingLoad(): void {
  if (typeof window === "undefined") return;
  const w = window as TrackingWindow;
  ensureTrackingStubs();
  if (w.__trackingLoad) return;
  w.__trackingLoad = "scheduled";

  const INTERACTIONS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const go = () => {
    INTERACTIONS.forEach((e) => window.removeEventListener(e, go));
    if (timer) clearTimeout(timer);
    loadTrackingNow();
  };
  INTERACTIONS.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));

  const afterLoad = () => {
    timer = setTimeout(() => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(go, { timeout: 2000 });
      else go();
    }, LOAD_DELAY_MS);
  };
  if (document.readyState === "complete") afterLoad();
  else window.addEventListener("load", afterLoad, { once: true });
}
