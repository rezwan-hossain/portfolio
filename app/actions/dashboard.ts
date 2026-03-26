// app/actions/dashboard.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return { error: "User not found" };
    }

    // Get user's orders with all relations
    const orders = await prisma.order.findMany({
      where: { userId: dbUser.id, isActive: true },
      include: {
        event: {
          include: { organizer: true },
        },
        package: true,
        registration: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get active events (upcoming events)
    const activeEvents = await prisma.event.findMany({
      where: {
        isActive: true,
        isArchived: false,
        status: "ACTIVE",
        date: { gte: new Date() },
      },
      include: {
        organizer: true,
        packages: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
      },
      orderBy: { date: "asc" },
      take: 5,
    });

    // Calculate stats
    const totalOrders = orders.length;
    const confirmedOrders = orders.filter(
      (o) => o.status === "CONFIRMED",
    ).length;
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const totalPaid = orders
      .filter((o) => o.payment?.status === "PAID")
      .reduce((sum, o) => sum + (o.payment?.amount ?? 0), 0);
    const upcomingEvents = orders.filter(
      (o) => o.status === "CONFIRMED" && new Date(o.event.date) >= new Date(),
    ).length;

    // Serialize everything
    const serialized = JSON.parse(
      JSON.stringify({
        user: {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          userName: dbUser.userName,
          phone: dbUser.phone,
          image: dbUser.image,
          role: dbUser.role,
          createdAt: dbUser.createdAt,
        },
        stats: {
          totalOrders,
          confirmedOrders,
          pendingOrders,
          totalPaid,
          upcomingEvents,
          activeEventsCount: activeEvents.length,
        },
        orders,
        activeEvents,
      }),
    );

    return serialized;
  } catch (error: any) {
    console.error("Dashboard error:", error?.message);
    return { error: "Failed to load dashboard" };
  }
}
