// lib/notification-log.ts
//
// Delivery log: every confirmation email/SMS attempt is recorded against its
// order (in the audit log, action "notification.<channel>_<status>"), so an
// admin can answer "did they get it?" per order. Never throws.
//
// ⚠️ Not a "use server" file — called only from trusted server code.

import { audit, SYSTEM } from "@/lib/audit";

export type DeliveryChannel = "email" | "sms";
export type DeliveryStatus = "sent" | "failed" | "skipped";

export async function recordDelivery(entry: {
  orderId: string;
  eventId?: string | null;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  to: string | null;
  /** Why it failed or was skipped. */
  reason?: string | null;
  /** Provider reference (Resend message id) or raw gateway reply. */
  providerRef?: string | null;
  /** The SMS text that was sent (emails are too long to store). */
  message?: string | null;
  /** Extra context, e.g. "resent by admin@…". */
  note?: string | null;
}): Promise<void> {
  const label = entry.channel === "email" ? "Email" : "SMS";
  const verb =
    entry.status === "sent" ? "sent to" : entry.status === "failed" ? "FAILED to" : "not sent to";
  const to = entry.to ?? "no address";

  await audit({
    actor: SYSTEM.notifier,
    action: `notification.${entry.channel}_${entry.status}`,
    entityType: "order",
    entityId: entry.orderId,
    eventId: entry.eventId ?? null,
    summary: `Confirmation ${label} ${verb} ${to}${entry.reason ? ` — ${entry.reason}` : ""}${entry.note ? ` · ${entry.note}` : ""}`,
    changes: {
      channel: [null, entry.channel],
      status: [null, entry.status],
      to: [null, entry.to],
      ...(entry.reason ? { reason: [null, entry.reason] } : {}),
      ...(entry.providerRef ? { providerRef: [null, entry.providerRef.slice(0, 300)] } : {}),
      ...(entry.message ? { message: [null, entry.message] } : {}),
    },
  });
}
