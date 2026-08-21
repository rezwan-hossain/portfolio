// app/actions/event-orders.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { EventOrder, OrderQuery, OrderStats } from "@/types/profile";

// The relation fields the order list needs. Kept in one place so the paged
// query and the export query can't drift apart.
const ORDER_INCLUDE = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      image: true,
      isGuest: true,
    },
  },
  package: {
    select: { id: true, name: true, distance: true, price: true },
  },
  registration: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      gender: true,
      tshirtSize: true,
      ageCategory: true,
      bloodGroup: true,
      communityName: true,
      runnerCategory: true,
      emergencyContactName: true,
      emergencyContactNumber: true,
      bibNumber: true,
      email: true,
      birthDate: true,
    },
  },
  payment: {
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      transactionId: true,
      paymentId: true,
      paymentMethod: true,
      paymentGateway: true,
    },
  },
} as const;

const DEFAULT_QUERY: OrderQuery = {
  search: "",
  paymentStatus: "all",
  orderStatus: "all",
  source: "all",
  sortBy: "newest",
  page: 1,
  pageSize: 25,
};

/**
 * Translate the UI filter state into a Prisma `where`.
 * `mode: "insensitive"` is Postgres-only, which is what you're on.
 */
function buildWhere(eventId: string, q: OrderQuery) {
  const where: any = { eventId, isArchived: false };

  if (q.orderStatus !== "all") where.status = q.orderStatus;
  if (q.source !== "all") where.source = q.source;
  if (q.paymentStatus !== "all") {
    where.payment = { is: { status: q.paymentStatus } };
  }

  const term = q.search.trim();
  if (term) {
    where.OR = [
      { id: { contains: term, mode: "insensitive" } },
      {
        registration: {
          is: { fullName: { contains: term, mode: "insensitive" } },
        },
      },
      {
        registration: {
          is: { bibNumber: { contains: term, mode: "insensitive" } },
        },
      },
      { registration: { is: { phone: { contains: term } } } },
      {
        registration: {
          is: { email: { contains: term, mode: "insensitive" } },
        },
      },
      { user: { is: { firstName: { contains: term, mode: "insensitive" } } } },
      { user: { is: { lastName: { contains: term, mode: "insensitive" } } } },
      { user: { is: { email: { contains: term, mode: "insensitive" } } } },
      { user: { is: { phone: { contains: term } } } },
      {
        payment: {
          is: { transactionId: { contains: term, mode: "insensitive" } },
        },
      },
    ];
  }

  return where;
}

/**
 * Sort by `payment.amount` rather than `Order.total`.
 *
 * `total` was added to the schema later with @default(0), so orders created
 * before that migration would all sort as free. Every order gets a Payment
 * row, so amount is the value that's actually populated everywhere.
 */
function buildOrderBy(sortBy: OrderQuery["sortBy"]) {
  switch (sortBy) {
    case "oldest":
      return { createdAt: "asc" as const };
    case "amount_high":
      return { payment: { amount: "desc" as const } };
    case "amount_low":
      return { payment: { amount: "asc" as const } };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

/** Whole-event aggregates. Three queries, run alongside the page query. */
function statsQueries(eventId: string) {
  const base = { eventId, isArchived: false };
  return [
    prisma.order.groupBy({
      by: ["status"],
      where: base,
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { order: base },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { order: base, status: "PAID" },
      _sum: { amount: true },
    }),
  ] as const;
}

// ─── Paged order list + stats ───────────────────────
export async function getEventOrdersPaged(
  eventId: string,
  query: Partial<OrderQuery> = {},
) {
  const { error } = await requireAdmin();
  if (error) {
    return {
      orders: [] as EventOrder[],
      total: 0,
      page: 1,
      pageSize: 25,
      stats: null as OrderStats | null,
      error,
    };
  }

  const q: OrderQuery = { ...DEFAULT_QUERY, ...query };
  const pageSize = Math.min(Math.max(1, q.pageSize), 100);
  const page = Math.max(1, q.page);

  try {
    const where = buildWhere(eventId, q);
    const [countStatus, sumAll, sumPaid] = statsQueries(eventId);

    // Promise.all, NOT prisma.$transaction.
    //
    // These are read-only, so they don't need a shared snapshot — and the
    // transaction form costs a BEGIN and a COMMIT round trip *and* forces the
    // queries to run one after another. Run concurrently, five queries cost
    // roughly one round trip of wall-clock time instead of five.
    //
    // The stats ride along for free here: because they're parallel, folding
    // them in adds almost nothing, and it saves the client a second server
    // action (which would pay its own auth check and proxy hop).
    const [total, orders, byStatus, allPayments, paidPayments] =
      await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          orderBy: buildOrderBy(q.sortBy),
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: ORDER_INCLUDE,
        }),
        countStatus,
        sumAll,
        sumPaid,
      ]);

    const countOf = (status: string) =>
      byStatus.find((g) => g.status === status)?._count._all ?? 0;

    const stats: OrderStats = {
      total: byStatus.reduce((sum, g) => sum + g._count._all, 0),
      confirmed: countOf("CONFIRMED"),
      pending: countOf("PENDING"),
      cancelled: countOf("CANCELLED"),
      totalRevenue: allPayments._sum.amount ?? 0,
      paidRevenue: paidPayments._sum.amount ?? 0,
    };

    return {
      orders: JSON.parse(JSON.stringify(orders)) as EventOrder[],
      total,
      page,
      pageSize,
      stats,
      error: null,
    };
  } catch (err: any) {
    console.error("Get paged orders error:", err?.message);
    return {
      orders: [] as EventOrder[],
      total: 0,
      page: 1,
      pageSize,
      stats: null as OrderStats | null,
      error: "Failed to load orders",
    };
  }
}

// ─── Export ─────────────────────────────────────────
// CSV needs every matching row, not just the visible page. Its own action so
// the modal never holds them all just in case Export gets clicked.
export async function getEventOrdersForExport(
  eventId: string,
  query: Partial<OrderQuery> = {},
) {
  const { error } = await requireAdmin();
  if (error) return { orders: [] as EventOrder[], error };

  const q: OrderQuery = { ...DEFAULT_QUERY, ...query };

  try {
    const orders = await prisma.order.findMany({
      where: buildWhere(eventId, q),
      orderBy: buildOrderBy(q.sortBy),
      include: ORDER_INCLUDE,
      take: 20000, // ceiling so a runaway export can't exhaust memory
    });

    return {
      orders: JSON.parse(JSON.stringify(orders)) as EventOrder[],
      error: null,
    };
  } catch (err: any) {
    console.error("Export orders error:", err?.message);
    return { orders: [] as EventOrder[], error: "Failed to build export" };
  }
}
