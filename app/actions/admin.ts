// app/actions/admin.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// ─── Auth helper ────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated", user: null, dbUser: null };

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
  });

  if (!dbUser) return { error: "User not found", user: null, dbUser: null };
  if (dbUser.role !== "ADMIN")
    return { error: "Unauthorized — Admin only", user: null, dbUser: null };

  return { error: null, user, dbUser };
}

// ─── Get All Events (Admin) ─────────────────────────
export async function getAdminEvents() {
  const { error, dbUser } = await requireAdmin();
  if (error) return { events: [], error };

  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: { select: { id: true, name: true } },
        packages: {
          orderBy: { price: "asc" },
        },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { events: JSON.parse(JSON.stringify(events)) };
  } catch (err: any) {
    console.error("Admin events error:", err?.message);
    return { events: [], error: "Failed to fetch events" };
  }
}

// ─── Get Single Event (Admin) ───────────────────────
export async function getAdminEvent(eventId: string) {
  const { error } = await requireAdmin();
  if (error) return { event: null, error };

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: true,
        packages: { orderBy: { price: "asc" } },
        _count: { select: { orders: true } },
      },
    });

    if (!event) return { event: null, error: "Event not found" };

    return { event: JSON.parse(JSON.stringify(event)) };
  } catch (err: any) {
    return { event: null, error: "Failed to fetch event" };
  }
}

// ─── Get All Organizers ─────────────────────────────
export async function getOrganizers() {
  const { error } = await requireAdmin();
  if (error) return { organizers: [], error };

  try {
    const organizers = await prisma.organizer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return { organizers: JSON.parse(JSON.stringify(organizers)) };
  } catch (err: any) {
    return { organizers: [], error: "Failed to fetch organizers" };
  }
}

// ─── Create Event ───────────────────────────────────
export async function createEvent(formData: {
  name: string;
  slug: string;
  date: string;
  time: string;
  address: string;
  eventType: string;
  description: string;
  bannerImage: string;
  thumbImage: string;
  minPackagePrice: string;
  organizerId: string;
  status: string;
}) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    // Check slug uniqueness
    const existing = await prisma.event.findUnique({
      where: { slug: formData.slug },
    });

    if (existing) {
      return {
        success: false,
        error: "An event with this slug already exists",
      };
    }

    const event = await prisma.event.create({
      data: {
        name: formData.name,
        slug: formData.slug,
        date: new Date(formData.date),
        time: new Date(`${formData.date}T${formData.time}`),
        address: formData.address,
        eventType: formData.eventType as "LIVE" | "VIRTUAL",
        description: formData.description,
        bannerImage: formData.bannerImage,
        thumbImage: formData.thumbImage || null,
        minPackagePrice: formData.minPackagePrice
          ? parseFloat(formData.minPackagePrice)
          : null,
        organizerId: parseInt(formData.organizerId),
        status: formData.status as any,
      },
    });

    return { success: true, error: "", eventId: String(event.id) };
  } catch (err: any) {
    console.error("Create event error:", err?.message);
    return { success: false, error: "Failed to create event" };
  }
}

// ─── Update Event ───────────────────────────────────
export async function updateEvent(
  eventId: string,
  formData: {
    name: string;
    slug: string;
    date: string;
    time: string;
    address: string;
    eventType: string;
    description: string;
    bannerImage: string;
    thumbImage: string;
    minPackagePrice: string;
    organizerId: string;
    status: string;
  },
) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    // Check slug uniqueness (exclude current event)
    const existing = await prisma.event.findFirst({
      where: { slug: formData.slug, NOT: { id: eventId } },
    });

    if (existing) {
      return { success: false, error: "Slug already in use by another event" };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        name: formData.name,
        slug: formData.slug,
        date: new Date(formData.date),
        time: new Date(`${formData.date}T${formData.time}`),
        address: formData.address,
        eventType: formData.eventType as "LIVE" | "VIRTUAL",
        description: formData.description,
        bannerImage: formData.bannerImage,
        thumbImage: formData.thumbImage || null,
        minPackagePrice: formData.minPackagePrice
          ? parseFloat(formData.minPackagePrice)
          : null,
        organizerId: parseInt(formData.organizerId),
        status: formData.status as any,
      },
    });

    return { success: true, error: "" };
  } catch (err: any) {
    console.error("Update event error:", err?.message);
    return { success: false, error: "Failed to update event" };
  }
}

// ─── Toggle Event Active ────────────────────────────
export async function toggleEventActive(eventId: string, isActive: boolean) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: { isActive },
    });

    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: "Failed to update event" };
  }
}

// ─── Delete Event ───────────────────────────────────
export async function deleteEvent(eventId: string) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: { isArchived: true, isActive: false },
    });

    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: "Failed to delete event" };
  }
}

// ─── Add Package to Event ───────────────────────────
export async function addPackage(
  eventId: string,
  formData: {
    name: string;
    distance: string;
    price: string;
    availableSlots: string;
  },
) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    await prisma.package.create({
      data: {
        name: formData.name,
        distance: formData.distance,
        price: parseInt(formData.price),
        availableSlots: parseInt(formData.availableSlots),
        eventId,
      },
    });

    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: "Failed to add package" };
  }
}

// ─── Update Package ─────────────────────────────────
export async function updatePackage(
  packageId: number,
  formData: {
    name: string;
    distance: string;
    price: string;
    availableSlots: string;
  },
) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    await prisma.package.update({
      where: { id: packageId },
      data: {
        name: formData.name,
        distance: formData.distance,
        price: parseInt(formData.price),
        availableSlots: parseInt(formData.availableSlots),
      },
    });

    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: "Failed to update package" };
  }
}

// ─── Delete Package ─────────────────────────────────
export async function deletePackage(packageId: number) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    await prisma.package.update({
      where: { id: packageId },
      data: { isActive: false, isArchived: true },
    });

    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: "Failed to delete package" };
  }
}

// ─── Create Organizer ───────────────────────────────
export async function createOrganizer(formData: {
  name: string;
  email: string;
  phone: string;
  logo: string;
}) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    const organizer = await prisma.organizer.create({
      data: {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        logo: formData.logo || null,
      },
    });

    return { success: true, error: "", organizerId: organizer.id };
  } catch (err: any) {
    return { success: false, error: "Failed to create organizer" };
  }
}
