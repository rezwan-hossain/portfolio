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
      className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center px-3 sm:px-4"
    >
      {/* Mobile: Compact Grid | Tablet+: Horizontal Row */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 w-full max-w-[320px] sm:max-w-none sm:w-auto">
        {timeUnits.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            className="group relative"
          >
            <div
              className="
                bg-transparent 
                border border-gray-400/20 sm:border-2 sm:border-gray-400/30
                hover:border-gray-400/50 
                transition-all duration-300 
                rounded-lg sm:rounded-xl lg:rounded-2xl 
                px-2 py-3
                sm:px-4 sm:py-4
                md:px-5 md:py-4
                lg:px-6 lg:py-5
                text-center 
                min-w-0 sm:min-w-[70px] md:min-w-[85px] lg:min-w-[100px]
              "
            >
              {/* Number */}
              <div
                className="
                  text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                  font-bold 
                  tracking-tight 
                  text-gray-700 
                  leading-none 
                  mb-1 sm:mb-1.5
                  
                "
              >
                {String(item.value).padStart(2, "0")}
              </div>

              {/* Label */}
              <div
                className="
                  text-[8px] sm:text-[10px] md:text-xs
                  uppercase 
                  tracking-wider sm:tracking-widest 
                  text-gray-700/60 sm:text-gray-700/70 
                  font-medium sm:font-semibold
                "
              >
                {item.label}
              </div>
            </div>

            {/* Subtle glow effect on hover - hidden on mobile */}
            <div className="hidden sm:block absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Countdown;
