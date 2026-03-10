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

const socialIcons = [Facebook, Instagram, Twitter, Youtube];

const quickLinks = [
  { label: "About", href: "#about" },
  { label: "Categories", href: "#categories" },
  { label: "Schedule", href: "#schedule" },
  { label: "Prizes", href: "#prizes" },
  { label: "FAQ", href: "#faq" },
];

const helpLinks = [
  { label: "Support", href: "#support" },
  { label: "Terms & Conditions", href: "#terms" },
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Refund Policy", href: "#refund" },
  { label: "Contact Help", href: "#contact-help" },
];

const SiteFooter = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Logo Section */}
          <div>
            {/* <h2 className="text-2xl font-extrabold uppercase mb-4">
              <span>RUN</span>
              <span className="text-red-500">FEST</span>
            </h2> */}
            <Link
              href="/"
              className="flex items-center relative w-[72px] h-[72px] group"
            >
              {/* Glow Layer */}
              <span className="absolute inset-0 rounded-full bg-neon-lime opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80"></span>

              {/* Logo Image */}
              <Image
                src="/MerchSports-small.png"
                alt="MerchSports"
                width={72}
                height={72}
                className="rounded-full object-cover relative z-10 transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mt-2">
              Inspiring runners to push beyond their limits. Join us for an
              unforgettable marathon experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold uppercase text-sm tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="hover:text-neon-lime transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-semibold uppercase text-sm tracking-wider mb-4">
              Help
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {helpLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="hover:text-neon-lime transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold uppercase text-sm tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-neon-lime" />
                info@runfest.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-neon-lime" />
                +880 1234 567890
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-neon-lime" />
                Dhaka, Bangladesh
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold uppercase text-sm tracking-wider mb-4">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {socialIcons.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-red-500 hover:border-red-500 transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          © 2026 MERCH SPORTS. All rights reserved. Run beyond your limits.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
