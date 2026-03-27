"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader3() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  const lastScrollY = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Show navbar when scrolling UP, hide when scrolling DOWN
      if (currentY < lastScrollY.current) {
        setVisible(true); // scrolling up
      } else if (currentY > lastScrollY.current && currentY > 80) {
        setVisible(false); // scrolling down (only after 80px)
        setMobileOpen(false); // close mobile menu on hide
      }

      setScrolled(currentY > 60);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      animate={{ y: visible ? 0 : "-100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div
        className={`mx-auto max-w-[1400px] flex items-center justify-between px-6 lg:px-8 transition-all duration-300 ${
          scrolled ? "h-16 md:h-20" : "h-18 md:h-22"
        }`}
      >
        {/* LOGO */}
        <Link
          href="/"
          className="relative flex items-center w-[62px] h-[62px] md:w-[82px] md:h-[82px] group"
        >
          <span className="absolute inset-0 rounded-full bg-lime-400 blur-xl opacity-0 group-hover:opacity-60 transition" />
          <Image
            src="/MerchSports-small.png"
            alt="logo"
            width={82}
            height={82}
            className="rounded-full object-cover relative z-10 transition-transform group-hover:scale-105 w-[62px] h-[62px] md:w-[82px] md:h-[82px]"
            priority
          />
        </Link>

        {/* DESKTOP NAV */}
        <ul className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label} className="relative">
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 font-semibold uppercase tracking-wide transition-colors ${
                    isActive
                      ? "text-lime-500"
                      : "text-gray-800 hover:text-lime-500"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <Link
          href="/register"
          className="hidden lg:block bg-lime-500 text-white font-extrabold uppercase tracking-wide px-6 py-3 rounded-full text-xs transition-all hover:scale-105"
        >
          Register Now
        </Link>

        {/* MOBILE TOGGLE */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 bg-white overflow-hidden"
          >
            <div className="px-6 py-6 space-y-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-lg font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/register"
                className="block text-center bg-lime-500 text-black font-bold uppercase tracking-wide px-6 py-4 rounded-full text-sm"
              >
                Register Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
