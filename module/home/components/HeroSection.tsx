"use client";

import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-marathon.jpg";
import Countdown from "./Countdown";
import { useCountdown } from "@/hooks/useCountdown";
import Link from "next/link";

const TARGET_DATE = new Date("2026-10-15T06:00:00");

const HeroSection = () => {
  const countdown = useCountdown(TARGET_DATE);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
        }}
      />
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* content */}
      {/* <div className="max-w-7xl mx-auto container relative z-10 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl p-2"
        >
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-1.5 text-primary-foreground text-sm font-medium">
              <MapPin size={14} /> Dhaka, Bangladesh
            </span>
            <span className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-1.5 text-primary-foreground text-sm font-medium">
              <Calendar size={14} /> October 15, 2026
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black uppercase leading-[0.9] text-primary-foreground mb-6">
            Run Beyond
            <br />
            <span className="text-gradient">Your Limits</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-lg mb-8 font-body">
            Join 10,000+ runners for the most electrifying marathon experience.
            Push boundaries. Break records. Create history.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <button className="text-base px-8 py-6">
              <a href="#register">
                Register Now <ArrowRight size={18} />
              </a>
            </button>
            <button className="text-base px-8 py-6">
              <a href="#about">Learn More</a>
            </button>
          </div>

          
          <div className="flex gap-3 md:gap-4">
            {[
              { value: countdown.days, label: "Days" },
              { value: countdown.hours, label: "Hours" },
              { value: countdown.minutes, label: "Mins" },
              { value: countdown.seconds, label: "Secs" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-card/10 backdrop-blur-md border border-primary-foreground/20 rounded-lg px-4 md:px-6 py-3 md:py-4 text-center min-w-[70px] md:min-w-[90px]"
              >
                <div className="text-2xl md:text-4xl font-display font-black text-primary-foreground">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-xs uppercase tracking-wider text-primary-foreground/60 font-medium">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div> */}

      {/* 
        NEW: Centered CTA Button at the very bottom of the page,
        directly on top of the Countdown component 
      */}
      <div className="absolute bottom-40 sm:bottom-50 left-1/2 -translate-x-1/2 z-20 flex w-full justify-center px-4">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-full bg-neon-lime text-white
      px-6 py-3 sm:px-10 sm:py-5
      text-sm sm:text-lg font-bold
  
      transition-all duration-300
      hover:scale-[1.03] active:scale-95
      hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
          >
            <span>Register Now</span>

            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>

      {/* Countdown - Centered at the bottom */}
      {countdown && <Countdown countdown={countdown} />}
    </section>
  );
};

export default HeroSection;
