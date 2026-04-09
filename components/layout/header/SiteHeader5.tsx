// components/SiteHeader4.tsx (Final optimized version)
"use client";

import { useState, useEffect, lazy, Suspense, memo } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { navItems } from "../navigation";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";

// Lazy load mobile menu (only when needed)
const MobileMenu = lazy(() => import("./MobileMenu"));

// Memoized mobile toggle button
const MobileToggle = memo(
  ({
    mobileOpen,
    scrolled,
    onClick,
  }: {
    mobileOpen: boolean;
    scrolled: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`lg:hidden p-2 rounded-lg transition-colors ${
        mobileOpen
          ? "text-gray-900 hover:bg-gray-900/10"
          : scrolled
            ? "text-gray-900 hover:bg-gray-100"
            : "text-gray-900 hover:bg-white/10"
      }`}
      aria-label="Toggle menu"
      aria-expanded={mobileOpen}
    >
      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  ),
);

MobileToggle.displayName = "MobileToggle";

export default function SiteHeader4() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, setUser } = useAuth();
  const { scrolled, visible } = useHeaderScroll(mobileOpen);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = () => setUser(null);
  const closeMobileMenu = () => setMobileOpen(false);
  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 will-change-transform ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm" : "bg-transparent"}`}
      >
        <div
          className={`mx-auto max-w-[1400px] flex items-center justify-between px-6 lg:px-8 transition-all duration-300 ${
            scrolled ? "h-20" : "h-24"
          }`}
        >
          <Logo scrolled={scrolled} />

          <DesktopNav
            navItems={navItems}
            scrolled={scrolled}
            user={user}
            loading={loading}
            onLogout={handleLogout}
          />

          <MobileToggle
            mobileOpen={mobileOpen}
            scrolled={scrolled}
            onClick={toggleMobileMenu}
          />
        </div>
      </nav>

      {/* Mobile Menu - Lazy loaded with Suspense */}
      {mobileOpen && (
        <Suspense fallback={null}>
          <MobileMenu
            isOpen={mobileOpen}
            onClose={closeMobileMenu}
            navItems={navItems}
            user={user}
            loading={loading}
            onLogout={handleLogout}
          />
        </Suspense>
      )}
    </>
  );
}
