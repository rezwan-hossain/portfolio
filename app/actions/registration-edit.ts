// app/actions/registration-edit.ts
"use server";

// Admin correction of a runner's registration details (name spelling, t-shirt
// size, emergency contact, bib…) without cancelling and re-registering.
// Package, quantity, price and payment are deliberately NOT editable here.

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/utils/requestUtils";
import {
  AGE_CATEGORIES,
  BLOOD_GROUPS,
  GENDERS,
  RUNNER_CATEGORIES,
  isValidBDPhone,
  isValidEmail,
} from "@/lib/registration-options";
import { tshirtSizes } from "@/module/checkout/data/tshirtSizes";
import type { RegistrationEditInput } from "@/types/profile";

const clean = (v: string | null | undefined) => {
  const t = v?.trim();
  return t ? t : null;
};
const stripPhone = (v: string) => v.replace(/[\s-]/g, "");

const LABELS: Record<keyof RegistrationEditInput, string> = {
  fullName: "Name",
  email: "Email",
  phone: "Phone",
  gender: "Gender",
  birthDate: "Birth date",
  ageCategory: "Age category",
  bloodGroup: "Blood group",
  tshirtSize: "T-shirt",
  runnerCategory: "Runner category",
  communityName: "Community",
  emergencyContactName: "Emergency contact",
  emergencyContactNumber: "Emergency number",
  bibNumber: "BIB",
};

export async function updateRegistrationDetails(
  orderId: string,
  input: RegistrationEditInput,
): Promise<{ success: boolean; error: string | null; changes?: string[] }> {
  const { error, dbUser } = await requireAdmin();
  if (error || !dbUser) return { success: false, error: error ?? "Unauthorized" };

  const requestId = await getRequestId();
  const log = logger.child({
    requestId,
    action: "updateRegistrationDetails",
    orderId,
    adminId: dbUser.id,
  });
  log.info("action:start");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { adminNote: true, eventId: true, registration: true },
    });
    const current = order?.registration;
    if (!order || !current) {
      return { success: false, error: "This order has no registration to edit." };
    }

    // ─── Validate (never trust the form) ──────────
    // A dropdown value must be a real option — or the value already stored,
    // so legacy data (e.g. "VIRTUAL" t-shirt on virtual events) never blocks
    // an unrelated edit.
    const oneOf = (value: string, options: readonly string[], was: string) =>
      options.includes(value) || value === was;

    const fullName = clean(input.fullName);
    if (!fullName || fullName.length < 2) return fail("Enter the runner's full name.");

    const phone = clean(input.phone);
    if (!phone || !isValidBDPhone(phone))
      return fail("Phone must be a Bangladeshi mobile number, e.g. 01712345678.");

    const email = clean(input.email);
    if (email && !isValidEmail(email)) return fail("Enter a valid email address.");

    const emergencyNumber = clean(input.emergencyContactNumber);
    if (emergencyNumber && !isValidBDPhone(emergencyNumber))
      return fail("Emergency number must be a Bangladeshi mobile number.");

    if (!oneOf(input.gender, GENDERS, current.gender)) return fail("Select a gender.");
    if (!oneOf(input.ageCategory, AGE_CATEGORIES, current.ageCategory))
      return fail("Select an age category.");
    if (!oneOf(input.bloodGroup, BLOOD_GROUPS, current.bloodGroup))
      return fail("Select a blood group.");
    if (!oneOf(input.runnerCategory, RUNNER_CATEGORIES, current.runnerCategory))
      return fail("Select a runner category.");
    if (
      !oneOf(
        input.tshirtSize,
        tshirtSizes.map((s) => s.value),
        current.tshirtSize,
      )
    )
      return fail("Select a t-shirt size.");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) return fail("Enter a date of birth.");
    const birthDate = new Date(`${input.birthDate}T00:00:00.000Z`);
    if (Number.isNaN(birthDate.getTime()) || birthDate >= new Date())
      return fail("Date of birth must be a real date in the past.");

    const bibNumber = clean(input.bibNumber);
    if (bibNumber && bibNumber.length > 20) return fail("BIB number is too long.");

    // ─── Work out what actually changed ────────────
    const next = {
      fullName,
      email,
      phone: stripPhone(phone),
      gender: input.gender,
      birthDate,
      ageCategory: input.ageCategory,
      bloodGroup: input.bloodGroup,
      tshirtSize: input.tshirtSize,
      runnerCategory: input.runnerCategory,
      communityName: clean(input.communityName),
      emergencyContactName: clean(input.emergencyContactName),
      emergencyContactNumber: emergencyNumber ? stripPhone(emergencyNumber) : null,
      bibNumber,
    };

    const show = (v: unknown) =>
      v instanceof Date ? v.toISOString().slice(0, 10) : v == null || v === "" ? "—" : String(v);

    const changes: string[] = [];
    const data: Prisma.RegistrationUpdateInput = {};
    for (const key of Object.keys(next) as (keyof typeof next)[]) {
      const before = show(current[key]);
      const after = show(next[key]);
      if (before !== after) {
        changes.push(`${LABELS[key]}: ${before} → ${after}`);
        (data as Record<string, unknown>)[key] = next[key];
      }
    }

    if (changes.length === 0) {
      return { success: true, error: null, changes: [] };
    }

    // ─── Save + audit line, together ───────────────
    const stamp = `[${new Date().toISOString()}] Details edited by ${dbUser.email}: ${changes.join("; ")}`;
    await prisma.$transaction([
      prisma.registration.update({ where: { id: current.id }, data }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          adminNote: order.adminNote ? `${order.adminNote}\n${stamp}` : stamp,
        },
      }),
    ]);

    log.info({ changes }, "action:success");
    return { success: true, error: null, changes };
  } catch (err) {
    // @@unique([eventId, bibNumber])
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return fail("That BIB number is already used by another runner in this event.");
    }
    log.error({ err }, "action:error");
    return { success: false, error: "Failed to save changes." };
  } finally {
    await log.flush();
  }

  function fail(message: string) {
    log.warn({ reason: message }, "validation:failed");
    return { success: false, error: message };
  }
}
