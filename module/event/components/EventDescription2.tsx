"use client";

import { useMemo } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Gift,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Ticket,
  Heart,
} from "lucide-react";

type EventDescriptionProps = {
  description: string;
};

const EventDescription2 = ({ description }: EventDescriptionProps) => {
  // Parse the HTML and extract sections
  const sections = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(description, "text/html");
    const paragraphs = Array.from(doc.querySelectorAll("p"));

    const result: {
      intro: string[];
      eventInfo: { icon: string; text: string }[];
      categories: { name: string; price: string }[];
      benefits: string[];
      awards: string[];
      whyJoin: string[];
      rules: string[];
      disqualification: string[];
      community: string[];
      other: string[];
    } = {
      intro: [],
      eventInfo: [],
      categories: [],
      benefits: [],
      awards: [],
      whyJoin: [],
      rules: [],
      disqualification: [],
      community: [],
      other: [],
    };

    let currentSection = "intro";

    paragraphs.forEach((p) => {
      const text = p.textContent?.trim() || "";
      if (!text) return;

      // Detect section headers
      if (
        text.includes("Race Categories") ||
        text.includes("Registration Fees")
      ) {
        currentSection = "categories";
        return;
      }
      if (
        text.includes("What You'll Get") ||
        text.includes("What You'll Get")
      ) {
        currentSection = "benefits";
        return;
      }
      if (text.includes("Awards") || text.includes("Recognition")) {
        currentSection = "awards";
        return;
      }
      if (text.includes("Why Join")) {
        currentSection = "whyJoin";
        return;
      }
      if (
        text.includes("Rules & Regulations") ||
        text.includes("Rules &amp; Regulations")
      ) {
        currentSection = "rules";
        return;
      }
      if (text.includes("Disqualification")) {
        currentSection = "disqualification";
        return;
      }
      if (text.includes("Community Partner")) {
        currentSection = "community";
        return;
      }
      if (text.includes("And many more")) {
        currentSection = "other";
        return;
      }

      // Parse event info (date, venue, time)
      if (
        text.startsWith("📅") ||
        text.startsWith("📍") ||
        text.startsWith("⏰")
      ) {
        const icon = text.startsWith("📅")
          ? "date"
          : text.startsWith("📍")
            ? "location"
            : "time";
        result.eventInfo.push({ icon, text: text.replace(/^[📅📍⏰]\s*/, "") });
        return;
      }

      // Parse categories (starts with *)
      if (text.startsWith("*") && currentSection === "categories") {
        const match = text.match(/\*\s*(.+?)\s*[–-]\s*(BDT\s*[\d,]+)/i);
        if (match) {
          result.categories.push({
            name: match[1].trim(),
            price: match[2].trim(),
          });
        }
        return;
      }

      // Parse benefits (starts with ✔)
      if (text.startsWith("✔") && currentSection === "benefits") {
        result.benefits.push(text.replace(/^✔\s*/, ""));
        return;
      }

      // Parse awards (starts with 🥇 🌟 🏅)
      if (
        (text.startsWith("🥇") ||
          text.startsWith("🌟") ||
          text.startsWith("🏅")) &&
        currentSection === "awards"
      ) {
        result.awards.push(text);
        return;
      }

      // Parse why join (starts with emoji or bullet)
      if (currentSection === "whyJoin" && text.length > 0) {
        result.whyJoin.push(text.replace(/^[✨🌟]\s*/, ""));
        return;
      }

      // Parse rules (starts with *)
      if (text.startsWith("*") && currentSection === "rules") {
        result.rules.push(text.replace(/^\*\s*/, ""));
        return;
      }

      // Parse disqualification (starts with 🔴)
      if (text.startsWith("🔴") && currentSection === "disqualification") {
        result.disqualification.push(text.replace(/^🔴\s*/, ""));
        return;
      }

      // Parse community benefits (starts with ✔)
      if (text.startsWith("✔") && currentSection === "community") {
        result.community.push(text.replace(/^✔\s*/, ""));
        return;
      }

      // Intro paragraphs
      if (currentSection === "intro") {
        result.intro.push(text);
      } else {
        result.other.push(text);
      }
    });

    return result;
  }, [description]);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Introduction */}
      {sections.intro.length > 0 && (
        <div className="space-y-4">
          {sections.intro.map((text, i) => (
            <p
              key={i}
              className="font-body text-sm sm:text-base leading-relaxed text-muted-foreground"
            >
              {text}
            </p>
          ))}
        </div>
      )}

      {/* Event Quick Info */}
      {sections.eventInfo.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {sections.eventInfo.map((info, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 sm:p-4"
            >
              <div className="w-10 h-10 rounded-lg bg-neon-lime/10 flex items-center justify-center flex-shrink-0">
                {info.icon === "date" && (
                  <Calendar size={18} className="text-neon-lime" />
                )}
                {info.icon === "location" && (
                  <MapPin size={18} className="text-neon-lime" />
                )}
                {info.icon === "time" && (
                  <Clock size={18} className="text-neon-lime" />
                )}
              </div>
              <p className="font-body text-sm font-medium text-foreground">
                {info.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Race Categories */}
      {sections.categories.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Ticket size={20} className="text-event-gold" />
            <h3 className="font-display text-xl sm:text-2xl tracking-wide">
              RACE CATEGORIES
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sections.categories.map((cat, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-border rounded-lg p-4 hover:border-neon-lime transition"
              >
                <span className="font-body text-sm sm:text-base font-medium text-foreground">
                  {cat.name}
                </span>
                <span className="font-display text-lg sm:text-xl text-neon-lime">
                  {cat.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What You'll Get */}
      {sections.benefits.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Gift size={20} className="text-event-gold" />
            <h3 className="font-display text-xl sm:text-2xl tracking-wide">
              WHAT YOU'LL GET
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {sections.benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-green-50 rounded-lg p-3 sm:p-4"
              >
                <CheckCircle
                  size={18}
                  className="text-green-600 flex-shrink-0 mt-0.5"
                />
                <p className="font-body text-sm text-foreground leading-relaxed">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Awards & Recognition */}
      {sections.awards.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-event-gold" />
            <h3 className="font-display text-xl sm:text-2xl tracking-wide">
              AWARDS & RECOGNITION
            </h3>
          </div>
          <div className="space-y-3">
            {sections.awards.map((award, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-amber-50 rounded-lg p-3 sm:p-4"
              >
                <Star
                  size={18}
                  className="text-amber-500 flex-shrink-0 mt-0.5"
                />
                <p className="font-body text-sm text-foreground leading-relaxed">
                  {award.replace(/^[🥇🌟🏅]\s*/, "")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why Join */}
      {sections.whyJoin.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart size={20} className="text-event-gold" />
            <h3 className="font-display text-xl sm:text-2xl tracking-wide">
              WHY JOIN?
            </h3>
          </div>
          <div className="space-y-2">
            {sections.whyJoin.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2 sm:p-3">
                <div className="w-2 h-2 rounded-full bg-neon-lime flex-shrink-0 mt-2" />
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules & Regulations */}
      {sections.rules.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-event-gold" />
            <h3 className="font-display text-xl sm:text-2xl tracking-wide">
              RULES & REGULATIONS
            </h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
            <ul className="space-y-2">
              {sections.rules.map((rule, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 font-body text-sm text-muted-foreground"
                >
                  <span className="text-gray-400">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Disqualification Rules */}
      {sections.disqualification.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={20} className="text-red-500" />
            <h3 className="font-display text-xl sm:text-2xl tracking-wide text-red-600">
              DISQUALIFICATION RULES
            </h3>
          </div>
          <div className="bg-red-50 rounded-lg p-4 sm:p-5">
            <ul className="space-y-2">
              {sections.disqualification.map((rule, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 font-body text-sm text-red-700"
                >
                  <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Community Partner */}
      {sections.community.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-event-gold" />
            <h3 className="font-display text-xl sm:text-2xl tracking-wide">
              COMMUNITY PARTNER
            </h3>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-5">
            <p className="font-body text-sm text-purple-800 mb-3">
              Running groups with 15+ runners will receive:
            </p>
            <ul className="space-y-2">
              {sections.community.map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 font-body text-sm text-purple-700"
                >
                  <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Other content */}
      {sections.other.length > 0 && (
        <div className="space-y-3">
          {sections.other.map((text, i) => (
            <p
              key={i}
              className="font-body text-sm text-muted-foreground leading-relaxed"
            >
              {text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventDescription2;
