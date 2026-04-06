"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu,
  X,
  Plus,
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  User,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Team", href: "/teams" },
  { label: "Contact", href: "/contact" },
];

type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
} | null;

export default function SiteHeader4() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [user, setUser] = useState<AuthUser>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ✅ Optimized: Single auth check (removed duplicate listener)
  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split("@")[0] ||
            "User",
          image: authUser.user_metadata?.avatar_url || null,
        });
      }
      setLoading(false);
    };

    getUser();

    // ✅ Single auth listener
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User",
          image: session.user.user_metadata?.avatar_url || null,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // ✅ Only run once

  // ✅ Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (mobileOpen) {
            ticking = false;
            return;
          }

          const currentY = window.scrollY;

          if (currentY < lastScrollY.current) {
            setVisible(true);
          } else if (currentY > lastScrollY.current && currentY > 80) {
            setVisible(false);
          }

          setScrolled(currentY > 60);
          lastScrollY.current = currentY;
          ticking = false;
        });
      }
      ticking = true;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen]);

  // ✅ Lock body scroll (optimized)
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  // ✅ Click outside handler (using ref instead of document listener)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  // ✅ Memoized logout
  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <>
      {/* ✅ REMOVED framer-motion, using pure CSS */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm" : "bg-transparent"}`}
      >
        <div
          className={`mx-auto max-w-[1400px] flex items-center justify-between px-6 lg:px-8 transition-all duration-300 ${
            scrolled ? "h-20" : "h-24"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="relative z-10 group">
            <Image
              src="/MerchSports-small.png"
              alt="logo"
              width={82}
              height={82}
              className="rounded-full object-cover transition-transform hover:scale-105 w-[62px] h-[62px] md:w-[82px] md:h-[82px]"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`text-base font-bold uppercase tracking-wider transition-opacity hover:opacity-70 ${
                    scrolled ? "text-gray-800" : "text-gray-800/90"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Right Section */}
          <div className="hidden lg:block">
            {loading ? (
              <div className="w-36 h-12 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-4 py-3 hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* ✅ CSS-only dropdown (no framer-motion) */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 animate-dropdown">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        Profile
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/register"
                className="flex items-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-5 py-3 hover:bg-gray-800 transition-colors"
              >
                <span>Buy Ticket</span>
                <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                  <ArrowRight size={16} />
                </div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              mobileOpen
                ? "text-gray-900 hover:bg-gray-900/10"
                : scrolled
                  ? "text-gray-900 hover:bg-gray-100"
                  : "text-gray-900 hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ✅ Mobile Menu (CSS transitions instead of framer-motion) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-neon-lime overflow-y-auto animate-slide-in">
            <div className="flex flex-col h-full pt-24 pb-8 px-6">
              <nav className="flex-1">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between py-4 text-2xl font-black text-gray-900 uppercase hover:opacity-70 border-b border-gray-900/10"
                      >
                        {item.label}
                        <Plus size={20} />
                      </Link>
                    </li>
                  ))}
                  {user && (
                    <>
                      <li>
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between py-4 text-2xl font-black text-gray-900 uppercase hover:opacity-70 border-b border-gray-900/10"
                        >
                          Dashboard
                          <LayoutDashboard size={20} />
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/profile"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between py-4 text-2xl font-black text-gray-900 uppercase hover:opacity-70 border-b border-gray-900/10"
                        >
                          Profile
                          <User size={20} />
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>

              <div className="space-y-3">
                {loading ? (
                  <div className="w-full h-14 bg-gray-900/20 rounded-lg animate-pulse" />
                ) : user ? (
                  <>
                    <div className="flex items-center gap-3 bg-gray-900/10 rounded-lg px-4 py-3">
                      <div className="w-10 h-10 rounded-md bg-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate uppercase">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-900/60 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-sm rounded-lg px-6 py-4 hover:bg-gray-800"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-sm rounded-lg px-6 py-4 hover:bg-gray-800"
                  >
                    Buy Ticket
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
