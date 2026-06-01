import type { TrackingProduct, TrackingPurchase } from "@/types/tracking";

const CURRENCY = "BDT";

// ─────────────────────────────────────────────────────────────────
// VIEW CONTENT
// Fires when user lands on /events/[slug]
// ─────────────────────────────────────────────────────────────────
export function trackViewContent(product: TrackingProduct): void {
  if (typeof window === "undefined") return;

  // GA4
  if (window.gtag) {
    window.gtag("event", "view_item", {
      currency: CURRENCY,
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_variant: product.distance,
          price: product.price,
          quantity: 1,
        },
      ],
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: CURRENCY,
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// INITIATE CHECKOUT
// Fires when user lands on /checkout
// ─────────────────────────────────────────────────────────────────
export function trackInitiateCheckout(product: TrackingProduct): void {
  if (typeof window === "undefined") return;

  // GA4
  if (window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: CURRENCY,
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_variant: product.distance,
          price: product.price,
          quantity: 1,
        },
      ],
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: CURRENCY,
      num_items: 1,
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// PURCHASE
// Fires when user lands on /payment/success
// ─────────────────────────────────────────────────────────────────
export function trackPurchase(data: TrackingPurchase): void {
  if (typeof window === "undefined") return;

  // GA4
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: data.orderId,
      value: data.value,
      currency: CURRENCY,
      items: [
        {
          item_id: data.product.id,
          item_name: data.product.name,
          item_variant: data.product.distance,
          price: data.value,
          quantity: 1,
        },
      ],
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      content_ids: [data.product.id],
      content_name: data.product.name,
      content_type: "product",
      value: data.value,
      currency: CURRENCY,
      num_items: 1,
      order_id: data.orderId,
    });
  }
}
