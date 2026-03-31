// module/team/components/TeamMemberCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Linkedin,
  Twitter,
  Github,
  Instagram,
  ArrowUpRight,
} from "lucide-react";
import type { TeamMember } from "@/types/team";

type Props = {
  member: TeamMember;
  index: number;
};

const SOCIAL_ICONS = {
  linkedin: {
    icon: Linkedin,
    label: "LinkedIn",
    hover: "hover:text-[#0A66C2]",
  },
  twitter: { icon: Twitter, label: "Twitter", hover: "hover:text-[#1DA1F2]" },
  github: { icon: Github, label: "GitHub", hover: "hover:text-[#333]" },
  instagram: {
    icon: Instagram,
    label: "Instagram",
    hover: "hover:text-[#E4405F]",
  },
} as const;

const TeamMemberCard = ({ member, index }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-500 hover:border-gray-300 hover:shadow-xl">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Gradient overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Bio text — slides up on hover */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-5 transition-all duration-500 ${
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <p className="font-body text-sm text-white/90 leading-relaxed line-clamp-3">
              {member.bio}
            </p>
          </div>

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
            <div
              className={`absolute rotate-45 bg-neon-lime w-24 h-6 -right-6 top-4 transition-all duration-500 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-lg tracking-wide text-foreground truncate">
                {member.name.toUpperCase()}
              </h3>
              <p className="font-body text-sm text-muted-foreground mt-0.5">
                {member.role}
              </p>
            </div>

            {/* Arrow indicator */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 ${
                isHovered
                  ? "bg-neon-lime text-white scale-110"
                  : "text-gray-400"
              }`}
            >
              <ArrowUpRight
                size={14}
                className={`transition-transform duration-300 ${
                  isHovered ? "rotate-0" : "-rotate-45"
                }`}
              />
            </div>
          </div>

          {/* Social Links */}
          {member.socials && Object.keys(member.socials).length > 0 && (
            <div className="flex items-center gap-1 mt-4 pt-4 border-t border-gray-100">
              {(
                Object.entries(member.socials) as [
                  keyof typeof SOCIAL_ICONS,
                  string,
                ][]
              )
                .filter(([, url]) => url)
                .map(([platform, url]) => {
                  const { icon: Icon, label, hover } = SOCIAL_ICONS[platform];
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg text-gray-400 transition-colors ${hover} hover:bg-gray-50`}
                      aria-label={`${member.name}'s ${label}`}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
