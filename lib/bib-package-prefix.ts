// lib/utils/bib.ts
import { prisma } from "@/lib/prisma";

/**
 * Resolve unique single-letter prefixes for ALL packages in an event.
 * Processes packages in creation order (by id).
 *
 * Example:
 *   "Fun Run"        → F  (first letter)
 *   "Challenge"      → C  (first letter)
 *   "Half Marathon"  → H  (first letter)
 *   "Full Marathon"  → U  (F taken → try U)
 *   "Hiking Trail"   → I  (H taken → try I)
 *
 * Returns a Map<packageId, prefix>
 */
async function resolveEventPrefixes(
  eventId: string,
): Promise<Map<number, string>> {
  const packages = await prisma.package.findMany({
    where: { eventId },
    orderBy: { id: "asc" }, // ← stable order = stable prefixes
  });

  const usedPrefixes = new Set<string>();
  const prefixMap = new Map<number, string>();

  for (const pkg of packages) {
    // Remove spaces, uppercase everything
    const cleanName = pkg.name.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let chosen: string | null = null;

    // ── Try each character of the package name ──
    for (const char of cleanName) {
      if (!usedPrefixes.has(char)) {
        chosen = char;
        break;
      }
    }

    // ── Fallback: first letter + counter ──
    // e.g. if "Fun", "Full", "Fury" exist → F, U, R are taken
    //      4th package "Fire" → I is still free
    //      but if ALL letters exhausted → F2, F3 …
    if (!chosen) {
      const base = cleanName[0] || "X";
      let counter = 2;
      while (usedPrefixes.has(`${base}${counter}`)) {
        counter++;
      }
      chosen = `${base}${counter}`;
    }

    usedPrefixes.add(chosen);
    prefixMap.set(pkg.id, `${chosen}-`);
  }

  return prefixMap;
}

/**
 * Get the BIB prefix for a specific package
 */
export async function getPackageBibPrefix(
  packageId: number,
  eventId: string,
): Promise<string> {
  const prefixMap = await resolveEventPrefixes(eventId);
  return prefixMap.get(packageId) ?? "BIB-";
}

/**
 * Auto-assign next available BIB number for a registration
 * BIB numbers are sequential PER PREFIX (per package)
 *
 *   "Fun Run"        → F-0001, F-0002, F-0003 …
 *   "Challenge"      → C-0001, C-0002 …
 *   "Half Marathon"  → H-0001, H-0002 …
 *   "Full Marathon"  → U-0001, U-0002 …  (F was taken)
 */
export async function autoAssignBibNumber(
  registrationId: string,
  eventId: string,
  packageId: number,
): Promise<string | null> {
  try {
    // ── 1. Already assigned? ───────────────────────────
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

    // ── 2. Resolve prefix for this package ─────────────
    const prefix = await getPackageBibPrefix(packageId, eventId);

    // ── 3. Find highest BIB with this prefix ───────────
    const lastBib = await prisma.registration.findFirst({
      where: {
        eventId,
        bibNumber: {
          not: null,
          startsWith: prefix,
        },
      },
      orderBy: { bibNumber: "desc" },
    });

    let nextNumber: string;

    if (lastBib?.bibNumber) {
      const numericPart = lastBib.bibNumber.slice(prefix.length);
      const next = parseInt(numericPart || "0", 10) + 1;
      nextNumber = `${prefix}${String(next).padStart(4, "0")}`;
    } else {
      nextNumber = `${prefix}0001`;
    }

    // ── 4. Collision guard ─────────────────────────────
    const collision = await prisma.registration.findFirst({
      where: { eventId, bibNumber: nextNumber },
    });

    if (collision) {
      console.warn(`⚠️ BIB collision: ${nextNumber}, incrementing...`);
      const num = parseInt(nextNumber.slice(prefix.length), 10) + 1;
      nextNumber = `${prefix}${String(num).padStart(4, "0")}`;
    }

    // ── 5. Assign ──────────────────────────────────────
    await prisma.registration.update({
      where: { id: registrationId },
      data: { bibNumber: nextNumber },
    });

    console.log(`✅ BIB ${nextNumber} → registration ${registrationId}`);
    return nextNumber;
  } catch (error: any) {
    console.error("❌ Auto-assign BIB error:", error?.message);
    return null;
  }
}
