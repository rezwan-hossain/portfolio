// lib/utils/bib.ts — NEW FILE
import { prisma } from "@/lib/prisma";

/**
 * Auto-assign next available BIB number for a registration
 * @param registrationId - The registration ID
 * @param eventId - The event ID
 * @param prefix - Optional prefix (e.g., "RUN-")
 * @returns The assigned BIB number or null if failed
 */
export async function autoAssignBibNumber(
  registrationId: string,
  eventId: string,
  prefix: string = "",
): Promise<string | null> {
  try {
    // Check if already has a BIB
    const existing = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { bibNumber: true },
    });

    if (existing?.bibNumber) {
      console.log(
        `✓ Registration ${registrationId} already has BIB: ${existing.bibNumber}`,
      );
      return existing.bibNumber;
    }

    // Find the highest BIB in this event
    const lastBib = await prisma.registration.findFirst({
      where: {
        eventId,
        bibNumber: { not: null },
      },
      orderBy: { bibNumber: "desc" },
    });

    let nextNumber: string;

    if (lastBib?.bibNumber) {
      // Extract numeric part (handles prefixed BIBs like "RUN-0042")
      const numericPart = lastBib.bibNumber.replace(/\D/g, "");
      const next = parseInt(numericPart || "0") + 1;
      const padded = String(next).padStart(4, "0");
      nextNumber = prefix ? `${prefix}${padded}` : padded;
    } else {
      // First BIB for this event
      nextNumber = prefix ? `${prefix}0001` : "0001";
    }

    // Check for collision (race condition safety)
    const collision = await prisma.registration.findFirst({
      where: {
        eventId,
        bibNumber: nextNumber,
      },
    });

    if (collision) {
      console.warn(`⚠️ BIB collision detected: ${nextNumber}, retrying...`);
      // Retry with incremented number
      const retryNum = parseInt(nextNumber.replace(/\D/g, "")) + 1;
      const retryPadded = String(retryNum).padStart(4, "0");
      nextNumber = prefix ? `${prefix}${retryPadded}` : retryPadded;
    }

    // Assign the BIB
    await prisma.registration.update({
      where: { id: registrationId },
      data: { bibNumber: nextNumber },
    });

    console.log(
      `✅ Assigned BIB ${nextNumber} to registration ${registrationId}`,
    );
    return nextNumber;
  } catch (error: any) {
    console.error("❌ Auto-assign BIB error:", error?.message);
    return null;
  }
}

/**
 * Get event-specific BIB prefix from event metadata or config
 * You can extend this to fetch from a DB table if needed
 */
export function getEventBibPrefix(eventId: string): string {
  // Default: no prefix
  // You can customize per event:
  // if (eventId === "some-marathon-id") return "MAR-";
  // if (eventId === "some-5k-id") return "5K-";
  return "";
}
