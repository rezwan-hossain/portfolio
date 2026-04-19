// components/layout/SiteFooter.tsx
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CurrentYear from "../ui/CurrentYear";

const socialIcons = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Youtube, label: "Youtube", href: "#" },
];

const quickLinks = [
  { label: "About", href: "#about" },
  { label: "Categories", href: "#categories" },
  { label: "Schedule", href: "#schedule" },
  { label: "Prizes", href: "#prizes" },
  { label: "FAQ", href: "#faq" },
];

const helpLinks = [
  { label: "Support", href: "#support" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "#refund" },
  { label: "Contact Help", href: "/contact" },
];

const SiteFooter = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        {/* ─── Top Section: Logo + Social (Mobile Centered) ─── */}
        <div className="flex flex-col items-center text-center md:hidden mb-10">
          <Link href="/" className="relative w-[72px] h-[72px] group">
            <span className="absolute inset-0 rounded-full bg-neon-lime opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80" />
            <Image
              src="/MerchSports-small.png"
              alt="MerchSports"
              width={72}
              height={72}
              className="rounded-full object-cover relative z-10 transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed mt-4 max-w-xs">
            Inspiring runners to push beyond their limits. Join us for an
            unforgettable marathon experience.
          </p>

          {/* Social Icons — Mobile */}
          <div className="flex gap-3 mt-5">
            {socialIcons.map((social, i) => (
              <a
                key={i}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-neon-lime hover:border-neon-lime transition-all"
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 md:gap-12">
          {/* Logo Section — Desktop Only */}
          <div className="hidden md:block">
            <Link
              href="/"
              className="relative w-[72px] h-[72px] group inline-block"
            >
              <span className="absolute inset-0 rounded-full bg-neon-lime opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80" />
              <Image
                src="/MerchSports-small.png"
                alt="MerchSports"
                width={72}
                height={72}
                className="rounded-full object-cover relative z-10 transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mt-3">
              Inspiring runners to push beyond their limits. Join us for an
              unforgettable marathon experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold uppercase text-xs sm:text-sm tracking-wider mb-3 sm:mb-4 text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-neon-lime transition-colors inline-block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-semibold uppercase text-xs sm:text-sm tracking-wider mb-3 sm:mb-4 text-white">
              Help
            </h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {helpLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-sm text-gray-400 hover:text-neon-lime transition-colors inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — Full Width on Mobile */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h4 className="font-semibold uppercase text-xs sm:text-sm tracking-wider mb-3 sm:mb-4 text-white">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@runfest.com"
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-neon-lime transition-colors group"
                >
                  <span className="w-9 h-9 rounded-full bg-gray-800 group-hover:bg-neon-lime/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Mail size={16} className="text-neon-lime" />
                  </span>
                  info@merchcommunication.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+8801862221943"
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-neon-lime transition-colors group"
                >
                  <span className="w-9 h-9 rounded-full bg-gray-800 group-hover:bg-neon-lime/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Phone size={16} className="text-neon-lime" />
                  </span>
                  +8801862221943
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-neon-lime" />
                </span>
                House-32,Road-08,Block-H,Mirpur-2
              </li>
            </ul>
          </div>

          {/* Social Media — Desktop Only */}
          <div className="hidden md:block px-2 ml-2">
            <h4 className="font-semibold uppercase text-sm tracking-wider mb-4 text-white ">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {socialIcons.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-neon-lime hover:border-neon-lime transition-all"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Bottom Section ─── */}
        <div className="border-t border-gray-800 mt-10 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-gray-500">
              © <CurrentYear /> MERCH SPORTS. All rights reserved.
            </p>
            <p className="text-xs text-gray-600 hidden sm:block">
              Run beyond your limits.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
