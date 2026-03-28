"use server";

import { prisma } from "@/lib/prisma";

export async function getAllEvents() {
  try {
    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        isArchived: false,
      },
      include: {
        organizer: true,
        packages: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return { events };
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return { events: [], error: "Failed to fetch events" };
  }
}

export async function getEventBySlug(slug: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        organizer: true,
        packages: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
      },
    });

    return { event };
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return { event: null, error: "Failed to fetch event" };
  }
}

export async function getUpcomingEvents(limit: number = 3) {
  try {
    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        isArchived: false,
        status: "ACTIVE",
        // ✅ Removed date filter — shows all active events
        // date: { gte: new Date() },
      },
      include: {
        organizer: true,
        packages: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    // return { events: JSON.parse(JSON.stringify(events)) };
    return { events };
  } catch (error) {
    console.error("Failed to fetch upcoming events:", error);
    return { events: [], error: "Failed to fetch upcoming events" };
  }
}
