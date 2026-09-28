// app/actions/deliveries.ts
"use server";

// Read side of the delivery log (lib/notification-log.ts). Admin only.

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

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
