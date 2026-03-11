"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  mins: number;
  secs: number;
}

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      mins: Math.floor((diff / (1000 * 60)) % 60),
      secs: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.mins },
    { label: "SECS", value: timeLeft.secs },
  ];

  return (
    <div className="bg-neon-lime rounded-lg p-6 lg:p-8">
      <h3 className="font-display text-white text-center text-xl lg:text-2xl tracking-widest mb-5 border-b border-white/10 pb-4">
        EVENT BEGINS IN
      </h3>
      <div className="flex gap-3 justify-center">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex flex-col items-center justify-center border border-event-gold rounded-md px-4 py-3 lg:px-6 lg:py-4 min-w-[72px]"
          >
            <span className="font-display text-event-dark-foreground text-3xl lg:text-4xl leading-none tabular-nums w-[3ch] text-center">
              {String(u.value).padStart(2, "0")}
            </span>
            <p className="text-event-dark-foreground text-[10px] lg:text-xs tracking-widest mt-1">
              {u.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
