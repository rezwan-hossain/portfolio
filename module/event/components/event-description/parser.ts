// module/event/components/event-description/parser.ts
import * as cheerio from "cheerio";
import type {
  ParsedData,
  ParsedSection,
  ParsedEventInfo,
  ParsedCategory,
} from "./types";
import {
  SECTION_CONFIGS,
  EVENT_INFO_EMOJIS,
  ALL_ITEM_PREFIXES,
  MAX_HEADER_LENGTH,
  SECTION_EXIT_THRESHOLD,
  type SectionConfigData,
} from "./constants";

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

const matchSectionHeader = (rawText: string): SectionConfigData | null => {
  const cleaned = cleanText(rawText);
  if (cleaned.length > MAX_HEADER_LENGTH) return null;

  // Remove trailing punctuation for matching
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

const findAutoAssignSection = (text: string): SectionConfigData | null => {
  for (const config of SECTION_CONFIGS) {
    if (
      config.autoAssignPrefixes &&
      startsWithAny(text, config.autoAssignPrefixes)
    ) {
      return config;
    }
  }
  return null;
};

const shouldSkipLine = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return /^and\s+many\s+more/i.test(cleanText(trimmed));
};

/**
 * FIX: More comprehensive list item detection
 * Checks both original text AND checks for common bullet patterns
 */
const isListLikeItem = (text: string): boolean => {
  // Check direct prefix match
  if (startsWithAny(text, ALL_ITEM_PREFIXES)) return true;

  // Check for numbered list items like "1.", "2)", etc.
  if (/^\d+[.)]\s/.test(text)) return true;

  // Check for letter list items like "a.", "b)", etc.
  if (/^[a-zA-Z][.)]\s/.test(text)) return true;

  return false;
};

/**
 * FIX: Check if a line looks like it belongs to a section (short, bullet-like)
 */
const looksLikeSectionItem = (text: string): boolean => {
  const cleaned = cleanText(text);
  // Short text (under threshold) that isn't a header is likely a section item
  if (cleaned.length < SECTION_EXIT_THRESHOLD) return true;
  // Or if it starts with a bullet prefix
  if (isListLikeItem(text)) return true;
  return false;
};

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

// ─── LINE EXTRACTION ────────────────────────────────────────────────────────

const extractLines = (html: string): string[] => {
  const $ = cheerio.load(html);
  const lines: string[] = [];

  const blockSelector = "p, h1, h2, h3, h4, h5, h6, li, blockquote";
  let elements = $(blockSelector).toArray();

  // Fallback: if no standard block elements, try leaf divs
  if (elements.length === 0) {
    elements = $("div")
      .filter((_, el) => $(el).find(`${blockSelector}, div`).length === 0)
      .toArray();
  }

  for (const el of elements) {
    const $el = $(el);
    const html = $el.html() || "";

    // Split on <br> tags
    if (/<br\s*\/?>/i.test(html)) {
      const parts = html.split(/<br\s*\/?>/gi);
      for (const part of parts) {
        const text = cheerio.load(part).text().trim();
        if (text) lines.push(text);
      }
    } else {
      // Skip elements with nested blocks (prevent duplicates)
      const hasNestedBlock = $el.find(blockSelector).length > 0;
      if (!hasNestedBlock) {
        const text = $el.text().trim();
        if (text) lines.push(text);
      }
    }
  }

  // Final fallback: split body text by newlines
  if (lines.length === 0) {
    const bodyText = $("body").text() || "";
    for (const line of bodyText.split("\n")) {
      const trimmed = line.trim();
      if (trimmed) lines.push(trimmed);
    }
  }

  return lines;
};

// ─── MAIN PARSER ────────────────────────────────────────────────────────────

export function parseDescription(description: string): ParsedData {
  if (!description) {
    return getEmptyParsedData();
  }

  const lines = extractLines(description);

  // Debug: Log extracted lines
  console.log("📝 Extracted lines:", lines.length);
  lines.forEach((line, i) =>
    console.log(`  [${i}] ${line.substring(0, 50)}...`),
  );

  if (lines.length === 0) {
    return getEmptyParsedData();
  }

  const result: ParsedData = getEmptyParsedData();
  const sectionsMap = new Map<string, ParsedSection>();
  let activeConfigId: string | null = null;
  let introComplete = false;

  const getOrCreateSection = (config: SectionConfigData): ParsedSection => {
    if (!sectionsMap.has(config.id)) {
      sectionsMap.set(config.id, {
        id: `section-${config.id}`,
        configId: config.id,
        title: config.title,
        iconName: config.iconName,
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
    // Avoid duplicates
    if (!section.items.includes(item)) {
      section.items.push(item);
      console.log(`  ✅ Added to [${configId}]: "${item.substring(0, 40)}..."`);
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawText = lines[i];

    if (!rawText) continue;
    if (shouldSkipLine(rawText)) continue;

    // ① Check for section header
    const headerMatch = matchSectionHeader(rawText);
    if (headerMatch) {
      console.log(`🏷️ Found section header: [${headerMatch.id}] "${rawText}"`);
      activeConfigId = headerMatch.id;
      getOrCreateSection(headerMatch);
      introComplete = true;
      continue;
    }

    // ② Check for event-info metadata (📅 📍 ⏰)
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

      // FIX: Improved section-exit heuristic
      // Only exit if:
      // 1. We have items AND
      // 2. This line does NOT look like a list item AND
      // 3. This line is long (looks like a new paragraph/section) AND
      // 4. The next line also doesn't look like it belongs to this section
      const current = sectionsMap.get(activeConfigId);
      const shouldExit =
        current &&
        current.items.length > 0 &&
        !isListLikeItem(rawText) &&
        cleaned.length > SECTION_EXIT_THRESHOLD &&
        // Look ahead: if next line is also not a list item, probably new section
        (i + 1 >= lines.length || !looksLikeSectionItem(lines[i + 1]));

      if (shouldExit) {
        console.log(
          `🚪 Exiting section [${activeConfigId}] due to: "${rawText.substring(0, 40)}..."`,
        );
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

      // Add item to current section
      addItem(activeConfigId, cleaned);
      continue;
    }

    // ④ Auto-assign by prefix (when not in a section)
    const autoSection = findAutoAssignSection(rawText);
    if (autoSection) {
      const cleaned = cleanText(rawText);
      if (cleaned) {
        console.log(
          `🔄 Auto-assigning to [${autoSection.id}]: "${rawText.substring(0, 40)}..."`,
        );
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

  // Build final sections array (exclude categories - they have their own UI)
  result.sections = Array.from(sectionsMap.values()).filter(
    (s) => s.items.length > 0 && s.configId !== "categories",
  );

  // Debug: Log final sections
  console.log("📊 Final sections:");
  result.sections.forEach((s) => {
    console.log(`  [${s.configId}]: ${s.items.length} items`);
  });

  return result;
}
