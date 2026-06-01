// ─── Window augmentation ──────────────────────────────────────────
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      command: "js" | "config" | "event",
      target: string | Date,
      params?: Record<string, unknown>,
    ) => void;
    fbq: (
      command: "init" | "track" | "trackCustom",
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

// ─── Tracking types ───────────────────────────────────────────────
export interface TrackingProduct {
  id: string; // package id
  name: string; // event name
  price: number; // amount in BDT
  packageName: string;
  distance: string;
}

export interface TrackingPurchase {
  orderId: string;
  value: number; // amount paid in BDT
  product: TrackingProduct;
}
