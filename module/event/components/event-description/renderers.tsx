// module/event/components/event-description/renderers.tsx
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
  Info,
  Zap,
  Medal,
  Shield,
  Sparkles,
  Phone,
  type LucideIcon,
} from "lucide-react";
import type { ParsedEventInfo, ParsedCategory, ParsedSection } from "./types";

// ─── ICON MAP ───────────────────────────────────────────────────────────────

export const ICON_MAP: Record<string, LucideIcon> = {
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
  Info,
  Zap,
  Medal,
  Shield,
  Sparkles,
  Phone,
};

export const getIcon = (iconName: string): LucideIcon => {
  return ICON_MAP[iconName] || Info;
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

const splitIntroAndItems = (
  items: string[],
): { intro: string | null; listItems: string[] } => {
  if (items.length > 1 && items[0].endsWith(":")) {
    return { intro: items[0], listItems: items.slice(1) };
  }
  return { intro: null, listItems: items };
};

// ─── EVENT INFO ─────────────────────────────────────────────────────────────

const EVENT_INFO_ICONS: Record<
  "date" | "location" | "time",
  { icon: LucideIcon; label: string }
> = {
  date: { icon: Calendar, label: "Date" },
  location: { icon: MapPin, label: "Venue" },
  time: { icon: Clock, label: "Time" },
};

export const EventInfoCard = ({ info }: { info: ParsedEventInfo }) => {
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

// ─── CATEGORY CARD ──────────────────────────────────────────────────────────

export const CategoryCard = ({ category }: { category: ParsedCategory }) => (
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

// ─── SECTION RENDERERS ──────────────────────────────────────────────────────

export const BenefitsRenderer = ({ items }: { items: string[] }) => (
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

export const AwardsRenderer = ({ items }: { items: string[] }) => {
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

export const WhyJoinRenderer = ({ items }: { items: string[] }) => (
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

export const RulesRenderer = ({ items }: { items: string[] }) => (
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

export const DisqualificationRenderer = ({ items }: { items: string[] }) => (
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

export const CommunityRenderer = ({ items }: { items: string[] }) => {
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

export const ScheduleRenderer = ({ items }: { items: string[] }) => (
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

export const ContactRenderer = ({ items }: { items: string[] }) => (
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

export const DefaultRenderer = ({
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

export const SECTION_RENDERERS: Record<
  string,
  React.FC<{ items: string[]; bgColor?: string }>
> = {
  benefits: BenefitsRenderer,
  awards: AwardsRenderer,
  whyJoin: WhyJoinRenderer,
  rules: RulesRenderer,
  disqualification: DisqualificationRenderer,
  community: CommunityRenderer,
  schedule: ScheduleRenderer,
  contact: ContactRenderer,
};

// ─── SECTION CONTENT (for use in both static and collapsible) ───────────────

export const SectionContent = ({ section }: { section: ParsedSection }) => {
  const Renderer = SECTION_RENDERERS[section.configId];

  if (Renderer) {
    return <Renderer items={section.items} />;
  }

  return <DefaultRenderer items={section.items} bgColor={section.bgColor} />;
};
