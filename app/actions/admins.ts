// app/actions/admins.ts
"use server";

// Grant / revoke admin access from the panel. Every export is a public
// endpoint, so every one starts with requireAdmin(). Safety rules live here,
// not in the UI:
//   - only registered, active accounts can be made admin (guests can't log in)
//   - an admin can't change their own role (no accidental self-lockout)
//   - the last admin can't be removed
//   - granting needs the user's email typed back as confirmation
//   - every change is written to the audit log

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { audit } from "@/lib/audit";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  isYou: boolean;
};

const displayName = (u: { firstName: string | null; lastName: string | null; userName: string | null; email: string }) =>
  [u.firstName, u.lastName].filter(Boolean).join(" ") || u.userName || u.email.split("@")[0];

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  userName: true,
  phone: true,
  createdAt: true,
} as const;

export async function getAdminUsers(): Promise<{ admins: AdminUser[]; error: string | null }> {
  const { error, dbUser } = await requireAdmin();
  if (error || !dbUser) return { admins: [], error: error ?? "Unauthorized" };
  try {
    const rows = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: USER_SELECT,
      orderBy: { createdAt: "asc" },
    });
    return {
      admins: rows.map((u) => ({
        id: u.id,
        name: displayName(u),
        email: u.email,
        phone: u.phone,
        createdAt: u.createdAt.toISOString(),
        isYou: u.id === dbUser.id,
      })),
      error: null,
    };
  } catch (err) {
    console.error("getAdminUsers error:", err);
    return { admins: [], error: "Failed to load admins" };
  }
}

/** Registered, active, non-admin accounts matching name / email / phone. */
export async function searchUsersToPromote(
  term: string,
): Promise<{ users: Omit<AdminUser, "isYou">[]; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { users: [], error };
  const q = term.trim();
  if (q.length < 3) return { users: [], error: null };
  try {
    const rows = await prisma.user.findMany({
      where: {
        role: { not: "ADMIN" },
        isGuest: false,
        isActive: true,
        isArchived: false,
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { userName: { contains: q, mode: "insensitive" } },
          ...(q.replace(/\D/g, "").length >= 4 ? [{ phone: { contains: q.replace(/\D/g, "") } }] : []),
        ],
      },
      select: USER_SELECT,
      orderBy: { email: "asc" },
      take: 20,
    });
    return {
      users: rows.map((u) => ({
        id: u.id,
        name: displayName(u),
        email: u.email,
        phone: u.phone,
        createdAt: u.createdAt.toISOString(),
      })),
      error: null,
    };
  } catch (err) {
    console.error("searchUsersToPromote error:", err);
    return { users: [], error: "Search failed" };
  }
}

export async function grantAdmin(
  userId: string,
  confirmEmail: string,
): Promise<{ success: boolean; error: string | null }> {
  const { error, dbUser } = await requireAdmin();
  if (error || !dbUser) return { success: false, error: error ?? "Unauthorized" };
  if (userId === dbUser.id) return { success: false, error: "You're already an admin." };

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true, isGuest: true, isActive: true, isArchived: true },
    });
    if (!target) return { success: false, error: "User not found." };
    if (target.isGuest) return { success: false, error: "Guest checkouts have no login, so they can't be admins." };
    if (!target.isActive || target.isArchived) {
      return { success: false, error: "This account is disabled." };
    }
    if (target.role === "ADMIN") return { success: false, error: "This user is already an admin." };
    if (confirmEmail.trim().toLowerCase() !== target.email.toLowerCase()) {
      return { success: false, error: "Type the user's email exactly to confirm." };
    }

    const changed = await prisma.user.updateMany({
      where: { id: userId, role: target.role, isGuest: false },
      data: { role: "ADMIN" },
    });
    if (changed.count === 0) return { success: false, error: "This user just changed — refresh and try again." };

    await audit({
      action: "admin.granted",
      entityType: "user",
      entityId: userId,
      summary: `Gave admin access to ${target.email}`,
      changes: { role: [target.role, "ADMIN"] },
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("grantAdmin error:", err);
    return { success: false, error: "Failed to grant admin access" };
  }
}

export async function revokeAdmin(userId: string): Promise<{ success: boolean; error: string | null }> {
  const { error, dbUser } = await requireAdmin();
  if (error || !dbUser) return { success: false, error: error ?? "Unauthorized" };
  if (userId === dbUser.id) {
    return { success: false, error: "You can't remove your own admin access. Ask another admin." };
  }

  try {
    // Serializable: two admins removing each other at the same moment can't
    // both pass the "not the last admin" check and leave nobody in charge.
    type Outcome = { ok: false; error: string } | { ok: true; email: string };
    const result: Outcome = await prisma.$transaction(
      async (tx): Promise<Outcome> => {
        const target = await tx.user.findUnique({ where: { id: userId }, select: { email: true, role: true } });
        if (!target) return { ok: false, error: "User not found." };
        if (target.role !== "ADMIN") return { ok: false, error: "This user isn't an admin." };
        const admins = await tx.user.count({ where: { role: "ADMIN" } });
        if (admins <= 1) return { ok: false, error: "You can't remove the last admin." };
        const changed = await tx.user.updateMany({
          where: { id: userId, role: "ADMIN" },
          data: { role: "USER" },
        });
        if (changed.count === 0) return { ok: false, error: "This user just changed — refresh and try again." };
        return { ok: true, email: target.email };
      },
      { isolationLevel: "Serializable" },
    );
    if (!result.ok) return { success: false, error: result.error };

    await audit({
      action: "admin.revoked",
      entityType: "user",
      entityId: userId,
      summary: `Removed admin access from ${result.email}`,
      changes: { role: ["ADMIN", "USER"] },
    });
    return { success: true, error: null };
  } catch (err) {
    // P2034 = serialization conflict: another admin change won the race.
    if ((err as { code?: string })?.code === "P2034") {
      return { success: false, error: "Another admin change happened at the same time — refresh and try again." };
    }
    console.error("revokeAdmin error:", err);
    return { success: false, error: "Failed to remove admin access" };
  }
}
