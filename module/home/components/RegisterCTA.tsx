// components/sections/RegisterCTA.tsx
import { ArrowRight, Clock, MapPin, Trophy, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const RegisterCTA = () => {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-gray-900/95 to-gray-800/95 py-20 md:py-28">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Glowing neon border */}
        <div className="absolute inset-0 border-2 border-neon-lime/20 animate-pulse" />

        {/* Diagonal stripe pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="stripe"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M-1,1 l1,-1 M0,25 l25,-25 M75,25 l25,-25 M0,75 l25,25 M75,75 l25,25"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#stripe)" />
          </svg>
        </div>

        {/* Animated motion lines */}
        <svg
          className="absolute top-20 left-20 w-32 h-24 opacity-20 md:w-48 md:h-36"
          viewBox="0 0 200 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M10 80 Q60 20 120 50 T190 30" />
          <path d="M10 90 Q70 40 130 60 T190 45" />
          <path d="M10 70 Q50 10 110 40 T190 15" />
        </svg>

        {/* Scattered dots */}
        <div className="absolute top-16 left-1/4 w-3 h-3 rounded-full bg-neon-lime/20" />
        <div className="absolute top-24 left-[38%] w-2 h-2 rounded-full bg-white/10" />
        <div className="absolute bottom-20 right-1/3 w-3 h-3 rounded-full bg-neon-lime/15" />
        <div className="absolute top-1/3 right-[15%] w-2 h-2 rounded-full bg-white/10" />

        {/* Glowing neon circle */}
        <div className="absolute -bottom-12 -right-12 w-[300px] h-[300px] bg-neon-lime/10 rounded-full blur-4xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center ">
          {/* Title */}
          <h2 className="mb-6 text-3xl sm:text-4xl md:text-6xl font-black tracking-wide text-white uppercase leading-tight">
            Your Finish Line
            <br />
            <span className="text-neon-lime">Starts Here</span>
          </h2>

          {/* Description */}
          <p className="mx-auto mb-8 max-w-3xl text-lg sm:text-xl text-white/80">
            Don't wait. Spots are limited. Secure your place in the most epic
            running event of the year.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-3 rounded-lg px-8 py-4.5 text-lg font-black uppercase tracking-wider text-white bg-neon-lime border border-transparent hover:bg-neon-lime/90 transition-all duration-300"
            >
              <span className="relative">
                Register Now
                {/* <span className="absolute -bottom-0.5 -right-2 w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
                  <ArrowRight size={16} />
                </span> */}
              </span>
            </Link>

            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/30 bg-white/5 px-6 py-4 text-base font-black uppercase tracking-wider text-white hover:bg-white/10 transition-all"
            >
              <span className="relative">
                View Events
                {/* <span className="absolute -bottom-0.5 -right-2 w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
                  <ArrowRight size={14} />
                </span> */}
              </span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-4 text-white/70">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-neon-lime" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  5,000+
                </span>
              </div>
              <span className="text-xs text-white/30">Members</span>
            </div>

            <div className="flex items-center gap-4 text-white/70">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-neon-lime" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  120+
                </span>
              </div>
              <span className="text-xs text-white/30">Events</span>
            </div>

            <div className="flex items-center gap-4 text-white/70">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-neon-lime" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  15+
                </span>
              </div>
              <span className="text-xs text-white/30">Cities</span>
            </div>
          </div>

          {/* Bottom Info */}
          <p className="mt-8 text-sm text-white/60">
            • Limited slots available
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegisterCTA;
