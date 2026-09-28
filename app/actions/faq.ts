// app/actions/faq.ts
"use server";

// Homepage FAQ. getPublicFaqs() is the cached public read; everything else is
// admin-only, audited, and refreshes the homepage cache immediately.

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { audit, diff } from "@/lib/audit";
import { DEFAULT_FAQS } from "@/lib/faq-defaults";
import { cacheLife, cacheTag, updateTag } from "next/cache";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
};

const Q_MAX = 200;
const A_MAX = 2000;

function validate(question: string, answer: string): string | null {
  const q = question.trim();
  const a = answer.trim();
  if (q.length < 3) return "Write the question.";
  if (a.length < 1) return "Write the answer.";
  if (q.length > Q_MAX) return `Keep the question under ${Q_MAX} characters.`;
  if (a.length > A_MAX) return `Keep the answer under ${A_MAX} characters.`;
  return null;
}

// ─── Public (homepage) ────────────────────────────────
export async function getPublicFaqs(): Promise<{ question: string; answer: string }[]> {
  "use cache";
  cacheLife("days");
  cacheTag("faqs");

  try {
    const rows = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { question: true, answer: true },
    });
    return rows; // empty = admin hid everything → the section hides
  } catch (err) {
    console.error("getPublicFaqs failed, showing built-in FAQ:", err);
    return DEFAULT_FAQS;
  }
}

// ─── Admin ────────────────────────────────────────────
export async function getAllFaqs(): Promise<{ faqs: FaqItem[]; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { faqs: [], error };
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, question: true, answer: true, sortOrder: true, isActive: true },
    });
    return { faqs, error: null };
  } catch (err) {
    console.error("getAllFaqs error:", err);
    return { faqs: [], error: "Failed to load FAQs" };
  }
}

export async function createFaq(input: {
  question: string;
  answer: string;
}): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };
  const problem = validate(input.question, input.answer);
  if (problem) return { success: false, error: problem };

  try {
    const last = await prisma.faq.aggregate({ _max: { sortOrder: true } });
    const faq = await prisma.faq.create({
      data: {
        question: input.question.trim(),
        answer: input.answer.trim(),
        sortOrder: (last._max.sortOrder ?? 0) + 1,
      },
    });
    await audit({
      action: "faq.created",
      entityType: "faq",
      entityId: faq.id,
      summary: `Added FAQ: "${faq.question}"`,
    });
    updateTag("faqs");
    return { success: true, error: null };
  } catch (err) {
    console.error("createFaq error:", err);
    return { success: false, error: "Failed to add the question" };
  }
}

export async function updateFaq(
  id: string,
  input: { question: string; answer: string },
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };
  const problem = validate(input.question, input.answer);
  if (problem) return { success: false, error: problem };

  try {
    const before = await prisma.faq.findUnique({ where: { id } });
    if (!before) return { success: false, error: "This question no longer exists." };
    const after = await prisma.faq.update({
      where: { id },
      data: { question: input.question.trim(), answer: input.answer.trim() },
    });
    const changes = diff(before, after, ["question", "answer"]);
    if (Object.keys(changes).length > 0) {
      await audit({
        action: "faq.updated",
        entityType: "faq",
        entityId: id,
        summary: `Edited FAQ: "${after.question}"`,
        changes,
      });
    }
    updateTag("faqs");
    return { success: true, error: null };
  } catch (err) {
    console.error("updateFaq error:", err);
    return { success: false, error: "Failed to save the question" };
  }
}

export async function setFaqVisible(
  id: string,
  isActive: boolean,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };
  try {
    const faq = await prisma.faq.update({ where: { id }, data: { isActive } });
    await audit({
      action: isActive ? "faq.activated" : "faq.deactivated",
      entityType: "faq",
      entityId: id,
      summary: `${isActive ? "Showed" : "Hid"} FAQ: "${faq.question}"`,
      changes: { isActive: [!isActive, isActive] },
    });
    updateTag("faqs");
    return { success: true, error: null };
  } catch (err) {
    console.error("setFaqVisible error:", err);
    return { success: false, error: "Failed to update the question" };
  }
}

export async function deleteFaq(id: string): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };
  try {
    const faq = await prisma.faq.delete({ where: { id } });
    await audit({
      action: "faq.deleted",
      entityType: "faq",
      entityId: id,
      summary: `Deleted FAQ: "${faq.question}"`,
      changes: { answer: [faq.answer, null] },
    });
    updateTag("faqs");
    return { success: true, error: null };
  } catch (err) {
    console.error("deleteFaq error:", err);
    return { success: false, error: "Failed to delete the question" };
  }
}

/** Save a new order: ids from top to bottom. */
export async function reorderFaqs(ids: string[]): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 500) {
    return { success: false, error: "Nothing to reorder." };
  }
  try {
    await prisma.$transaction(
      ids.map((id, i) => prisma.faq.update({ where: { id }, data: { sortOrder: i + 1 } })),
    );
    await audit({
      action: "faq.reordered",
      entityType: "faq",
      entityId: "faqs",
      summary: `Reordered ${ids.length} FAQ questions`,
    });
    updateTag("faqs");
    return { success: true, error: null };
  } catch (err) {
    console.error("reorderFaqs error:", err);
    return { success: false, error: "Failed to save the new order" };
  }
}
