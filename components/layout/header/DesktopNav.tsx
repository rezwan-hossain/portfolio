// components/header/DesktopNav.tsx (Optimized)
"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DesktopUserMenu from "./DesktopUserMenu";
import type { AuthUser } from "@/hooks/useAuth";

interface DesktopNavProps {
  navItems: readonly { label: string; href: string }[];
  scrolled: boolean;
  user: AuthUser;
  loading: boolean;
  onLogout: () => void;
}

const DesktopNav = memo(function DesktopNav({
  navItems,
  scrolled,
  user,
  loading,
  onLogout,
}: DesktopNavProps) {
  return (
    <>
      <ul className="hidden lg:flex items-center gap-10">
        {navItems.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              prefetch={true}
              className={`text-base font-bold uppercase tracking-wider transition-opacity hover:opacity-70 ${
                scrolled ? "text-gray-800" : "text-gray-800/90"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden lg:block">
        {loading ? (
          <div className="w-36 h-12 bg-gray-100 rounded-lg animate-pulse" />
        ) : user ? (
          <DesktopUserMenu user={user} onLogout={onLogout} />
        ) : (
          <Link
            href="/register"
            prefetch={true}
            className="flex items-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-5 py-3 hover:bg-gray-800 transition-colors"
          >
            <span>Buy Ticket</span>
            <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
              <ArrowRight size={16} />
            </div>
          </Link>
        )}
      </div>
    </>
  );
});

export default DesktopNav;
