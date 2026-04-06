// module/event/components/CollapsibleSection.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ParsedSection } from "./event-description/types";
import { getIcon, SectionContent } from "./event-description/renderers";

type CollapsibleSectionProps = {
  section: ParsedSection;
  defaultCollapsed?: boolean;
};

export function CollapsibleSection({
  section,
  defaultCollapsed = false,
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const Icon = getIcon(section.iconName);

  const toggle = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="group">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer select-none"
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
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
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        }`}
      >
        <SectionContent section={section} />
      </div>
    </div>
  );
}
