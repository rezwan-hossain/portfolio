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
        date: "asc",
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