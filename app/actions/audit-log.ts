// app/actions/audit-log.ts
"use server";

// Read side of the audit trail (lib/audit.ts writes it). Admin only.

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { Prisma } from "@/lib/generated/prisma";
import type { AuditCategory, AuditEntry, AuditFilters } from "@/types/audit";

const PAGE_SIZE = 50;

// Entries a human has to act on (refunds, confirmations, reviews).
const ATTENTION_ACTIONS = [
  "payment.duplicate",
  "payment.paid_no_slot",
  "payment.amount_mismatch",
  "payment.unknown_status",
  "payment.paid_no_callback",
];

const CATEGORY_WHERE: Record<AuditCategory, Prisma.AuditLogWhereInput> = {
  all: {},
  attention: { action: { in: ATTENTION_ACTIONS } },
  orders: { entityType: { in: ["order", "registration"] } },
  payments: { entityType: "payment" },
  events: { entityType: { in: ["event", "package", "organizer"] } },
  coupons: { entityType: "coupon" },
  content: { entityType: { in: ["hero", "gallery", "team"] } },
};

export async function getAuditLogs(
  filters: AuditFilters,
  cursor?: string | null,
): Promise<{
  entries: AuditEntry[];
  nextCursor: string | null;
  error: string | null;
}> {
  const { error } = await requireAdmin();
  if (error) return { entries: [], nextCursor: null, error };

  try {
    const term = filters.search.trim();
    const rows = await prisma.auditLog.findMany({
      where: {
        ...CATEGORY_WHERE[filters.category],
        ...(filters.eventId !== "all" && { eventId: filters.eventId }),
        ...(term && {
          OR: [
            { summary: { contains: term, mode: "insensitive" } },
            { actorLabel: { contains: term, mode: "insensitive" } },
            { entityId: { startsWith: term.toLowerCase() } },
            { action: { contains: term, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PAGE_SIZE + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const page = rows.slice(0, PAGE_SIZE);
    return {
      entries: page.map((r) => ({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        actorId: r.actorId,
        actorLabel: r.actorLabel,
        action: r.action,
        entityType: r.entityType,
        entityId: r.entityId,
        eventId: r.eventId,
        summary: r.summary,
        changes: (r.changes as AuditEntry["changes"]) ?? null,
        requestId: r.requestId,
      })),
      nextCursor: rows.length > PAGE_SIZE ? page[page.length - 1].id : null,
      error: null,
    };
  } catch (err) {
    console.error("getAuditLogs error:", err);
    return { entries: [], nextCursor: null, error: "Failed to load the audit log" };
  }
}
