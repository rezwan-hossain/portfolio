// module/event/components/EventDescription.tsx
import { Ticket, Info } from "lucide-react";
import { parseDescription } from "./event-description/parser";
import type { ParsedSection } from "./event-description/types";
import {
  EventInfoCard,
  CategoryCard,
  SectionContent,
  getIcon,
} from "./event-description/renderers";
import { CollapsibleSection } from "./CollapsibleSection";

type EventDescriptionProps = {
  description: string;
  className?: string;
};

// ─── STATIC SECTION (non-collapsible) ───────────────────────────────────────

function StaticSection({ section }: { section: ParsedSection }) {
  const Icon = getIcon(section.iconName);

  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-1.5 rounded-lg ${section.bgColor}`}>
          <Icon size={20} className={section.iconColor} />
        </div>
        <h3 className="font-display text-xl sm:text-2xl tracking-wide">
          {section.title}
        </h3>
      </div>
      <SectionContent section={section} />
    </div>
  );
}

// ─── EMPTY STATE ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-8">
      <Info size={40} className="mx-auto text-gray-300 mb-3" />
      <p className="text-muted-foreground text-sm">
        No description available for this event.
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function EventDescription3({
  description,
  className = "",
}: EventDescriptionProps) {
  // Parse on server
  const parsedData = parseDescription(description);

  const hasContent =
    parsedData.intro.length > 0 ||
    parsedData.sections.length > 0 ||
    parsedData.categories.length > 0 ||
    parsedData.eventInfo.length > 0;

  return (
    <div className={`space-y-8 sm:space-y-10 ${className}`}>
      {/* Intro paragraphs */}
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

      {/* Event Info Cards */}
      {parsedData.eventInfo.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {parsedData.eventInfo.map((info) => (
            <EventInfoCard key={info.id} info={info} />
          ))}
        </div>
      )}

      {/* Race Categories */}
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

      {/* Sections */}
      {parsedData.sections.map((section) =>
        section.collapsible ? (
          <CollapsibleSection key={section.id} section={section} />
        ) : (
          <StaticSection key={section.id} section={section} />
        ),
      )}

      {/* Other/Additional Info */}
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

      {/* Empty State */}
      {!hasContent && <EmptyState />}
    </div>
  );
}
