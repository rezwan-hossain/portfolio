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
  /** The runner behind an order/payment/registration entry, looked up at read time. */
  subject: AuditSubject | null;
};

export type AuditSubject = {
  orderId: string;
  name: string;
  email: string | null;
  phone: string | null;
  packageName: string;
  eventName: string;
  orderStatus: string;
  paymentStatus: string | null;
};
