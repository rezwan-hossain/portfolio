// module/home/components/HeroSection.tsx
"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Countdown from "./Countdown";
import { useCountdown } from "@/hooks/useCountdown";
import Link from "next/link";
import { HeroSectionData } from "@/types/homepage";

type Props = {
  hero?: HeroSectionData | null;
};

const FALLBACK = {
  desktopImage:
    "https://i.ibb.co.com/60qs3s0k/gemini-3-1-flash-image-preview-nano-banana-2-a-make-this-image-in-t.png",
  eventDate: new Date("2026-10-15T06:00:00"),
};

const HeroSection = ({ hero }: Props) => {
  const targetDate = hero?.eventDate
    ? new Date(hero.eventDate)
    : FALLBACK.eventDate;
  const countdown = useCountdown(targetDate);

  const desktopImage = hero?.desktopImage || FALLBACK.desktopImage;
  const mobileImage = hero?.mobileImage;
  const showCountdown = hero?.showCountdown ?? true;
  const showSlugButton = hero?.showSlugButton ?? true;
  const slug = hero?.slug || "/register";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ─── Background Images ─── */}
      {mobileImage ? (
        <>
          <div
            className="block md:hidden absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${mobileImage}")` }}
          />
          <div
            className="hidden md:block absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${desktopImage}")` }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${desktopImage}")` }}
        />
      )}

      <div className="absolute inset-0 bg-hero-gradient" />

      {/* ─── CTA Button ─── */}
      {showSlugButton && (
        <div className="absolute bottom-40 left-1/2 z-20 flex w-full -translate-x-1/2 justify-center px-4 sm:bottom-50">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            <Link
              href={slug}
              className="group flex items-center gap-3 rounded-lg bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-black transition-all duration-300 hover:bg-white/90 active:scale-95 sm:px-14 sm:py-5 sm:text-base"
            >
              <span>Register Now</span>
              <ArrowRight
                size={18}
                strokeWidth={2.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>
      )}

      {/* ─── Countdown ─── */}
      {showCountdown && countdown && <Countdown countdown={countdown} />}
    </section>
  );
};

export default HeroSection;
