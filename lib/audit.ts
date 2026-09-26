// lib/audit.ts
//
// Append-only audit trail (AuditLog model). Call `audit()` after a change has
// succeeded. It never throws — a failed log write must never undo or fail the
// admin action it describes; failures go to the app logger instead.
//
// ⚠️ Not a "use server" file — only trusted server code writes the trail.

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getAuthUser, requireAdmin } from "@/lib/auth/require-admin";
import { getRequestId } from "@/utils/requestUtils";
import type { Prisma } from "@/lib/generated/prisma";

export type AuditEntityType =
  | "event"
  | "package"
  | "organizer"
  | "order"
  | "registration"
  | "payment"
  | "coupon"
  | "hero"
  | "gallery"
  | "team";

export type AuditChanges = Record<string, [unknown, unknown]>;

export type AuditActor = { id: string | null; label: string };

/** Well-known non-human actors. */
export const SYSTEM = {
  shurjopay: { id: null, label: "System · ShurjoPay" },
  sweep: { id: null, label: "System · slot hold sweep" },
} satisfies Record<string, AuditActor>;

// The signed-in admin for this request (requireAdmin is cached per request,
// so this costs no extra queries). Falls back to whoever is signed in, then
// to an explicit "not signed in" label so unguarded writes stand out.
async function currentActor(): Promise<AuditActor> {
  try {
    const { dbUser } = await requireAdmin();
    if (dbUser) return { id: dbUser.id, label: dbUser.email };
    const user = await getAuthUser();
    if (user) return { id: null, label: user.email ?? `auth:${user.id}` };
  } catch {
    // no request context (e.g. background sweep)
  }
  return { id: null, label: "Unknown (not signed in)" };
}

async function currentRequestId(): Promise<string | null> {
  try {
    return await getRequestId();
  } catch {
    return null;
  }
}

const normalise = (v: unknown): unknown => {
  if (v instanceof Date) return v.toISOString();
  if (v === undefined || v === "") return null;
  return v;
};

/**
 * Fields whose value differs between `before` and `after`, as
 * { field: [before, after] }. Only `fields` are compared, so secrets or noisy
 * columns (updatedAt) never land in the trail.
 */
export function diff<T extends Record<string, unknown>>(
  before: Partial<T> | null | undefined,
  after: Partial<T>,
  fields: (keyof T & string)[],
): AuditChanges {
  const out: AuditChanges = {};
  for (const f of fields) {
    if (!(f in after)) continue;
    const a = normalise(before?.[f]);
    const b = normalise(after[f]);
    if (JSON.stringify(a) !== JSON.stringify(b)) out[f] = [a, b];
  }
  return out;
}

export async function audit(entry: {
  action: string;
  entityType: AuditEntityType;
  entityId: string | number;
  summary: string;
  eventId?: string | null;
  changes?: AuditChanges | null;
  /** Omit to use the signed-in admin. */
  actor?: AuditActor;
}): Promise<void> {
  try {
    const actor = entry.actor ?? (await currentActor());
    const changes =
      entry.changes && Object.keys(entry.changes).length > 0
        ? (JSON.parse(JSON.stringify(entry.changes)) as Prisma.InputJsonValue)
        : undefined;

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorLabel: actor.label,
        action: entry.action,
        entityType: entry.entityType,
        entityId: String(entry.entityId),
        eventId: entry.eventId ?? null,
        summary: entry.summary.slice(0, 500),
        changes,
        requestId: await currentRequestId(),
      },
    });
  } catch (err) {
    logger.error(
      { err, action: entry.action, entityId: String(entry.entityId) },
      "audit:write_failed",
    );
  }
}
