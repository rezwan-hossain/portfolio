"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader4() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  const lastScrollY = useRef(0);
  const mobileOpenRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
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

  useEffect(() => {
    const handleScroll = () => {
      // Skip scroll handling entirely when mobile menu is open
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
          {/* CONFERIO Style Logo */}
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

          {/* Desktop Navigation - CONFERIO Style */}
          <ul className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={` flex items-center gap-1 text-base  font-bold uppercase tracking-wider transition-all duration-300 hover:opacity-70 ${
                    scrolled ? "text-gray-800" : "text-gray-800/90 "
                  }`}
                >
                  {item.label}
                  {/* <Plus size={12} className="opacity-60" /> */}
                </Link>
              </li>
            ))}
          </ul>

          {/* CONFERIO Style CTA Button */}
          <motion.a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#register");
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden lg:flex items-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-5 py-3 hover:bg-gray-800 transition-colors"
          >
            <span>Buy Ticket</span>
            <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
              <ArrowRight size={16} />
            </div>
          </motion.a>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden relative z-50 p-2 rounded-lg transition-colors ${
              mobileOpen
                ? "text-gray-900 hover:bg-gray-900/10"
                : scrolled
                  ? "text-gray-900 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
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

      {/* Mobile Menu Overlay */}
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
                        <a
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item.href);
                          }}
                          className="flex items-center justify-between py-4 text-2xl font-black text-gray-900 uppercase hover:opacity-70 transition-colors border-b border-gray-900/10"
                        >
                          {item.label}
                          <Plus size={20} />
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick("#register");
                  }}
                  className="flex items-center justify-center gap-3 bg-gray-900 text-white font-bold uppercase tracking-wider text-sm rounded-lg px-6 py-4 hover:bg-gray-800 transition-colors"
                >
                  Buy Ticket
                  <ArrowRight size={16} />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
