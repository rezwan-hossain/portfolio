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

const Countdown = ({ countdown }: CountdownProps) => {
  const timeUnits = [
    { value: countdown.days, label: "Days" },
    { value: countdown.hours, label: "Hours" },
    { value: countdown.minutes, label: "Mins" },
    { value: countdown.seconds, label: "Secs" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center px-4"
    >
      <div className="flex gap-2 md:gap-4">
        {timeUnits.map((item) => (
          <div
            key={item.label}
            className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl px-4 md:px-6 py-3 md:py-4 text-center min-w-[70px] md:min-w-[100px] shadow-2xl"
          >
            <div className="text-2xl md:text-4xl font-display font-black text-neon-lime">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/60 font-bold">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Countdown;
