// components/layout/SiteHeader4.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
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
  const mobileOpenRef = useRef(false);
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Check auth state
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

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
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getUser();
  }, [pathname]);

  // ✅ Listen for auth changes
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

    return () => subscription.unsubscribe();
  }, []);

  // Keep ref in sync
  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  // Lock body scroll
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (mobileOpenRef.current) return;
      const currentY = window.scrollY;

      if (currentY < lastScrollY.current) {
        setVisible(true);
      } else if (currentY > lastScrollY.current && currentY > 80) {
        setVisible(false);
      }

      setScrolled(currentY > 60);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setUserMenuOpen(false);
    if (userMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [userMenuOpen]);

  // ✅ Logout handler
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <motion.nav
        animate={{ y: visible ? 0 : "-100%" }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm" : "bg-transparent"
        }`}
      >
        <div
          className={`mx-auto max-w-[1400px] flex items-center justify-between px-6 lg:px-8 transition-all duration-500 ${
            scrolled ? "h-20" : "h-24"
          }`}
        >
          {/* Logo */}
          <a
            href="#home"
            className="relative z-10 group"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/MerchSports-small.png"
                alt="logo"
                width={82}
                height={82}
                className="rounded-full object-cover relative z-10 transition-transform w-[62px] h-[62px] md:w-[82px] md:h-[82px]"
                priority
              />
            </motion.div>
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 text-base font-bold uppercase tracking-wider transition-all duration-300 hover:opacity-70 ${
                    scrolled ? "text-gray-800" : "text-gray-800/90"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ✅ Desktop Right Section */}
          <div className="hidden lg:block">
            {loading ? (
              // Loading skeleton — same size as button
              <div className="w-36 h-12 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              // ✅ LOGGED IN — User Button (matches Buy Ticket style)
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-4 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  {/* Avatar */}
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
                      <span className="text-sm font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <span className="max-w-[100px] truncate">{user.name}</span>

                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                {/* ✅ Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Links */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          Profile
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // ✅ NOT LOGGED IN — Buy Ticket Button (original design)
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/register"
                  className="flex items-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-5 py-3 hover:bg-gray-800 transition-colors"
                >
                  <span>Buy Ticket</span>
                  <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                    <ArrowRight size={16} />
                  </div>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden relative z-50 p-2 rounded-lg transition-colors ${
              mobileOpen
                ? "text-gray-900 hover:bg-gray-900/10"
                : scrolled
                  ? "text-gray-900 hover:bg-gray-100"
                  : "text-gray-900 hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* ✅ Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-lg"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[300px] bg-neon-lime overflow-y-auto overscroll-contain"
            >
              <div className="flex flex-col h-full pt-24 pb-8 px-6">
                <nav className="flex-1">
                  <ul className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.li
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between py-4 text-2xl font-black text-gray-900 uppercase hover:opacity-70 transition-colors border-b border-gray-900/10"
                        >
                          {item.label}
                          <Plus size={20} />
                        </Link>
                      </motion.li>
                    ))}

                    {/* ✅ Mobile: Dashboard & Profile links (when logged in) */}
                    {user && (
                      <>
                        <motion.li
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: navItems.length * 0.1 }}
                        >
                          <Link
                            href="/dashboard"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between py-4 text-2xl font-black text-gray-900 uppercase hover:opacity-70 transition-colors border-b border-gray-900/10"
                          >
                            Dashboard
                            <LayoutDashboard size={20} />
                          </Link>
                        </motion.li>
                        <motion.li
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: (navItems.length + 1) * 0.1,
                          }}
                        >
                          <Link
                            href="/profile"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between py-4 text-2xl font-black text-gray-900 uppercase hover:opacity-70 transition-colors border-b border-gray-900/10"
                          >
                            Profile
                            <User size={20} />
                          </Link>
                        </motion.li>
                      </>
                    )}
                  </ul>
                </nav>

                {/* ✅ Mobile Bottom Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  {loading ? (
                    <div className="w-full h-14 bg-gray-900/20 rounded-lg animate-pulse" />
                  ) : user ? (
                    <>
                      {/* User Info Card */}
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

                      {/* Sign Out Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-sm rounded-lg px-6 py-4 hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    // Not logged in — original Buy Ticket
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-sm rounded-lg px-6 py-4 hover:bg-gray-800 transition-colors"
                    >
                      Buy Ticket
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
