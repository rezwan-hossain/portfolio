// hooks/useHeaderScroll.ts (Enhanced with debounce)
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useHeaderScroll(mobileOpen: boolean) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (mobileOpen) return;

    // Cancel previous animation frame
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const currentY = window.scrollY;

      // Direction detection
      if (currentY < lastScrollY.current) {
        setVisible(true);
      } else if (currentY > lastScrollY.current && currentY > 80) {
        setVisible(false);
      }

      // Scrolled state
      setScrolled(currentY > 60);
      lastScrollY.current = currentY;
    });
  }, [mobileOpen]);

  useEffect(() => {
    // Passive listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  return { scrolled, visible };
}
