"use client";

import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// const navItems = [
//   { label: "HOME", hasDropdown: true },
//   { label: "EVENTS", hasDropdown: true },
//   { label: "GALLERY", hasDropdown: true },
//   { label: "BLOG", hasDropdown: true },
//   { label: "CONTACT", hasDropdown: false },
// ];

const navItems = [
  { label: "Home", href: "/" },
  { label: "EVENTS", href: "/events" },
  { label: "GALLERY", href: "/gallery", hasDropdown: true },
  { label: "Contact", href: "/contact" },
];

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full bg-background">
      <div className="border-b border-gray-200">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-2 lg:px-8 ">
          {/* <a
            href="/"
            className="font-display text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl"
          >
            CONFERIO
          </a> */}

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center relative w-[92px] h-[92px] group"
          >
            {/* Glow Layer */}
            <span className="absolute inset-0 rounded-full bg-neon-lime opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80"></span>

            {/* Logo Image */}
            <Image
              src="/MerchSports-small.png"
              alt="MerchSports"
              width={92}
              height={92}
              className="rounded-full object-cover relative z-10 transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href || "#"}
                  className="uppercase flex items-center gap-1 font-sans text-base font-semibold tracking-wide text-gray-800 transition-colors hover:text-lime-500"
                >
                  {item.label}
                  {item.hasDropdown && <span className="text-xs">+</span>}
                </Link>
              </li>
            ))}
          </ul>
          {/* flex items-center gap-1 font-body text-sm font-medium tracking-wide text-foreground transition-opacity hover:opacity-70 */}
          {/* CTA Button */}
          {/* <a
            href="#"
            className="hidden items-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 lg:flex"
          >
            BUY TICKET
            <ArrowRight className="h-4 w-4" />
          </a> */}

          <Link
            href="/login"
            className="hidden lg:block bg-neon-lime text-white font-extrabold uppercase tracking-wide transition-all duration-300 ease-in-out px-6 py-4 rounded-full text-xs"
          >
            REGISTER NOW
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 py-6 lg:hidden">
          <ul className="flex flex-col gap-5">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href || "#"}
                  className="flex items-center gap-1 font-body text-base font-medium text-foreground"
                >
                  {item.label}
                  {item.hasDropdown && <span className="text-xs">+</span>}
                </Link>
              </li>
            ))}
          </ul>
          {/* <a
            href="#"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground"
          >
            BUY TICKET
            <ArrowRight className="h-4 w-4" />
          </a> */}

          <Link
            href="/login"
            className="block lg:hidden bg-neon-lime text-black font-extrabold uppercase tracking-wide transition-all duration-300 ease-in-out px-6 py-3 rounded-full text-xs"
          >
            REGISTER NOW
          </Link>
        </div>
      )}
    </nav>
  );
};

export default SiteHeader;
