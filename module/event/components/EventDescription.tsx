"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Gift,
  Users,
  CheckCircle,
  XCircle,
  Star,
  Ticket,
  Heart,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Medal,
  Shield,
  Sparkles,
  Phone,
  type LucideIcon,
} from "lucide-react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

type EventDescriptionProps = {
  description: string;
  className?: string;
};

type SectionConfig = {
  id: string;
  title: string;
  icon: LucideIcon;
  headerPatterns: RegExp[];
  bgColor: string;
  iconColor: string;
  collapsible?: boolean;
  autoAssignPrefixes?: string[];
};

type ParsedEventInfo = {
  id: string;
  icon: "date" | "location" | "time";
  text: string;
};

type ParsedCategory = {
  id: string;
  name: string;
  price: string;
  distance?: string;
};

type ParsedSection = {
  id: string;
  configId: string;
  title: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  collapsible: boolean;
  items: string[];
};

type ParsedData = {
  intro: string[];
  eventInfo: ParsedEventInfo[];
  categories: ParsedCategory[];
  sections: ParsedSection[];
  other: string[];
};

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const MAX_HEADER_LENGTH = 80;
const SECTION_EXIT_THRESHOLD = 60;

/**
 * FIX: Apostrophe matching uses `.?` (any single char or nothing)
 * instead of a character class with literal curly quotes that
 * get mangled by editors/transpilers.
 *
 * `.?` safely matches:  '  '  '  ʼ  or no character at all
 */
const SECTION_CONFIGS: SectionConfig[] = [
  {
    id: "categories",
    title: "RACE CATEGORIES",
    icon: Ticket,
    headerPatterns: [
      /^race\s+categor/i,
      /^registration\s+fees?/i,
      /^categor(?:ies|y)\s+(?:&|and)\s+(?:registration\s+)?fees?/i,
    ],
    bgColor: "bg-white",
    iconColor: "text-event-gold",
  },
  {
    id: "benefits",
    title: "WHAT YOU'LL GET",
    icon: Gift,
    headerPatterns: [
      /^what\s+you.?ll\s+get/i, // .? matches ANY apostrophe variant
      /^what\s+you\s+will\s+get/i,
      /^what.?s\s+included/i,
      /^benefits$/i,
      /^inclusions$/i,
      /^race\s+kit/i,
      /^runner.?s?\s+(?:kit|pack|package)/i,
      /^what.?s\s+in\s+(?:the\s+)?(?:kit|pack|bag)/i,
      /^entitlements?$/i,
    ],
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    autoAssignPrefixes: ["✔", "✅", "☑", "✓"],
  },
  {
    id: "awards",
    title: "AWARDS & RECOGNITION",
    icon: Trophy,
    headerPatterns: [
      /^awards?\s+(?:&|and)\s+recognition/i,
      /^awards?\s+(?:&|and)\s+prizes?/i,
      /^awards?$/i,
      /^prizes?$/i,
      /^podium\s+prizes?/i,
    ],
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    autoAssignPrefixes: ["🥇", "🥈", "🥉", "🏆", "🏅"],
  },
  {
    id: "whyJoin",
    title: "WHY JOIN?",
    icon: Heart,
    headerPatterns: [
      /^why\s+join/i,
      /^why\s+participate/i,
      /^reasons?\s+to\s+join/i,
    ],
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    id: "schedule",
    title: "EVENT SCHEDULE",
    icon: Clock,
    headerPatterns: [
      /^event\s+schedule/i,
      /^race\s+(?:day\s+)?schedule/i,
      /^timeline$/i,
      /^program(?:me)?$/i,
      /^itinerary$/i,
    ],
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "rules",
    title: "RULES & REGULATIONS",
    icon: Shield,
    headerPatterns: [
      /^rules?\s+(?:&|and)\s+regulations?/i,
      /^terms?\s+(?:&|and)\s+conditions?/i,
      /^(?:race\s+)?rules?$/i,
      /^guidelines?$/i,
    ],
    bgColor: "bg-gray-50",
    iconColor: "text-gray-600",
    collapsible: true,
  },
  {
    id: "disqualification",
    title: "DISQUALIFICATION RULES",
    icon: XCircle,
    headerPatterns: [
      /^disqualification(?:\s+rules?)?/i,
      /^violations?$/i,
      /^prohibited$/i,
    ],
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    collapsible: true,
    autoAssignPrefixes: ["🔴", "❌", "⛔", "🚫"],
  },
  {
    id: "community",
    title: "COMMUNITY PARTNER",
    icon: Users,
    headerPatterns: [
      /^community\s+partner/i,
      /^group\s+registration/i,
      /^team\s+registration/i,
    ],
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    id: "contact",
    title: "CONTACT INFO",
    icon: Phone,
    headerPatterns: [
      /^contact(?:\s+(?:us|info|information|details))?$/i,
      /^(?:customer\s+)?support$/i,
      /^helpline/i,
      /^enquir(?:y|ies)/i,
      /^get\s+in\s+touch$/i,
    ],
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
];

const EVENT_INFO_EMOJIS: Record<"date" | "location" | "time", string[]> = {
  date: ["📅", "🗓️", "🗓"],
  location: ["📍", "📌", "🏟️", "🏟"],
  time: ["⏰", "🕐", "⌚"],
};

const ALL_ITEM_PREFIXES = [
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

// ─── HELPERS ────────────────────────────────────────────────────────────────

const getEmptyParsedData = (): ParsedData => ({
  intro: [],
  eventInfo: [],
  categories: [],
  sections: [],
  other: [],
});

const startsWithAny = (text: string, prefixes: string[]): boolean =>
  prefixes.some((p) => text.startsWith(p));

const cleanText = (text: string): string =>
  text
    .replace(
      /^[\u{2600}-\u{27BF}\u{2B50}-\u{2B55}\u{1F300}-\u{1FAFF}\u{FE0E}\u{FE0F}]+\s*/gu,
      "",
    )
    .replace(/^[*•▸▹→➤➜✔✅☑✓\-–—]+\s*/g, "")
    .trim();

const matchSectionHeader = (rawText: string): SectionConfig | null => {
  const cleaned = cleanText(rawText);
  if (cleaned.length > MAX_HEADER_LENGTH) return null;

  const normalized = cleaned.replace(/[:.\-–—!?]+$/, "").trim();

  for (const config of SECTION_CONFIGS) {
    for (const pattern of config.headerPatterns) {
      if (pattern.test(normalized)) return config;
    }
  }
  return null;
};

const getEventInfoType = (
  text: string,
): "date" | "location" | "time" | null => {
  for (const [type, emojis] of Object.entries(EVENT_INFO_EMOJIS)) {
    if (startsWithAny(text, emojis))
      return type as "date" | "location" | "time";
  }
  return null;
};

const findAutoAssignSection = (text: string): SectionConfig | null => {
  for (const config of SECTION_CONFIGS) {
    if (
      config.autoAssignPrefixes &&
      startsWithAny(text, config.autoAssignPrefixes)
    )
      return config;
  }
  return null;
};

const shouldSkipLine = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return /^and\s+many\s+more/i.test(cleanText(trimmed));
};

const isListLikeItem = (text: string): boolean =>
  startsWithAny(text, ALL_ITEM_PREFIXES);

const parseCategory = (text: string): Omit<ParsedCategory, "id"> | null => {
  const patterns = [
    /^[*•\-]?\s*(.+?)\s*[–\-—]\s*(BDT\s*[\d,]+|৳\s*[\d,]+)/i,
    /^(.+?)\s*[–\-—]\s*(BDT\s*[\d,]+|৳\s*[\d,]+)/i,
    /^(\d+\s*KM?.+?)\s*[–\-—:]\s*([\d,]+\s*(?:BDT|৳|TK)?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const name = match[1].replace(/^[*•\-]\s*/, "").trim();
      const price = match[2].trim();
      const distanceMatch = name.match(/(\d+(?:\.\d+)?\s*(?:KM|K|km))/i);
      return {
        name,
        price: price.replace(/^(BDT|৳|TK)\s*/i, "৳"),
        distance: distanceMatch?.[1],
      };
    }
  }
  return null;
};

const splitIntroAndItems = (
  items: string[],
): { intro: string | null; listItems: string[] } => {
  if (items.length > 1 && items[0].endsWith(":")) {
    return { intro: items[0], listItems: items.slice(1) };
  }
  return { intro: null, listItems: items };
};

// ─── LINE EXTRACTION ────────────────────────────────────────────────────────

/**
 * FIX: Extracts text lines from *all* block-level HTML elements,
 * not just <p>. Handles:
 *   • <p>, <h1>–<h6>, <li>, <blockquote>
 *   • <br>-separated content within any element
 *   • <div> leaf nodes (fallback when no standard blocks exist)
 *   • Plain text with newlines (final fallback)
 */
const extractLines = (doc: Document): string[] => {
  const body = doc.body;
  if (!body) return [];

  const lines: string[] = [];
  const blockSelector = "p, h1, h2, h3, h4, h5, h6, li, blockquote";

  let elements = Array.from(body.querySelectorAll(blockSelector));

  // Fallback: if no standard block elements, try leaf <div>s
  if (elements.length === 0) {
    elements = Array.from(body.querySelectorAll("div")).filter(
      (div) => !div.querySelector(blockSelector + ", div"),
    );
  }

  for (const el of elements) {
    const html = el.innerHTML;

    // Split on <br> tags within the element
    if (/<br\s*\/?>/i.test(html)) {
      const parts = html.split(/<br\s*\/?>/gi);
      for (const part of parts) {
        const tmp = document.createElement("span");
        tmp.innerHTML = part;
        const text = tmp.textContent?.trim();
        if (text) lines.push(text);
      }
    } else {
      // Skip elements whose text is entirely covered by nested blocks
      // (prevents duplicates from e.g. <div><p>text</p></div>)
      const hasNestedBlock = el.querySelector(blockSelector);
      if (!hasNestedBlock) {
        const text = el.textContent?.trim();
        if (text) lines.push(text);
      }
    }
  }

  // Final fallback: split body text by newlines
  if (lines.length === 0) {
    const bodyText = body.textContent || "";
    for (const line of bodyText.split("\n")) {
      const trimmed = line.trim();
      if (trimmed) lines.push(trimmed);
    }
  }

  return lines;
};

// ─── PARSER ─────────────────────────────────────────────────────────────────

const parseDescription = (description: string): ParsedData => {
  if (typeof window === "undefined" || !description) {
    return getEmptyParsedData();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(description, "text/html");
  const lines = extractLines(doc);

  if (lines.length === 0) {
    return getEmptyParsedData();
  }

  const result: ParsedData = getEmptyParsedData();
  const sectionsMap = new Map<string, ParsedSection>();
  let activeConfigId: string | null = null;
  let introComplete = false;

  const getOrCreateSection = (config: SectionConfig): ParsedSection => {
    if (!sectionsMap.has(config.id)) {
      sectionsMap.set(config.id, {
        id: `section-${config.id}`,
        configId: config.id,
        title: config.title,
        icon: config.icon,
        bgColor: config.bgColor,
        iconColor: config.iconColor,
        collapsible: config.collapsible ?? false,
        items: [],
      });
    }
    return sectionsMap.get(config.id)!;
  };

  const addItem = (configId: string, item: string): void => {
    const config = SECTION_CONFIGS.find((c) => c.id === configId);
    if (!config) return;
    const section = getOrCreateSection(config);
    if (!section.items.includes(item)) section.items.push(item);
  };

  for (const rawText of lines) {
    if (!rawText) continue;
    if (shouldSkipLine(rawText)) continue;

    // ① Section header
    const headerMatch = matchSectionHeader(rawText);
    if (headerMatch) {
      activeConfigId = headerMatch.id;
      getOrCreateSection(headerMatch);
      introComplete = true;
      continue;
    }

    // ② Event-info metadata (📅 📍 ⏰)
    const infoType = getEventInfoType(rawText);
    if (infoType) {
      result.eventInfo.push({
        id: `info-${result.eventInfo.length}`,
        icon: infoType,
        text: cleanText(rawText),
      });
      introComplete = true;
      continue;
    }

    // ③ Inside an active section
    if (activeConfigId) {
      const cleaned = cleanText(rawText);
      if (!cleaned) continue;

      // Section-exit heuristic
      const current = sectionsMap.get(activeConfigId);
      if (
        current &&
        current.items.length > 0 &&
        !isListLikeItem(rawText) &&
        cleaned.length > SECTION_EXIT_THRESHOLD
      ) {
        activeConfigId = null;
        result.other.push(cleaned);
        continue;
      }

      // Category-specific parsing
      if (activeConfigId === "categories") {
        const cat = parseCategory(rawText);
        if (cat) {
          result.categories.push({
            id: `cat-${result.categories.length}`,
            ...cat,
          });
          continue;
        }
      }

      addItem(activeConfigId, cleaned);
      continue;
    }

    // ④ Auto-assign by prefix
    const autoSection = findAutoAssignSection(rawText);
    if (autoSection) {
      const cleaned = cleanText(rawText);
      if (cleaned) {
        addItem(autoSection.id, cleaned);
        introComplete = true;
      }
      continue;
    }

    // ⑤ Intro vs Other
    if (!introComplete && !isListLikeItem(rawText)) {
      result.intro.push(rawText);
    } else if (rawText.length > 10 && !isListLikeItem(rawText)) {
      result.other.push(rawText);
    }
  }

  // Categories have their own UI — exclude from generic sections
  result.sections = Array.from(sectionsMap.values()).filter(
    (s) => s.items.length > 0 && s.configId !== "categories",
  );

  return result;
};

// ─── SECTION RENDERERS ──────────────────────────────────────────────────────

const BenefitsSection = ({ items }: { items: string[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
    {items.map((item, i) => (
      <div
        key={`benefit-${i}`}
        className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-lg p-3 sm:p-4 hover:border-green-300 transition group/item"
      >
        <CheckCircle
          size={18}
          className="text-green-600 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition"
        />
        <p className="font-body text-sm text-green-800 leading-relaxed">
          {item}
        </p>
      </div>
    ))}
  </div>
);

const AwardsSection = ({ items }: { items: string[] }) => {
  const { intro, listItems } = splitIntroAndItems(items);
  return (
    <div className="space-y-3">
      {intro && (
        <p className="font-body text-sm text-amber-800 italic mb-1">{intro}</p>
      )}
      {listItems.map((item, i) => (
        <div
          key={`award-${i}`}
          className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-lg p-3 sm:p-4 hover:shadow-md transition"
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            {i === 0 ? (
              <Medal size={16} className="text-amber-600" />
            ) : (
              <Star size={16} className="text-amber-500" />
            )}
          </div>
          <p className="font-body text-sm text-amber-900 leading-relaxed">
            {item}
          </p>
        </div>
      ))}
    </div>
  );
};

const WhyJoinSection = ({ items }: { items: string[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {items.map((item, i) => (
      <div
        key={`why-${i}`}
        className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-lg hover:shadow-sm transition"
      >
        <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap size={12} className="text-pink-600" />
        </div>
        <p className="font-body text-sm text-pink-900 leading-relaxed">
          {item}
        </p>
      </div>
    ))}
  </div>
);

const RulesSection = ({ items }: { items: string[] }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5">
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={`rule-${i}`}
          className="flex items-start gap-3 font-body text-sm text-gray-700"
        >
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-medium text-gray-600">{i + 1}</span>
          </div>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const DisqualificationSection = ({ items }: { items: string[] }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5">
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={`disq-${i}`}
          className="flex items-start gap-3 font-body text-sm text-red-800"
        >
          <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const CommunitySection = ({ items }: { items: string[] }) => {
  const { intro, listItems } = splitIntroAndItems(items);
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 sm:p-5">
      {intro && (
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-600" />
          <p className="font-body text-sm font-medium text-purple-900">
            {intro}
          </p>
        </div>
      )}
      {listItems.length > 0 && (
        <ul className="space-y-2">
          {listItems.map((item, i) => (
            <li
              key={`community-${i}`}
              className="flex items-start gap-3 font-body text-sm text-purple-800"
            >
              <CheckCircle
                size={14}
                className="text-purple-500 flex-shrink-0 mt-0.5"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ScheduleSection = ({ items }: { items: string[] }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5">
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={`schedule-${i}`}
          className="flex items-start gap-3 font-body text-sm text-blue-800"
        >
          <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ContactSection = ({ items }: { items: string[] }) => (
  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 sm:p-5">
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={`contact-${i}`}
          className="flex items-start gap-3 font-body text-sm text-cyan-800"
        >
          <Phone size={14} className="text-cyan-500 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const DefaultSection = ({
  items,
  bgColor,
}: {
  items: string[];
  bgColor: string;
}) => (
  <div className={`${bgColor} border border-gray-200 rounded-lg p-4 sm:p-5`}>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={`item-${i}`}
          className="flex items-start gap-3 font-body text-sm text-muted-foreground"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 mt-2" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ─── RENDERER MAP ───────────────────────────────────────────────────────────

const SECTION_RENDERERS: Record<
  string,
  React.ComponentType<{ items: string[]; bgColor?: string }>
> = {
  benefits: BenefitsSection,
  awards: AwardsSection,
  whyJoin: WhyJoinSection,
  rules: RulesSection,
  disqualification: DisqualificationSection,
  community: CommunitySection,
  schedule: ScheduleSection,
  contact: ContactSection,
};

const EVENT_INFO_ICONS: Record<
  "date" | "location" | "time",
  { icon: LucideIcon; label: string }
> = {
  date: { icon: Calendar, label: "Date" },
  location: { icon: MapPin, label: "Venue" },
  time: { icon: Clock, label: "Time" },
};

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────

const EventInfoCard = ({ info }: { info: ParsedEventInfo }) => {
  const { icon: Icon, label } = EVENT_INFO_ICONS[info.icon];
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-sm transition">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neon-lime/10 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-neon-lime" />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="font-body text-sm font-medium text-foreground">
          {info.text}
        </p>
      </div>
    </div>
  );
};

const CategoryCard = ({ category }: { category: ParsedCategory }) => (
  <div className="relative flex items-center justify-between border border-border rounded-xl p-4 hover:border-neon-lime hover:shadow-md transition group overflow-hidden">
    <div className="absolute top-0 right-0 w-20 h-20 bg-neon-lime/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
    <div className="relative">
      <span className="font-body text-sm sm:text-base font-medium text-foreground">
        {category.name}
      </span>
      {category.distance && (
        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {category.distance}
        </span>
      )}
    </div>
    <span className="relative font-display text-lg sm:text-xl text-neon-lime">
      {category.price}
    </span>
  </div>
);

const SectionBlock = ({
  section,
  isCollapsed,
  onToggle,
}: {
  section: ParsedSection;
  isCollapsed: boolean;
  onToggle: () => void;
}) => {
  const Icon = section.icon;
  const Renderer = SECTION_RENDERERS[section.configId];

  return (
    <div className="group">
      <div
        className={`flex items-center justify-between mb-4 ${
          section.collapsible ? "cursor-pointer select-none" : ""
        }`}
        onClick={section.collapsible ? onToggle : undefined}
        role={section.collapsible ? "button" : undefined}
        tabIndex={section.collapsible ? 0 : undefined}
        onKeyDown={(e) => {
          if (section.collapsible && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${section.bgColor}`}>
            <Icon size={20} className={section.iconColor} />
          </div>
          <h3 className="font-display text-xl sm:text-2xl tracking-wide">
            {section.title}
          </h3>
        </div>
        {section.collapsible && (
          <button
            className="p-1 rounded-full hover:bg-gray-100 transition"
            aria-label={isCollapsed ? "Expand section" : "Collapse section"}
            aria-expanded={!isCollapsed}
            tabIndex={-1}
          >
            {isCollapsed ? (
              <ChevronDown size={20} className="text-muted-foreground" />
            ) : (
              <ChevronUp size={20} className="text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        }`}
      >
        {Renderer ? (
          <Renderer items={section.items} />
        ) : (
          <DefaultSection items={section.items} bgColor={section.bgColor} />
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={`space-y-4 ${className ?? ""}`}>
    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
    <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
  </div>
);

const EmptyState = () => (
  <div className="text-center py-8">
    <Info size={40} className="mx-auto text-gray-300 mb-3" />
    <p className="text-muted-foreground text-sm">
      No description available for this event.
    </p>
  </div>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

const EventDescription = ({
  description,
  className = "",
}: EventDescriptionProps) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const parsedData = useMemo(() => {
    if (!isClient) return getEmptyParsedData();
    return parseDescription(description);
  }, [description, isClient]);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  if (!isClient) return <LoadingSkeleton className={className} />;

  const hasContent =
    parsedData.intro.length > 0 ||
    parsedData.sections.length > 0 ||
    parsedData.categories.length > 0 ||
    parsedData.eventInfo.length > 0;

  return (
    <div className={`space-y-8 sm:space-y-10 ${className}`}>
      {parsedData.intro.length > 0 && (
        <div className="space-y-4">
          {parsedData.intro.map((text, i) => (
            <p
              key={`intro-${i}`}
              className="font-body text-sm sm:text-base leading-relaxed text-muted-foreground first:text-foreground first:font-medium"
            >
              {text}
            </p>
          ))}
        </div>
      )}

      {parsedData.eventInfo.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {parsedData.eventInfo.map((info) => (
            <EventInfoCard key={info.id} info={info} />
          ))}
        </div>
      )}

      {parsedData.categories.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-event-gold/10">
              <Ticket size={20} className="text-event-gold" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl tracking-wide">
              RACE CATEGORIES
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parsedData.categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      )}

      {parsedData.sections.map((section) => (
        <SectionBlock
          key={section.id}
          section={section}
          isCollapsed={collapsedSections.has(section.id)}
          onToggle={() => toggleSection(section.id)}
        />
      ))}

      {parsedData.other.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Additional Info
            </span>
          </div>
          <div className="space-y-2">
            {parsedData.other.map((text, i) => (
              <p
                key={`other-${i}`}
                className="font-body text-sm text-muted-foreground leading-relaxed"
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      )}

      {!hasContent && <EmptyState />}
    </div>
  );
};

export default EventDescription;
