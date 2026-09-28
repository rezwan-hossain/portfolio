// app/actions/returning-runners.ts
"use server";

// Runners who took part in 2+ events. A "runner" is identified by the phone
// number on their registration (normalised to the last 10 digits, so
// +880 1712-345678 and 01712345678 match) — not the account, because one
// account often registers friends and family. Falls back to the account when a
// registration has no usable phone. Paid (CONFIRMED) registrations only.

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export type ReturningRunner = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  eventCount: number;
  events: { id: string; name: string; date: string; packageName: string }[];
  firstEventDate: string;
  lastEventDate: string;
  totalPaid: number;
};

export type ReturningSummary = {
  /** Unique paid runners in scope (all events, or the chosen event). */
  runners: number;
  returning: number;
  eventsWithRunners: number;
};

const phoneKey = (phone: string | null | undefined) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
};

export async function getReturningRunners(opts: {
  eventId: string | "all";
  minEvents?: number;
  search?: string;
}): Promise<{
  runners: ReturningRunner[];
  summary: ReturningSummary;
  error: string | null;
}> {
  const emptySummary = { runners: 0, returning: 0, eventsWithRunners: 0 };
  const { error } = await requireAdmin();
  if (error) return { runners: [], summary: emptySummary, error };

  try {
    const minEvents = Math.max(2, Math.min(20, Math.floor(opts.minEvents ?? 2)));
    const orders = await prisma.order.findMany({
      where: { status: "CONFIRMED", isArchived: false },
      select: {
        userId: true,
        total: true,
        createdAt: true,
        event: { select: { id: true, name: true, date: true } },
        package: { select: { name: true } },
        registration: { select: { fullName: true, phone: true, email: true } },
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 100_000,
    });

    type Acc = ReturningRunner & {
      eventIds: Set<string>;
      lastSeen: number;
      regEmail: string | null; // latest email the runner typed on a registration
      accountEmail: string | null; // latest account email (may be whoever paid)
    };
    const people = new Map<string, Acc>();
    const eventIds = new Set<string>();

    for (const o of orders) {
      eventIds.add(o.event.id);
      const key = phoneKey(o.registration?.phone) ?? `user:${o.userId}`;
      const p =
        people.get(key) ??
        ({
          key,
          name: "",
          phone: null,
          email: null,
          eventCount: 0,
          events: [],
          firstEventDate: o.event.date.toISOString(),
          lastEventDate: o.event.date.toISOString(),
          totalPaid: 0,
          eventIds: new Set<string>(),
          lastSeen: 0,
          regEmail: null,
          accountEmail: null,
        } as Acc);

      // Latest registration wins for contact details (people fix typos).
      if (o.createdAt.getTime() >= p.lastSeen) {
        p.lastSeen = o.createdAt.getTime();
        p.name = o.registration?.fullName || p.name || "Unknown";
        p.phone = o.registration?.phone || p.phone;
        const regEmail = o.registration?.email;
        if (regEmail && !regEmail.endsWith(".invalid")) p.regEmail = regEmail;
        const acct = o.user.email;
        if (acct && !acct.endsWith(".invalid")) p.accountEmail = acct;
      }
      // The runner's own email beats the paying account's (a parent, a friend).
      p.email = p.regEmail ?? p.accountEmail;
      p.totalPaid += Math.round(o.total);
      if (!p.eventIds.has(o.event.id)) {
        p.eventIds.add(o.event.id);
        p.events.push({
          id: o.event.id,
          name: o.event.name,
          date: o.event.date.toISOString(),
          packageName: o.package.name,
        });
      }
      const d = o.event.date.toISOString();
      if (d < p.firstEventDate) p.firstEventDate = d;
      if (d > p.lastEventDate) p.lastEventDate = d;
      people.set(key, p);
    }

    const inScope = [...people.values()].filter(
      (p) => opts.eventId === "all" || p.eventIds.has(opts.eventId),
    );
    const term = (opts.search ?? "").trim().toLowerCase();
    const termDigits = term.replace(/\D/g, "");

    const runners = inScope
      .filter((p) => p.eventIds.size >= minEvents)
      .filter(
        (p) =>
          !term ||
          p.name.toLowerCase().includes(term) ||
          (p.email ?? "").toLowerCase().includes(term) ||
          (termDigits.length >= 4 && (p.phone ?? "").replace(/\D/g, "").includes(termDigits)),
      )
      .map((p): ReturningRunner => ({
        key: p.key,
        name: p.name,
        phone: p.phone,
        email: p.email,
        eventCount: p.eventIds.size,
        events: p.events.sort((a, b) => a.date.localeCompare(b.date)),
        firstEventDate: p.firstEventDate,
        lastEventDate: p.lastEventDate,
        totalPaid: p.totalPaid,
      }))
      .sort(
        (a, b) =>
          b.eventCount - a.eventCount ||
          b.lastEventDate.localeCompare(a.lastEventDate) ||
          a.name.localeCompare(b.name),
      );

    return {
      runners,
      summary: {
        runners: inScope.length,
        returning: inScope.filter((p) => p.eventIds.size >= 2).length,
        eventsWithRunners: eventIds.size,
      },
      error: null,
    };
  } catch (err) {
    console.error("getReturningRunners error:", err);
    return { runners: [], summary: emptySummary, error: "Failed to load returning runners" };
  }
}
