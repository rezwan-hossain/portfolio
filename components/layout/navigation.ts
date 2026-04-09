// config/navigation.ts
export const navItems = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Team", href: "/teams" },
  { label: "Contact", href: "/contact" },
] as const;

export type NavItem = (typeof navItems)[number];
