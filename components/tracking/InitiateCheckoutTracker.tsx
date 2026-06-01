"use client";

import { useEffect } from "react";
import { trackInitiateCheckout } from "@/lib/tracking";
import type { TrackingProduct } from "@/types/tracking";

interface Props {
  product: TrackingProduct;
}

// Drop this on your checkout page
// Fires InitiateCheckout once on mount
export function InitiateCheckoutTracker({ product }: Props) {
  useEffect(() => {
    trackInitiateCheckout(product);
  }, [product]);

  return null;
}
