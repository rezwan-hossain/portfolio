"use client";

import { useState, useEffect } from "react";

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
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  if (isExpired) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-8 flex items-center justify-center">
        <span className="text-white text-xl font-bold tracking-widest">
          EVENT HAS STARTED
        </span>
      </div>
    );
  }

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.mins },
    { label: "SECS", value: timeLeft.secs },
  ];

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6 w-full ">
      {/* Header */}
      <div className="text-center border-b border-white/10 pb-6 mb-6 py-2">
        <h3 className="text-white text-lg sm:text-2xl font-bold tracking-widest">
          EVENT BEGINS IN
        </h3>
      </div>

      {/* Countdown Grid */}
      <div className="grid grid-cols-4 gap-3">
        {units.map(({ label, value }) => (
          <div
            key={label}
            className="bg-[#2a2a2a] rounded-xl py-4 px-2 flex flex-col items-center justify-center"
          >
            <span className="text-neon-lime text-3xl sm:text-4xl font-extrabold leading-none tabular-nums">
              {pad(value)}
            </span>
            <p className="text-[#aaaaaa] text-[10px] sm:text-xs tracking-widest mt-2 font-medium">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Urgency Message */}
      {timeLeft.days < 7 && timeLeft.days > 0 && (
        <p className="text-center text-sm text-[#f5a623] mt-4 font-medium">
          Only {timeLeft.days} day{timeLeft.days > 1 ? "s" : ""} left!
        </p>
      )}
    </div>
  );
};

export default CountdownTimer;
