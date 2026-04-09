import type { NavItem } from "@/types/auth";

export const navItems: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Team", href: "/teams" },
  { label: "Contact", href: "/contact" },
] as const;

export const LOGO_CONFIG = {
  src: "/MerchSports-small.png",
  alt: "MerchSports Logo",
  width: 82,
  height: 82,
  mobileSize: 62,
} as const;

export const SCROLL_CONFIG = {
  hideThreshold: 80,
  scrolledThreshold: 60,
  headerHeightScrolled: 80,
  headerHeightDefault: 96,
} as const;
