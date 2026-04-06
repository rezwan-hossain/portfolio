// module/event/components/event-description/types.ts
import type { LucideIcon } from "lucide-react";

export type SectionConfig = {
  id: string;
  title: string;
  icon: LucideIcon;
  headerPatterns: RegExp[];
  bgColor: string;
  iconColor: string;
  collapsible?: boolean;
  autoAssignPrefixes?: string[];
};

export type ParsedEventInfo = {
  id: string;
  icon: "date" | "location" | "time";
  text: string;
};

export type ParsedCategory = {
  id: string;
  name: string;
  price: string;
  distance?: string;
};

export type ParsedSection = {
  id: string;
  configId: string;
  title: string;
  iconName: string; // Store icon name as string for serialization
  bgColor: string;
  iconColor: string;
  collapsible: boolean;
  items: string[];
};

export type ParsedData = {
  intro: string[];
  eventInfo: ParsedEventInfo[];
  categories: ParsedCategory[];
  sections: ParsedSection[];
  other: string[];
};
