// components/sections/CTASection.tsx
import { Facebook, ArrowRight, Users, Trophy, MapPin } from "lucide-react";

const stats = [
  { icon: Users, value: "5,000+", label: "Members" },
  { icon: Trophy, value: "120+", label: "Events" },
  { icon: MapPin, value: "15+", label: "Cities" },
];

const CTASection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-gray-900 text-white">
      {/* ─── Background Elements ─── */}

      {/* Running track curves */}
      <svg
        className="absolute -top-24 -left-24 w-80 h-80 opacity-[0.04] md:w-[500px] md:h-[500px]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle
          cx="200"
          cy="200"
          r="180"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray="30 20"
        />
        <circle
          cx="200"
          cy="200"
          r="140"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="20 15"
        />
        <circle
          cx="200"
          cy="200"
          r="100"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="15 10"
        />
      </svg>

      {/* Finish line pattern */}
      <svg
        className="absolute -right-8 top-1/2 -translate-y-1/2 w-28 h-56 opacity-[0.04] md:w-40 md:h-72"
        viewBox="0 0 100 200"
        fill="currentColor"
      >
        {[...Array(10)].map((_, row) =>
          [...Array(5)].map((_, col) =>
            (row + col) % 2 === 0 ? (
              <rect
                key={`${row}-${col}`}
                x={col * 20}
                y={row * 20}
                width="20"
                height="20"
              />
            ) : null,
          ),
        )}
      </svg>

      {/* Motion lines */}
      <svg
        className="absolute bottom-6 left-6 w-36 h-20 opacity-[0.06] md:w-52 md:h-28"
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

      {/* Road shape */}
      <svg
        className="absolute -top-6 right-1/4 w-44 h-44 opacity-[0.04] md:w-60 md:h-60"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M20 180 Q60 100 100 120 T180 20"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M20 180 Q60 100 100 120 T180 20"
          strokeWidth="2"
          strokeDasharray="8 8"
          className="opacity-50"
        />
      </svg>

      {/* Neon-lime accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-lime/5 rounded-full blur-3xl pointer-events-none" />

      {/* Scattered dots */}
      <div className="absolute top-12 left-1/3 w-2 h-2 rounded-full bg-neon-lime/20" />
      <div className="absolute top-20 left-[38%] w-1.5 h-1.5 rounded-full bg-white/10" />
      <div className="absolute bottom-16 right-1/3 w-2.5 h-2.5 rounded-full bg-neon-lime/15" />
      <div className="absolute top-1/3 right-[15%] w-1.5 h-1.5 rounded-full bg-white/10" />

      {/* ─── Content ─── */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-6 py-16 md:py-24 lg:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-neon-lime animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                Growing Community
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-wide uppercase leading-tight">
              Join Our
              <br />
              <span className="text-neon-lime">Community</span>
            </h2>

            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-white/70 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Connect with fellow runners, share experiences, and stay updated
              with the latest marathon events across Bangladesh.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-neon-lime text-gray-900 font-bold uppercase tracking-wider text-sm rounded-lg px-7 py-4 hover:opacity-90 hover:-translate-y-0.5 transition-all"
              >
                <Facebook className="w-5 h-5" />
                <span>Join on Facebook</span>
                <div className="w-7 h-7 rounded-md bg-gray-900/15 flex items-center justify-center">
                  <ArrowRight size={14} />
                </div>
              </a>

              <a
                href="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/20 text-white font-bold uppercase tracking-wider text-sm rounded-lg px-7 py-4 hover:bg-white/10 transition-all"
              >
                Browse Events
              </a>
            </div>
          </div>

          {/* Right: Stats Cards */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`relative group rounded-xl p-4 sm:p-5 lg:p-6 text-center lg:text-left transition-all hover:-translate-y-0.5 ${
                    i === 0
                      ? "bg-neon-lime text-gray-900"
                      : "bg-white/[0.07] backdrop-blur-sm border border-white/10 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-2 sm:mb-3 ${
                      i === 0 ? "bg-gray-900/15" : "bg-white/10"
                    }`}
                  >
                    <stat.icon
                      className={`w-5 h-5 ${
                        i === 0 ? "text-gray-900" : "text-neon-lime"
                      }`}
                    />
                  </div>
                  <p
                    className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${
                      i === 0 ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p
                    className={`text-xs font-bold uppercase tracking-widest mt-0.5 ${
                      i === 0 ? "text-gray-900/60" : "text-white/50"
                    }`}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-white/40">
              Trusted by runners from{" "}
              <span className="text-white/60 font-semibold">15+ cities</span>{" "}
              across Bangladesh
            </p>
            <div className="flex items-center gap-2">
              {/* Avatars stack */}
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-900 bg-white/20 flex items-center justify-center"
                  >
                    <span className="text-[10px] font-bold text-white/60">
                      {String.fromCharCode(64 + i)}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-xs text-white/40 ml-1">+5,000 members</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
