// module/event/components/event-description/constants.ts

export const MAX_HEADER_LENGTH = 80;
export const SECTION_EXIT_THRESHOLD = 60;

export type SectionConfigData = {
  id: string;
  title: string;
  iconName: string;
  headerPatterns: RegExp[];
  bgColor: string;
  iconColor: string;
  collapsible?: boolean;
  autoAssignPrefixes?: string[];
};

export const SECTION_CONFIGS: SectionConfigData[] = [
  {
    id: "categories",
    title: "RACE CATEGORIES",
    iconName: "Ticket",
    headerPatterns: [
      // FIX: Must match the FULL phrase, not just the beginning
      /^race\s+categor(?:ies|y)(?:\s*[&:]\s*|\s+and\s+)?(?:registration\s+)?fees?[:\s]*$/i,
      /^race\s+categor(?:ies|y)$/i,
      /^categor(?:ies|y)\s+(?:&|and)\s+registration\s+fees?$/i,
      /^registration\s+fees?$/i, // ONLY if it's EXACTLY "Registration Fees"
    ],
    bgColor: "bg-white",
    iconColor: "text-event-gold",
  },
  {
    id: "benefits",
    title: "WHAT YOU'LL GET",
    iconName: "Gift",
    headerPatterns: [
      /^what\s+you.?ll\s+get[:\s]*$/i,
      /^what\s+you\s+will\s+get[:\s]*$/i,
      /^what.?s\s+included[:\s]*$/i,
      /^benefits[:\s]*$/i,
      /^inclusions[:\s]*$/i,
      /^race\s+kit[:\s]*$/i,
      /^runner.?s?\s+(?:kit|pack|package)[:\s]*$/i,
      /^what.?s\s+in\s+(?:the\s+)?(?:kit|pack|bag)[:\s]*$/i,
      /^entitlements?[:\s]*$/i,
    ],
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    autoAssignPrefixes: ["✅"],
  },
  {
    id: "awards",
    title: "AWARDS & RECOGNITION",
    iconName: "Trophy",
    headerPatterns: [
      /^awards?\s*(?:&|and)\s*recognition[:\s]*$/i,
      /^awards?\s*(?:&|and)\s*prizes?[:\s]*$/i,
      /^awards?[:\s]*$/i,
      /^prizes?[:\s]*$/i,
      /^podium\s+prizes?[:\s]*$/i,
    ],
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    autoAssignPrefixes: ["🥇", "🥈", "🥉", "🏆", "🏅", "🌟"],
  },
  {
    id: "whyJoin",
    title: "WHY JOIN?",
    iconName: "Heart",
    headerPatterns: [
      /^why\s+join\??[:\s]*$/i,
      /^why\s+participate\??[:\s]*$/i,
      /^reasons?\s+to\s+join[:\s]*$/i,
    ],
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    id: "schedule",
    title: "EVENT SCHEDULE",
    iconName: "Clock",
    headerPatterns: [
      /^event\s+schedule[:\s]*$/i,
      /^race\s+(?:day\s+)?schedule[:\s]*$/i,
      /^timeline[:\s]*$/i,
      /^program(?:me)?[:\s]*$/i,
      /^itinerary[:\s]*$/i,
    ],
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "rules",
    title: "RULES & REGULATIONS",
    iconName: "Shield",
    headerPatterns: [
      /^rules?\s*(?:&|and)\s*regulations?[:\s]*$/i,
      /^terms?\s*(?:&|and)\s*conditions?[:\s]*$/i,
      /^(?:race\s+)?rules?[:\s]*$/i,
      /^guidelines?[:\s]*$/i,
      /^regulations?[:\s]*$/i,
    ],
    bgColor: "bg-gray-50",
    iconColor: "text-gray-600",
    collapsible: true,
  },
  {
    id: "disqualification",
    title: "DISQUALIFICATION RULES",
    iconName: "XCircle",
    headerPatterns: [
      /^disqualification(?:\s+rules?)?[:\s]*$/i,
      /^violations?[:\s]*$/i,
      /^prohibited[:\s]*$/i,
    ],
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    collapsible: true,
    autoAssignPrefixes: ["🔴", "❌", "⛔", "🚫"],
  },
  {
    id: "community",
    title: "COMMUNITY PARTNER",
    iconName: "Users",
    headerPatterns: [
      /^community\s+partner(?:\s+opportunity)?[:\s]*$/i,
      /^group\s+registration[:\s]*$/i,
      /^team\s+registration[:\s]*$/i,
    ],
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    id: "contact",
    title: "CONTACT INFO",
    iconName: "Phone",
    headerPatterns: [
      /^contact(?:\s+(?:us|info|information|details))?[:\s]*$/i,
      /^(?:customer\s+)?support[:\s]*$/i,
      /^helpline[:\s]*$/i,
      /^enquir(?:y|ies)[:\s]*$/i,
      /^get\s+in\s+touch[:\s]*$/i,
    ],
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
];

export const EVENT_INFO_EMOJIS: Record<"date" | "location" | "time", string[]> =
  {
    date: ["📅", "🗓️", "🗓"],
    location: ["📍", "📌", "🏟️", "🏟"],
    time: ["⏰", "🕐", "⌚"],
  };

export const ALL_ITEM_PREFIXES = [
  "*",
  "•",
  "▸",
  "▹",
  "→",
  "➤",
  "➜",
  "-",
  "✔",
  "✅",
  "☑",
  "✓",
  "🔴",
  "❌",
  "⛔",
  "🚫",
  "🥇",
  "🥈",
  "🥉",
  "🏆",
  "🏅",
  "🌟",
  "⭐",
];
