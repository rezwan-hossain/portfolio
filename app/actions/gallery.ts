// actions/gallery.ts

"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CreateGalleryImageInput,
  UpdateGalleryImageInput,
  DeleteGalleryImageInput,
} from "@/types/gallery";

// ─── Helpers ────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { id: true, role: true },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  if (dbUser.role !== "ADMIN") {
    throw new Error("Forbidden: Admin only");
  }

  return dbUser.id;
}

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Get All Gallery Images ─────────────────────────
export async function getGalleryImages() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return images;
}

// ─── Create ─────────────────────────────────────────
export async function createGalleryImage(
  input: CreateGalleryImageInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    if (!input.src?.trim()) {
      return { success: false, error: "Image URL is required" };
    }

    const image = await prisma.galleryImage.create({
      data: {
        src: input.src.trim(),
        alt: input.alt?.trim() || null,
      },
    });

    revalidatePath("/gallery");
    revalidatePath("/profile");

    return { success: true, data: { id: image.id } };
  } catch (err: any) {
    console.error("createGalleryImage error:", err);
    return { success: false, error: err.message || "Failed to create image" };
  }
}

// ─── Update ─────────────────────────────────────────
export async function updateGalleryImage(
  input: UpdateGalleryImageInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    if (!input.id?.trim()) {
      return { success: false, error: "Image ID is required" };
    }

    if (!input.src?.trim()) {
      return { success: false, error: "Image URL is required" };
    }

    const existing = await prisma.galleryImage.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      return { success: false, error: "Image not found" };
    }

    const image = await prisma.galleryImage.update({
      where: { id: input.id },
      data: {
        src: input.src.trim(),
        alt: input.alt?.trim() || null,
      },
    });

    revalidatePath("/gallery");
    revalidatePath("/profile");

    return { success: true, data: { id: image.id } };
  } catch (err: any) {
    console.error("updateGalleryImage error:", err);
    return { success: false, error: err.message || "Failed to update image" };
  }
}

// ─── Delete ─────────────────────────────────────────
export async function deleteGalleryImage(
  input: DeleteGalleryImageInput,
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    if (!input.id?.trim()) {
      return { success: false, error: "Image ID is required" };
    }

    const existing = await prisma.galleryImage.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      return { success: false, error: "Image not found" };
    }

    await prisma.galleryImage.delete({
      where: { id: input.id },
    });

    revalidatePath("/gallery");
    revalidatePath("/profile");

    return { success: true, data: null };
  } catch (err: any) {
    console.error("deleteGalleryImage error:", err);
    return { success: false, error: err.message || "Failed to delete image" };
  }
}
