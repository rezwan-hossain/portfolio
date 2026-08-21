// app/actions/manual-registration.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/utils/requestUtils";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  BD_PHONE_REGEX,
  EMAIL_REGEX,
  MANUAL_ORDER_STATUSES,
} from "@/lib/registration-options";
import type { ManualRegistrationInput, ManualPackage } from "@/types/profile";

// ─── Helpers ────────────────────────────────────────

/** Trim, and collapse "" to null so we never write empty strings into @unique columns. */
const clean = (v?: string | null): string | null => {
  const t = v?.trim();
  return t ? t : null;
};

const stripPhone = (v: string) => v.replace(/[\s-]/g, "");

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? null,
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
};

// ─── Validation (server-side, never trust the form) ──
function validate(input: ManualRegistrationInput): string | null {
  if (!clean(input.eventId)) return "Event is missing";
  if (!Number.isInteger(input.packageId) || input.packageId <= 0)
    return "Select a package";
  if (!Number.isInteger(input.qty) || input.qty < 1 || input.qty > 20)
    return "Quantity must be between 1 and 20";

  const fullName = clean(input.fullName);
  if (!fullName || fullName.length < 2)
    return "Enter the participant's full name";

  const phone = clean(input.phone);
  if (!phone) return "Enter a contact number";
  if (!BD_PHONE_REGEX.test(stripPhone(phone)))
    return "Contact number must be a Bangladeshi mobile number, e.g. 01712345678";

  const email = clean(input.email);
  if (email && !EMAIL_REGEX.test(email)) return "Enter a valid email address";

  const emergency = clean(input.emergencyContactNumber);
  if (emergency && !BD_PHONE_REGEX.test(stripPhone(emergency)))
    return "Emergency contact must be a Bangladeshi mobile number";

  if (!clean(input.gender)) return "Select a gender";

  if (!clean(input.birthDate)) return "Enter a date of birth";
  const dob = new Date(input.birthDate);
  if (Number.isNaN(dob.getTime())) return "Date of birth is not a valid date";
  if (dob >= new Date()) return "Date of birth must be in the past";

  if (!clean(input.ageCategory)) return "Select an age category";
  if (!clean(input.bloodGroup)) return "Select a blood group";
  if (!clean(input.tshirtSize)) return "Select a t-shirt size";
  if (!clean(input.runnerCategory)) return "Select a runner category";

  if (!MANUAL_ORDER_STATUSES.includes(input.orderStatus))
    return "Select a valid order status";

  if (!Number.isFinite(input.discount) || input.discount < 0)
    return "Discount must be 0 or more";

  return null;
}

// ─── Fresh package list for the form ────────────────
// Read live rather than trusting the `event.packages` already in the admin's
// props, which go stale as soon as anyone registers.
export async function getEventPackages(eventId: string) {
  const { error } = await requireAdmin();
  if (error) return { packages: [] as ManualPackage[], error };

  try {
    const packages = await prisma.package.findMany({
      where: { eventId, isArchived: false },
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        distance: true,
        price: true,
        availableSlots: true,
        usedSlots: true,
        isActive: true,
        status: true,
      },
    });

    return { packages: JSON.parse(JSON.stringify(packages)), error: null };
  } catch (err: any) {
    console.error("Get event packages error:", err?.message);
    return {
      packages: [] as ManualPackage[],
      error: "Failed to load packages",
    };
  }
}

// ─── Create Manual Registration ─────────────────────
export async function createManualRegistration(input: ManualRegistrationInput) {
  const { error: authError, dbUser: admin } = await requireAdmin();
  if (authError || !admin) {
    return {
      success: false,
      error: authError ?? "Unauthorized — Admin only",
      orderId: null,
    };
  }

  const invalid = validate(input);
  if (invalid) return { success: false, error: invalid, orderId: null };

  const requestId = await getRequestId();
  const start = Date.now();

  const log = logger.child({
    requestId,
    action: "createManualRegistration",
    adminId: admin.id,
    eventId: input.eventId,
    packageId: input.packageId,
    qty: input.qty,
  });

  log.info("action:start");

  try {
    // ─── Load package, confirm it belongs to this event ───
    const pkg = await prisma.package.findUnique({
      where: { id: input.packageId },
      select: {
        id: true,
        price: true,
        availableSlots: true,
        usedSlots: true,
        eventId: true,
        isArchived: true,
        event: { select: { slug: true } },
      },
    });

    if (!pkg || pkg.eventId !== input.eventId || pkg.isArchived) {
      log.warn("db:not_found — package does not belong to event");
      return {
        success: false,
        error: "That package doesn't belong to this event",
        orderId: null,
      };
    }

    // ─── Pricing (admin enters a flat BDT discount) ───
    const subtotal = Number(pkg.price) * input.qty;
    const discount = Math.min(
      Math.max(0, Math.round(input.discount)),
      subtotal,
    );
    const total = subtotal - discount;

    // No gateway is involved, so payment status simply follows the order
    // status the admin picked. CANCELLED can't be picked at creation.
    const paymentStatus =
      input.orderStatus === "CONFIRMED" ? "PAID" : "PENDING";

    log.info({ subtotal, discount, total }, "order:pricing_calculated");

    const bibNumber = clean(input.bibNumber);
    const email = clean(input.email)?.toLowerCase() ?? null;
    const phone = stripPhone(input.phone.trim());
    const { firstName, lastName } = splitName(input.fullName);

    log.info("db:transaction_start");
    const txStart = Date.now();

    const orderId = await prisma.$transaction(async (tx) => {
      // 1. Claim the slot. `updateMany` with the guard in the WHERE means two
      //    concurrent writers can't both pass the check — one matches zero
      //    rows and we bail. Never read-then-write here.
      const claimed = await tx.package.updateMany({
        where: {
          id: pkg.id,
          usedSlots: { lte: pkg.availableSlots - input.qty },
        },
        data: { usedSlots: { increment: input.qty } },
      });
      if (claimed.count === 0) throw new Error("NO_SLOTS");

      // 2. Resolve the participant.
      //    With an email we look up first, so a walk-in who already has an
      //    account gets the order attached to it. Without one we mint a guest.
      let participantId: string;

      const existing = email
        ? await tx.user.findUnique({ where: { email }, select: { id: true } })
        : null;

      if (existing) {
        participantId = existing.id;
      } else {
        const uuid = crypto.randomUUID();
        const created = await tx.user.create({
          data: {
            authId: `manual_${uuid}`,
            // Full uuid in the local part — plenty of entropy for the @unique.
            email: email ?? `manual_${uuid}@manual.local`,
            firstName,
            lastName,
            phone,
            isGuest: true,
            role: "USER",
            isActive: true,
            isArchived: false,
          },
        });
        participantId = created.id;
      }

      // 3. BIB uniqueness — @@unique([eventId, bibNumber])
      if (bibNumber) {
        const taken = await tx.registration.findFirst({
          where: { eventId: input.eventId, bibNumber },
          select: { id: true },
        });
        if (taken) throw new Error("BIB_TAKEN");
      }

      // 4. Order
      const order = await tx.order.create({
        data: {
          userId: participantId,
          eventId: input.eventId,
          packageId: pkg.id,
          qty: input.qty,
          subtotal,
          discount,
          total,
          status: input.orderStatus,
          source: "MANUAL",
          createdById: admin.id,
          adminNote: clean(input.adminNote),
        },
      });

      // 5. Registration
      await tx.registration.create({
        data: {
          orderId: order.id,
          eventId: input.eventId,
          bibNumber,
          fullName: input.fullName.trim(),
          email,
          phone,
          gender: input.gender,
          birthDate: new Date(input.birthDate),
          ageCategory: input.ageCategory,
          bloodGroup: input.bloodGroup,
          tshirtSize: input.tshirtSize,
          runnerCategory: input.runnerCategory,
          communityName: clean(input.communityName),
          emergencyContactName: clean(input.emergencyContactName),
          emergencyContactNumber: clean(input.emergencyContactNumber)
            ? stripPhone(input.emergencyContactNumber.trim())
            : null,
        },
      });

      // 6. Payment — no gateway involved, but the row still gets written so
      //    stats, filters, CSV export and the revenue footer keep working
      //    without a special case for manual orders.
      //    transactionId / paymentId stay null, never "": both are @unique,
      //    so an empty string would collide on the second manual entry.
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: Math.round(total),
          currency: "BDT",
          status: paymentStatus,
          paymentMethod: "MANUAL",
          paymentGateway: "MANUAL",
        },
      });

      return order.id;
    });

    log.info(
      {
        orderId,
        total,
        db: { operation: "transaction", durationMs: Date.now() - txStart },
      },
      "db:transaction_success",
    );

    revalidatePath("/profile");
    revalidateTag(`event-${pkg.event.slug}`, "max");
    revalidateTag("events", "max");

    log.info({ orderId, durationMs: Date.now() - start }, "action:success");

    return { success: true, error: null, orderId };
  } catch (err: any) {
    log.error({ err, durationMs: Date.now() - start }, "action:error");

    if (err?.message === "NO_SLOTS")
      return {
        success: false,
        error: "Not enough slots left in this package",
        orderId: null,
      };

    if (err?.message === "BIB_TAKEN")
      return {
        success: false,
        error: "That BIB number is already used in this event",
        orderId: null,
      };

    // Lost a race on User.email between the findUnique and the create.
    if (err?.code === "P2002")
      return {
        success: false,
        error: "That email is already registered — try again",
        orderId: null,
      };

    console.error("Manual registration error:", err?.message);
    return {
      success: false,
      error: "Couldn't save the registration. Try again.",
      orderId: null,
    };
  } finally {
    await log.flush();
  }
}
