// app/actions/payment-status.ts
"use server";

// Polled by the "Confirming your payment…" page. Public on purpose (the
// customer may be a guest), so it:
//   - returns only a status word — no names, amounts or contact details,
//   - needs the order's UUID (unguessable, only in the customer's redirect),
//   - asks ShurjoPay at most once per 15s per order, however often it's polled.

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { reconcileOrder } from "@/lib/payment-reconcile";

export type PaymentProgress =
  | "CONFIRMED" // paid and confirmed → success page
  | "PENDING" // still waiting for ShurjoPay
  | "NOT_PAID" // ShurjoPay says not paid / order cancelled → failed page
  | "REVIEW" // paid but needs an admin (amount mismatch / no slot)
  | "NOT_FOUND";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CHECK_EVERY_MS = 15_000;
const lastGatewayCheck = new Map<string, number>();

export async function getPaymentProgress(orderId: string): Promise<PaymentProgress> {
  if (typeof orderId !== "string" || !UUID.test(orderId)) return "NOT_FOUND";

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      payment: { select: { status: true, paymentId: true } },
    },
  });
  if (!order) return "NOT_FOUND";
  if (order.status === "CONFIRMED") return "CONFIRMED";
  if (order.payment?.status === "PAID") return "REVIEW"; // paid, order not confirmed
  if (order.status === "CANCELLED") return "NOT_PAID";
  if (!order.payment?.paymentId) return "NOT_PAID"; // never reached ShurjoPay

  // Still pending: ask ShurjoPay directly, throttled per order.
  const now = Date.now();
  if (now - (lastGatewayCheck.get(orderId) ?? 0) < CHECK_EVERY_MS) return "PENDING";
  lastGatewayCheck.set(orderId, now);
  if (lastGatewayCheck.size > 5_000) lastGatewayCheck.clear(); // bounded memory

  const log = logger.child({ action: "getPaymentProgress", orderId });
  try {
    const result = await reconcileOrder(orderId, { log });
    switch (result) {
      case "CONFIRMED":
      case "ALREADY_PAID":
        return "CONFIRMED";
      case "NEEDS_REVIEW":
      case "PAID_NO_SLOT":
        return "REVIEW";
      default:
        // NOT_PAID right after paying can just mean "not settled yet", and a
        // gateway error means "don't know" — keep waiting either way; the page
        // gives up politely after a couple of minutes.
        return "PENDING";
    }
  } catch (err) {
    log.error({ err }, "payment_progress:check_failed");
    return "PENDING";
  } finally {
    await log.flush();
  }
}
