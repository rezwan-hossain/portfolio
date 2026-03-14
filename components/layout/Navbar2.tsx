"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  {
    label: "Events",
    href: "/events",
    // dropdown: [
    //   { label: "Running", href: "/events/running" },
    //   { label: "Cycling", href: "/events/cycling" },
    // ],
  },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader2() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navHeight = scrolled ? "h-16 md:h-20" : "h-18 md:h-22";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div
        className={`mx-auto max-w-[1400px] flex items-center justify-between px-6 lg:px-8 transition-all duration-300 ${navHeight}`}
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
            className="rounded-full object-cover relative z-10 transition-transform group-hover:scale-105 w-[62px] h-[62px] md:w-[82px] md:h-[82px] "
            priority
          />
        </Link>

        {/* DESKTOP NAV */}
        <ul className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 font-semibold uppercase tracking-wide transition-colors ${
                    isActive
                      ? "text-lime-500"
                      : "text-gray-800 hover:text-lime-500"
                  }`}
                >
                  {item.label}

                  {/* {item.dropdown && <ChevronDown className="w-4 h-4" />} */}
                </Link>

                {/* DROPDOWN */}
                {/* <AnimatePresence>
                  {item.dropdown && openDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-4 w-44 rounded-xl bg-white shadow-xl border p-3"
                    >
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence> */}
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <Link
          href="/register"
          className="hidden lg:block bg-neon-lime text-white font-extrabold uppercase tracking-wide px-6 py-3 rounded-full text-xs transition-all hover:scale-105"
        >
          Register Now
        </Link>

        {/* MOBILE TOGGLE */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
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
    </nav>
  );
}
