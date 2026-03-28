// app/actions/homepage.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
  });

  if (!dbUser) return { error: "User not found" };
  if (dbUser.role !== "ADMIN") return { error: "Unauthorized" };

  return { error: null };
}

// ─── Get Active Hero (Public) ───────────────────────
export async function getActiveHero() {
  try {
    const hero = await prisma.heroSection.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    return { hero: hero ? JSON.parse(JSON.stringify(hero)) : null };
  } catch {
    return { hero: null };
  }
}

// ─── Get All Heroes (Admin) ─────────────────────────
export async function getAllHeroes() {
  const { error } = await requireAdmin();
  if (error) return { heroes: [], error };

  try {
    const heroes = await prisma.heroSection.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return { heroes: JSON.parse(JSON.stringify(heroes)), error: null };
  } catch {
    return { heroes: [], error: "Failed to fetch heroes" };
  }
}

// ─── Create Hero ────────────────────────────────────
export async function createHero(formData: {
  title: string;
  desktopImage: string;
  mobileImage: string;
  slug: string;
  eventDate: string;
  showCountdown: boolean;
  showSlugButton: boolean;
}) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    // Deactivate all existing
    await prisma.heroSection.updateMany({
      data: { isActive: false },
    });

    await prisma.heroSection.create({
      data: {
        title: formData.title,
        desktopImage: formData.desktopImage,
        mobileImage: formData.mobileImage || null,
        slug: formData.slug || null,
        eventDate: formData.eventDate ? new Date(formData.eventDate) : null,
        showCountdown: formData.showCountdown,
        showSlugButton: formData.showSlugButton,
        isActive: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/profile");

    return { success: true, error: null };
  } catch (err: any) {
    console.error("Create hero error:", err?.message);
    return { success: false, error: "Failed to create hero" };
  }
}

// ─── Update Hero ────────────────────────────────────
export async function updateHero(
  heroId: string,
  formData: {
    title: string;
    desktopImage: string;
    mobileImage: string;
    slug: string;
    eventDate: string;
    showCountdown: boolean;
    showSlugButton: boolean;
  },
) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    await prisma.heroSection.update({
      where: { id: heroId },
      data: {
        title: formData.title,
        desktopImage: formData.desktopImage,
        mobileImage: formData.mobileImage || null,
        slug: formData.slug || null,
        eventDate: formData.eventDate ? new Date(formData.eventDate) : null,
        showCountdown: formData.showCountdown,
        showSlugButton: formData.showSlugButton,
      },
    });

    revalidatePath("/");
    revalidatePath("/profile");

    return { success: true, error: null };
  } catch (err: any) {
    console.error("Update hero error:", err?.message);
    return { success: false, error: "Failed to update hero" };
  }
}

// ─── Set Active Hero ────────────────────────────────
export async function setActiveHero(heroId: string) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    await prisma.heroSection.updateMany({ data: { isActive: false } });
    await prisma.heroSection.update({
      where: { id: heroId },
      data: { isActive: true },
    });

    revalidatePath("/");
    revalidatePath("/profile");

    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to set active hero" };
  }
}

// ─── Delete Hero ────────────────────────────────────
export async function deleteHero(heroId: string) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    await prisma.heroSection.delete({ where: { id: heroId } });

    revalidatePath("/");
    revalidatePath("/profile");

    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to delete hero" };
  }
}
