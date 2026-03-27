"use client";

import { motion } from "framer-motion";

interface CountdownProps {
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export default function CountdownPro({ countdown }: CountdownProps) {
  const units = [
    { value: countdown.days, label: "Days" },
    { value: countdown.hours, label: "Hours" },
    { value: countdown.minutes, label: "Mins" },
    { value: countdown.seconds, label: "Secs" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="
        absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2
        z-20 w-full px-4
        flex justify-center
      "
    >
      <div
        className="
          flex gap-2 md:gap-4
          rounded-2xl
          bg-black/25
          backdrop-blur-xl
          border border-white/10
          px-3 py-3 md:px-5 md:py-4
          shadow-[0_20px_80px_rgba(0,0,0,0.55)]
        "
      >
        {units.map((u) => (
          <div
            key={u.label}
            className="
              min-w-[72px] md:min-w-[110px]
              rounded-xl
              bg-white/5
              border border-white/10
              px-4 py-3 md:px-6 md:py-4
              text-center
            "
          >
            <div
              className="
                text-2xl md:text-4xl
                font-black
                tracking-tight
                text-lime-300
                drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)]
              "
            >
              {String(u.value).padStart(2, "0")}
            </div>
            <div
              className="
                mt-1
                text-[10px] md:text-xs
                font-bold
                uppercase tracking-[0.22em]
                text-white/60
              "
            >
              {u.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
