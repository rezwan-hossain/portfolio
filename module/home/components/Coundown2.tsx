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

const Countdown2 = ({ countdown }: CountdownProps) => {
  const timeUnits = [
    { value: countdown.days, label: "D" },
    { value: countdown.hours, label: "H" },
    { value: countdown.minutes, label: "M" },
    { value: countdown.seconds, label: "S" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
    >
      <div className="flex items-center bg-[#BFFF00] rounded-full px-6 py-4 md:px-8 md:py-5 border-4 border-gray-900 shadow-[6px_6px_0px_0px_#1a1a1a]">
        {timeUnits.map((item, index) => (
          <div key={item.label} className="flex items-center">
            <div className="text-center px-3 md:px-5">
              <span className="text-2xl md:text-4xl font-black text-gray-900 tabular-nums">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-sm md:text-lg font-black text-gray-900/50 ml-0.5">
                {item.label}
              </span>
            </div>

            {index < timeUnits.length - 1 && (
              <div className="w-1 h-8 md:h-10 bg-gray-900 rounded-full" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Countdown2;
