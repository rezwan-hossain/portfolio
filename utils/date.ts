// lib/date.ts (or utils/date.ts)

/**
 * Format time to display format (e.g., "04:30 AM")
 * @param time - Date object or ISO string
 * @param timezone - Timezone to use (default: Asia/Dhaka)
 */
export function formatEventTime(
  time: string | Date,
  timezone: string = "Asia/Dhaka",
): string {
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
}

export function formatEventTimeUTC(
  time: string | Date,
  timezone: string = "UTC",
): string {
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
}

/**
 * Format date to display format (e.g., "JUL 10, 2026")
 * @param date - Date object or ISO string
 * @param timezone - Timezone to use (default: Asia/Dhaka)
 */
export function formatEventDate(
  date: string | Date,
  timezone: string = "Asia/Dhaka",
): string {
  return new Date(date)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: timezone,
    })
    .toUpperCase();
}

/**
 * Format both date and time together
 */
export function formatEventDateTime(
  dateTime: string | Date,
  timezone: string = "Asia/Dhaka",
): { date: string; time: string } {
  const dt = new Date(dateTime);
  return {
    date: formatEventDate(dt, timezone),
    time: formatEventTime(dt, timezone),
  };
}
