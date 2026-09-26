// types/audit.ts

export type AuditCategory =
  | "all"
  | "attention"
  | "orders"
  | "payments"
  | "events"
  | "coupons"
  | "content";

export type AuditFilters = {
  category: AuditCategory;
  eventId: string | "all";
  search: string;
};

export type AuditEntry = {
  id: string;
  createdAt: string;
  actorId: string | null;
  actorLabel: string;
  action: string;
  entityType: string;
  entityId: string;
  eventId: string | null;
  summary: string;
  changes: Record<string, [unknown, unknown]> | null;
  requestId: string | null;
};
