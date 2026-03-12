"use client";

import { useState, useEffect, useMemo } from "react";

// 1. Define constants for better readability
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export const useCountdown = (targetDate: Date) => {
  // Memoize the target time to prevent unnecessary effect triggers
  const targetTime = useMemo(() => targetDate.getTime(), [targetDate]);

  const [timeLeft, setTimeLeft] = useState(() => calculateTime(targetTime));

  function calculateTime(target: number) {
    const difference = target - Date.now();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / DAY),
      hours: Math.floor((difference % DAY) / HOUR),
      minutes: Math.floor((difference % HOUR) / MINUTE),
      seconds: Math.floor((difference % MINUTE) / SECOND),
      isExpired: false,
    };
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextTime = calculateTime(targetTime);
      setTimeLeft(nextTime);

      // Optimization: Clear interval if the countdown reaches zero
      if (nextTime.isExpired) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetTime]);

  return timeLeft;
};
