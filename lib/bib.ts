// lib/bib.ts
import { prisma } from "@/lib/prisma";

/**
 * Auto-assigns the next sequential BIB number for a registration within an event.
 * Uses a Prisma transaction with row-level checks to prevent race conditions.
 *
 * The @@unique([eventId, bibNumber]) constraint in your schema is the final
 * safety net — if two requests somehow compute the same BIB, the second
 * INSERT will fail at the DB level rather than creating a duplicate.
 */
export async function assignNextBib(
  eventId: string,
  registrationId: string,
): Promise<{
  success: boolean;
  bibNumber: string | null;
  error: string | null;
}> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the registration, confirm it exists and belongs to this event
      const registration = await tx.registration.findUnique({
        where: { id: registrationId },
        select: { bibNumber: true, eventId: true },
      });

      if (!registration) {
        throw new Error("Registration not found");
      }

      if (registration.eventId !== eventId) {
        throw new Error("Registration does not belong to this event");
      }

      // 2. Already has a BIB — return it, don't reassign
      if (registration.bibNumber) {
        return { bibNumber: registration.bibNumber, skipped: true };
      }

      // 3. Find the highest numeric BIB in this event
      const lastBib = await tx.registration.findFirst({
        where: {
          eventId,
          bibNumber: { not: null },
        },
        orderBy: { bibNumber: "desc" },
        select: { bibNumber: true },
      });

      // 4. Calculate the next BIB
      let nextNumber = 1;
      if (lastBib?.bibNumber) {
        const numericPart = lastBib.bibNumber.replace(/\D/g, "");
        nextNumber = (parseInt(numericPart, 10) || 0) + 1;
      }

      const bibNumber = String(nextNumber).padStart(4, "0");

      // 5. Write it — the @@unique([eventId, bibNumber]) constraint
      //    guarantees no duplicates even under concurrent requests
      await tx.registration.update({
        where: { id: registrationId },
        data: { bibNumber },
      });

      return { bibNumber, skipped: false };
    });

    return {
      success: true,
      bibNumber: result.bibNumber,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign BIB";
    console.error(`[assignNextBib] error for reg=${registrationId}:`, message);
    return { success: false, bibNumber: null, error: message };
  }
}

/**
 * High-level helper: given an orderId, checks every precondition
 * (order CONFIRMED, payment PAID, registration exists, no BIB yet)
 * and assigns a BIB if everything is met.
 *
 * Safe to call repeatedly — it's idempotent.
 */
export async function tryAssignBibForOrder(orderId: string): Promise<{
  success: boolean;
  bibNumber: string | null;
  error: string | null;
}> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        eventId: true,
        registration: {
          select: { id: true, bibNumber: true },
        },
        payment: {
          select: { status: true },
        },
      },
    });

    if (!order) {
      return { success: false, bibNumber: null, error: "Order not found" };
    }

    if (!order.registration) {
      return {
        success: false,
        bibNumber: null,
        error: "No registration linked to this order",
      };
    }

    // Already assigned — return the existing BIB
    if (order.registration.bibNumber) {
      return {
        success: true,
        bibNumber: order.registration.bibNumber,
        error: null,
      };
    }

    // Gate: both conditions must be true
    const isConfirmed = order.status === "CONFIRMED";
    const isPaid = order.payment?.status === "PAID";

    if (!isConfirmed || !isPaid) {
      return {
        success: false,
        bibNumber: null,
        error: `Not ready: order=${order.status}, payment=${order.payment?.status ?? "NO_PAYMENT"}`,
      };
    }

    return await assignNextBib(order.eventId, order.registration.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign BIB";
    console.error(
      `[tryAssignBibForOrder] error for order=${orderId}:`,
      message,
    );
    return { success: false, bibNumber: null, error: message };
  }
}
