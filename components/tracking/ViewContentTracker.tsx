"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/tracking";
import type { TrackingProduct } from "@/types/tracking";

interface Props {
  product: TrackingProduct;
}

// Drop this component anywhere on /events/[slug]
// It fires ViewContent once on mount and renders nothing
export function ViewContentTracker({ product }: Props) {
  useEffect(() => {
    trackViewContent(product);
  }, [product]);

  return null;
}
