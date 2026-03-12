"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

interface HeroSliderProps {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number;
  height?: string;
}

export default function HeroSlider({
  slides,
  autoPlay = true,
  interval = 6000,
  height = "h-[90vh]",
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!autoPlay || isHovered) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [current, autoPlay, isHovered]);

  return (
    <section
      className={`relative w-full ${height} overflow-hidden group bg-black`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            priority
            className="object-cover scale-105" // Slight scale for a cinematic look
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Content */}
          <div className="relative z-20 flex flex-col justify-center items-center text-center h-full px-6">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-primary-foreground/80 uppercase tracking-[0.3em] text-xs md:text-sm font-bold mb-4"
            >
              Exclusive Event
            </motion.span>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white text-4xl md:text-7xl lg:text-8xl font-black mb-6 max-w-5xl uppercase italic leading-none"
            >
              {slides[current].title}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-300 text-base md:text-xl mb-10 max-w-2xl font-light"
            >
              {slides[current].subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <a
                href={slides[current].ctaLink}
                className="group/btn relative inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold overflow-hidden transition-all hover:pr-12"
              >
                <span className="relative z-10">{slides[current].ctaText}</span>
                <ChevronRight
                  className="absolute right-4 opacity-0 group-hover/btn:opacity-100 transition-all"
                  size={20}
                />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center z-40 pointer-events-none">
        <NavButton direction="left" onClick={prevSlide} />
        <NavButton direction="right" onClick={nextSlide} />
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-40 flex gap-4 items-center">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className="group py-2"
          >
            <div
              className={`h-1 transition-all duration-300 rounded-full ${
                index === current
                  ? "w-12 bg-white"
                  : "w-4 bg-white/30 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

/* Internal Sub-component for buttons to keep main code clean */
const NavButton = ({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      pointer-events-auto
      flex items-center justify-center
      w-12 h-12 md:w-14 md:h-14 
      rounded-full border border-white/20
      bg-white/5 backdrop-blur-md 
      text-white transition-all duration-300
      hover:bg-white hover:text-black hover:scale-110
      opacity-0 group-hover:opacity-100
      ${direction === "left" ? "-translate-x-4 group-hover:translate-x-0" : "translate-x-4 group-hover:translate-x-0"}
    `}
  >
    {direction === "left" ? (
      <ChevronLeft size={24} />
    ) : (
      <ChevronRight size={24} />
    )}
  </button>
);
