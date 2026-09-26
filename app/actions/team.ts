// app/actions/team.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { audit, diff } from "@/lib/audit";

const TEAM_AUDIT_FIELDS = [
  "name",
  "role",
  "bio",
  "image",
  "category",
  "sortOrder",
  "isActive",
  "linkedinUrl",
  "twitterUrl",
  "githubUrl",
  "instagramUrl",
  "facebookUrl",
] as const;

type TeamCategory = "ADMIN" | "ADVISOR" | "ORGANIZER";

// ─── GET ALL TEAM MEMBERS ──────────────────────────
export async function getAllTeamMembers() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });

    // Transform to include socials object for frontend compatibility
    const transformed = members.map((member) => ({
      ...member,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
      socials: {
        linkedin: member.linkedinUrl || undefined,
        twitter: member.twitterUrl || undefined,
        github: member.githubUrl || undefined,
        instagram: member.instagramUrl || undefined,
        facebook: member.facebookUrl || undefined,
      },
    }));

    return { members: transformed };
  } catch (error) {
    console.error("Get team members error:", error);
    return { members: [], error: "Failed to fetch team members" };
  }
}

// ─── GET ACTIVE TEAM MEMBERS (for public page) ─────
export async function getActiveTeamMembers() {
  try {
    const members = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });

    const transformed = members.map((member) => ({
      ...member,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
      socials: {
        linkedin: member.linkedinUrl || undefined,
        twitter: member.twitterUrl || undefined,
        github: member.githubUrl || undefined,
        instagram: member.instagramUrl || undefined,
        facebook: member.facebookUrl || undefined,
      },
    }));

    return { members: transformed };
  } catch (error) {
    console.error("Get active team members error:", error);
    return { members: [], error: "Failed to fetch team members" };
  }
}

// ─── CREATE TEAM MEMBER ────────────────────────────
export async function createTeamMember(data: {
  name: string;
  role?: string;
  bio?: string;
  image?: string;
  category?: TeamCategory;
  sortOrder?: number;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}) {
  try {
    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        role: data.role || null,
        bio: data.bio || null,
        image: data.image || null,
        category: data.category || "ADVISOR",
        sortOrder: data.sortOrder || 0,
        linkedinUrl: data.linkedinUrl || null,
        twitterUrl: data.twitterUrl || null,
        githubUrl: data.githubUrl || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
      },
    });

    revalidatePath("/team");
    revalidatePath("/profile");

    await audit({
      action: "team.created",
      entityType: "team",
      entityId: member.id,
      summary: `Added team member "${member.name}" (${member.category})`,
    });

    return { success: true, member };
  } catch (error) {
    console.error("Create team member error:", error);
    return { error: "Failed to create team member" };
  }
}

// ─── UPDATE TEAM MEMBER ────────────────────────────
export async function updateTeamMember(
  id: string,
  data: Partial<{
    name: string;
    role: string | null;
    bio: string | null;
    image: string | null;
    category: TeamCategory;
    sortOrder: number;
    isActive: boolean;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    githubUrl: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
  }>,
) {
  try {
    const before = await prisma.teamMember.findUnique({ where: { id } });
    const member = await prisma.teamMember.update({
      where: { id },
      data,
    });

    const changes = diff(before, member, [...TEAM_AUDIT_FIELDS]);
    if (Object.keys(changes).length > 0) {
      await audit({
        action: "team.updated",
        entityType: "team",
        entityId: id,
        summary: `Updated team member "${member.name}": ${Object.keys(changes).join(", ")}`,
        changes,
      });
    }

    revalidatePath("/team");
    revalidatePath("/profile");

    return { success: true, member };
  } catch (error) {
    console.error("Update team member error:", error);
    return { error: "Failed to update team member" };
  }
}

// ─── DELETE TEAM MEMBER ────────────────────────────
export async function deleteTeamMember(id: string) {
  try {
    const removed = await prisma.teamMember.delete({ where: { id } });

    await audit({
      action: "team.deleted",
      entityType: "team",
      entityId: id,
      summary: `Removed team member "${removed.name}"`,
    });

    revalidatePath("/team");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Delete team member error:", error);
    return { error: "Failed to delete team member" };
  }
}

// ─── TOGGLE ACTIVE STATUS ──────────────────────────
export async function toggleTeamMemberActive(id: string) {
  try {
    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) return { error: "Member not found" };

    const updated = await prisma.teamMember.update({
      where: { id },
      data: { isActive: !member.isActive },
    });

    await audit({
      action: updated.isActive ? "team.activated" : "team.deactivated",
      entityType: "team",
      entityId: id,
      summary: `${updated.isActive ? "Showed" : "Hid"} team member "${updated.name}"`,
      changes: { isActive: [member.isActive, updated.isActive] },
    });

    revalidatePath("/team");
    revalidatePath("/profile");

    return { success: true, member: updated };
  } catch (error) {
    console.error("Toggle team member error:", error);
    return { error: "Failed to toggle status" };
  }
}

// ─── REORDER TEAM MEMBERS ──────────────────────────
export async function reorderTeamMembers(
  updates: { id: string; sortOrder: number }[],
) {
  try {
    await prisma.$transaction(
      updates.map((item) =>
        prisma.teamMember.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    await audit({
      action: "team.reordered",
      entityType: "team",
      entityId: updates.map((u) => u.id).join(",").slice(0, 190) || "none",
      summary: `Reordered ${updates.length} team member${updates.length === 1 ? "" : "s"}`,
    });

    revalidatePath("/team");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Reorder team members error:", error);
    return { error: "Failed to reorder" };
  }
}
