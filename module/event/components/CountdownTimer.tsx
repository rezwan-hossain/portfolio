"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  mins: number;
  secs: number;
}

type CountdownTimerProps = {
  targetDate: Date;
};

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    function calculateTimeLeft(): TimeLeft {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, mins: 0, secs: 0 };
      }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      };
    }

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-center gap-2 text-green-600">
          <Clock size={20} />
          <span className="font-display text-lg sm:text-xl tracking-wide">
            EVENT HAS STARTED
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className=" border border-gray-200 rounded-lg bg-neon-lime p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5 border-b border-white/10 pb-3 sm:pb-4">
        <h3 className="font-display text-white text-lg sm:text-xl lg:text-2xl tracking-widest">
          EVENT BEGINS IN
        </h3>
      </div>

      {/* Countdown Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* Days */}
        <div className=" flex flex-col items-center justify-center  border border-gray-800 rounded-lg p-2 sm:p-3 lg:p-4">
          <span className="font-display text-black text-xl sm:text-2xl lg:text-3xl leading-none tabular-nums">
            {String(timeLeft.days).padStart(2, "0")}
          </span>
          <p className="text-muted-foreground text-[8px] sm:text-[10px] lg:text-xs tracking-widest mt-1">
            DAYS
          </p>
        </div>

        {/* Hours */}
        <div className="flex flex-col items-center justify-center  border border-gray-800 rounded-lg p-2 sm:p-3 lg:p-4">
          <span className="font-display text-black text-xl sm:text-2xl lg:text-3xl leading-none tabular-nums">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <p className="text-muted-foreground text-[8px] sm:text-[10px] lg:text-xs tracking-widest mt-1">
            HOURS
          </p>
        </div>

        {/* Minutes */}
        <div className="flex flex-col items-center justify-center  border border-gray-800 rounded-lg p-2 sm:p-3 lg:p-4">
          <span className="font-display text-black text-xl sm:text-2xl lg:text-3xl leading-none tabular-nums">
            {String(timeLeft.mins).padStart(2, "0")}
          </span>
          <p className="text-muted-foreground text-[8px] sm:text-[10px] lg:text-xs tracking-widest mt-1">
            MINS
          </p>
        </div>

        {/* Seconds */}
        <div className="flex flex-col items-center justify-center border border-gray-800  rounded-lg p-2 sm:p-3 lg:p-4">
          <span className="font-display text-black text-xl sm:text-2xl lg:text-3xl leading-none tabular-nums">
            {String(timeLeft.secs).padStart(2, "0")}
          </span>
          <p className="text-black/80 text-[8px] sm:text-[10px] lg:text-xs tracking-widest mt-1">
            SECS
          </p>
        </div>
      </div>

      {/* Urgency Message (Optional) */}
      {timeLeft.days < 7 && timeLeft.days > 0 && (
        <p className="text-center text-xs sm:text-sm text-orange-600 mt-3 sm:mt-4 font-medium">
          🔥 Only {timeLeft.days} day{timeLeft.days > 1 ? "s" : ""} left!
        </p>
      )}
    </div>
  );
};

export default CountdownTimer;
