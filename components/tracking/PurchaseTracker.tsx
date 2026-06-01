"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/tracking";
import type { TrackingPurchase } from "@/types/tracking";

interface Props {
  data: TrackingPurchase;
}

// Drop this on /payment/success
// Fires Purchase once — sessionStorage prevents duplicate on refresh
export function PurchaseTracker({ data }: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    // Prevent duplicate on React StrictMode double-invoke
    if (tracked.current) return;
    tracked.current = true;

    // Prevent duplicate if user refreshes success page
    const storageKey = `purchase_tracked_${data.orderId}`;
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, "1");
    trackPurchase(data);
  }, [data]);

  return null;
}
