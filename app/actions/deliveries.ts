// app/actions/deliveries.ts
"use server";

// Read side of the delivery log (lib/notification-log.ts). Admin only.

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logger } from "@/lib/logger";
import { runPostPaymentSteps } from "@/lib/order-confirmation";

export type Delivery = {
  id: string;
  createdAt: string;
  channel: "email" | "sms";
  status: "sent" | "failed" | "skipped";
  to: string | null;
  reason: string | null;
  providerRef: string | null;
  message: string | null;
};

export async function getOrderDeliveries(
  orderId: string,
): Promise<{ deliveries: Delivery[]; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { deliveries: [], error };

  try {
    const rows = await prisma.auditLog.findMany({
      where: { entityId: orderId, action: { startsWith: "notification." } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const after = (c: unknown, key: string) => {
      const pair = (c as Record<string, [unknown, unknown]> | null)?.[key];
      return pair ? (pair[1] as string | null) : null;
    };
    return {
      deliveries: rows.map((r) => {
        const [channel, status] = r.action.replace("notification.", "").split("_") as [
          Delivery["channel"],
          Delivery["status"],
        ];
        return {
          id: r.id,
          createdAt: r.createdAt.toISOString(),
          channel,
          status,
          to: after(r.changes, "to"),
          reason: after(r.changes, "reason"),
          providerRef: after(r.changes, "providerRef"),
          message: after(r.changes, "message"),
        };
      }),
      error: null,
    };
  } catch (err) {
    console.error("getOrderDeliveries error:", err);
    return { deliveries: [], error: "Failed to load messages" };
  }
}

// ─── Resend ──────────────────────────────────────────
const RESEND_COOLDOWN_MS = 60_000;

/**
 * Send the confirmation email and/or SMS again for a paid order, to the
 * registration's CURRENT email/phone (so fixing a typo with "Edit registration"
 * and then resending works). Every attempt lands in the delivery log.
 */
export async function resendConfirmation(
  orderId: string,
  channel: "email" | "sms" | "both",
): Promise<{
  success: boolean;
  error: string | null;
  results?: { channel: Delivery["channel"]; status: Delivery["status"]; to: string | null; reason: string | null }[];
}> {
  const { error, dbUser } = await requireAdmin();
  if (error || !dbUser) return { success: false, error: error ?? "Unauthorized" };
  if (!["email", "sms", "both"].includes(channel)) return { success: false, error: "Unknown channel." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      payment: { select: { status: true, transactionId: true, paymentId: true, paymentMethod: true } },
    },
  });
  if (!order) return { success: false, error: "Order not found." };
  if (order.status !== "CONFIRMED") {
    return { success: false, error: "Only confirmed orders can be sent a confirmation." };
  }

  const channels: ("email" | "sms")[] = channel === "both" ? ["email", "sms"] : [channel];

  // Don't let a double click send twice.
  const recent = await prisma.auditLog.findFirst({
    where: {
      entityId: orderId,
      action: { in: channels.flatMap((c) => [`notification.${c}_sent`, `notification.${c}_failed`]) },
      createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_MS) },
    },
    select: { id: true },
  });
  if (recent) {
    return { success: false, error: "A message was just sent for this order — wait a minute before resending." };
  }

  const log = logger.child({ action: "resendConfirmation", orderId, channel, adminId: dbUser.id });
  const startedAt = new Date();
  try {
    await runPostPaymentSteps({
      orderId,
      transactionId: order.payment?.transactionId ?? order.payment?.paymentId ?? orderId,
      paymentMethod: order.payment?.paymentMethod ?? undefined,
      log,
      only: channels,
      resentBy: dbUser.email,
    });
  } finally {
    await log.flush();
  }

  // Report what actually happened (from the delivery log just written).
  const written = await prisma.auditLog.findMany({
    where: {
      entityId: orderId,
      action: { startsWith: "notification." },
      createdAt: { gte: startedAt },
    },
    orderBy: { createdAt: "asc" },
  });
  const after = (c: unknown, key: string) =>
    ((c as Record<string, [unknown, unknown]> | null)?.[key]?.[1] as string | null) ?? null;
  const results = written.map((r) => {
    const [ch, status] = r.action.replace("notification.", "").split("_") as [Delivery["channel"], Delivery["status"]];
    return { channel: ch, status, to: after(r.changes, "to"), reason: after(r.changes, "reason") };
  });
  return { success: results.some((r) => r.status === "sent"), error: null, results };
}
