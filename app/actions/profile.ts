// app/actions/profile.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getUserProfile() {
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

    const profile = JSON.parse(
      JSON.stringify({
        id: dbUser.id,
        authId: dbUser.authId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        userName: dbUser.userName,
        phone: dbUser.phone,
        address: dbUser.address,
        birthDate: dbUser.birthDate
          ? new Date(dbUser.birthDate).toISOString().split("T")[0]
          : "",
        gender: dbUser.gender,
        image: dbUser.image,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
      }),
    );

    return { profile };
  } catch (error: any) {
    console.error("Get profile error:", error?.message);
    return { error: "Failed to load profile" };
  }
}

export async function updateUserProfile(formData: {
  firstName: string;
  lastName: string;
  userName: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Validate username uniqueness
    if (formData.userName && formData.userName !== dbUser.userName) {
      const existingUser = await prisma.user.findUnique({
        where: { userName: formData.userName },
      });

      if (existingUser) {
        return { success: false, error: "Username is already taken" };
      }
    }

    // Update profile
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        userName: formData.userName || null,
        phone: formData.phone || null,
        address: formData.address || null,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
        gender: formData.gender || null,
      },
    });

    return { success: true, error: "" };
  } catch (error: any) {
    console.error("Update profile error:", error?.message);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function updateUserPassword(formData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  if (formData.newPassword !== formData.confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  if (formData.newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  try {
    // Verify current password by attempting sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: formData.currentPassword,
    });

    if (signInError) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: formData.newPassword,
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, error: "" };
  } catch (error: any) {
    console.error("Update password error:", error?.message);
    return { success: false, error: "Failed to update password" };
  }
}

export async function deleteUserAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Soft delete — mark as archived
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        isActive: false,
        isArchived: true,
      },
    });

    // Sign out
    await supabase.auth.signOut();

    return { success: true, error: "" };
  } catch (error: any) {
    console.error("Delete account error:", error?.message);
    return { success: false, error: "Failed to delete account" };
  }
}
