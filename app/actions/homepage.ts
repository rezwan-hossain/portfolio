// app/actions/homepage.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath, updateTag, cacheLife, cacheTag } from "next/cache";
import { audit, diff } from "@/lib/audit";

const HERO_AUDIT_FIELDS = [
  "title",
  "desktopImage",
  "mobileImage",
  "slug",
  "eventDate",
  "showCountdown",
  "countdownColor",
  "showSlugButton",
] as const;

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
  "use cache";
  cacheLife("days");
  cacheTag("hero-section", "active-hero");

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

const DEFAULT_COUNTDOWN_COLOR = "#374151";

function normalizeHexColor(color: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : DEFAULT_COUNTDOWN_COLOR;
}

// ─── Create Hero ────────────────────────────────────
export async function createHero(formData: {
  title: string;
  desktopImage: string;
  mobileImage: string;
  slug: string;
  eventDate: string;
  showCountdown: boolean;
  countdownColor: string;
  showSlugButton: boolean;
}) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    // Deactivate all existing
    await prisma.heroSection.updateMany({
      data: { isActive: false },
    });

    const hero = await prisma.heroSection.create({
      data: {
        title: formData.title,
        desktopImage: formData.desktopImage,
        mobileImage: formData.mobileImage || null,
        slug: formData.slug || null,
        eventDate: formData.eventDate ? new Date(formData.eventDate) : null,
        showCountdown: formData.showCountdown,
        countdownColor: normalizeHexColor(formData.countdownColor),
        showSlugButton: formData.showSlugButton,
        isActive: true,
      },
    });

    await audit({
      action: "hero.created",
      entityType: "hero",
      entityId: hero.id,
      summary: `Created homepage hero "${hero.title}" and made it active`,
    });

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/");
    revalidatePath("/profile");
    updateTag("hero-section");

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
    countdownColor: string;
    showSlugButton: boolean;
  },
) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    const before = await prisma.heroSection.findUnique({ where: { id: heroId } });
    const hero = await prisma.heroSection.update({
      where: { id: heroId },
      data: {
        title: formData.title,
        desktopImage: formData.desktopImage,
        mobileImage: formData.mobileImage || null,
        slug: formData.slug || null,
        eventDate: formData.eventDate ? new Date(formData.eventDate) : null,
        showCountdown: formData.showCountdown,
        countdownColor: normalizeHexColor(formData.countdownColor),
        showSlugButton: formData.showSlugButton,
      },
    });

    const changes = diff(before, hero, [...HERO_AUDIT_FIELDS]);
    if (Object.keys(changes).length > 0) {
      await audit({
        action: "hero.updated",
        entityType: "hero",
        entityId: heroId,
        summary: `Updated homepage hero "${hero.title}": ${Object.keys(changes).join(", ")}`,
        changes,
      });
    }

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/");
    revalidatePath("/profile");
    updateTag("hero-section");

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
    const hero = await prisma.heroSection.update({
      where: { id: heroId },
      data: { isActive: true },
    });

    await audit({
      action: "hero.activated",
      entityType: "hero",
      entityId: heroId,
      summary: `Made "${hero.title}" the active homepage hero`,
    });

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/");
    revalidatePath("/profile");
    updateTag("hero-section");

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
    const hero = await prisma.heroSection.delete({ where: { id: heroId } });

    await audit({
      action: "hero.deleted",
      entityType: "hero",
      entityId: heroId,
      summary: `Deleted homepage hero "${hero.title}"`,
    });

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/");
    revalidatePath("/profile");
    updateTag("hero-section");

    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to delete hero" };
  }
}
