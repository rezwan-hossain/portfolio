// module/profile/components/admin/EventOrdersModal.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getEventOrders } from "@/app/actions/admin";
import type { AdminEvent, EventOrder, OrderFilterState } from "@/types/profile";
import { OrderStatsRow } from "./OrderStatsRow";
import { OrderFilters } from "./OrderFilters";
import { OrderCard } from "./OrderCard";
import { ManualRegistrationForm } from "./ManualRegistrationForm";
import {
  X,
  Loader2,
  ShoppingBag,
  Download,
  RefreshCw,
  UserPlus,
  ArrowLeft,
} from "lucide-react";

type View = "list" | "create";

type Props = {
  event: AdminEvent;
  onClose: () => void;
  /** Open straight into the manual registration form. */
  initialView?: View;
};

const DEFAULT_FILTERS: OrderFilterState = {
  search: "",
  paymentStatus: "all",
  orderStatus: "all",
  source: "all",
  sortBy: "newest",
};

const formatBirthDate = (date: Date | string): string => {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

/** RFC-4180 escaping — quote only when needed, double any inner quotes. */
const esc = (value: unknown): string => {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function EventOrdersModal({ event, onClose, initialView }: Props) {
  const [view, setView] = useState<View>(initialView ?? "list");
  const [orders, setOrders] = useState<EventOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilterState>(DEFAULT_FILTERS);

  const modalRef = useRef<HTMLDivElement>(null);

  // ─── Load Orders ──────────────────────────────────
  const loadOrders = useCallback(async () => {
    const { orders: data } = await getEventOrders(event.id);
    setOrders(data);
  }, [event.id]);

  useEffect(() => {
    const init = async () => {
      await loadOrders();
      setLoading(false);
    };
    init();
  }, [loadOrders]);

  // ─── Close on Escape ─────────────────────────────
  // While the form is open, Escape steps back to the list instead of
  // discarding everything the admin has typed.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (view === "create") setView("list");
      else onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, view]);

  // ─── Prevent body scroll ─────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ─── Refresh ──────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // ─── After a manual registration ─────────────────
  const handleManualSuccess = async () => {
    setView("list");
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // ─── Optimistic Status Update ────────────────────
  const handleStatusChange = (
    orderId: string,
    newOrderStatus: string,
    newPaymentStatus: string,
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newOrderStatus,
              payment: o.payment
                ? { ...o.payment, status: newPaymentStatus }
                : null,
            }
          : o,
      ),
    );
  };

  // ─── Filter + Sort ───────────────────────────────
  const filteredOrders = orders
    .filter((order) => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const regName = order.registration?.fullName?.toLowerCase() || "";
        const userName = `${order.user.firstName || ""} ${
          order.user.lastName || ""
        }`.toLowerCase();
        const match =
          regName.includes(q) ||
          userName.includes(q) ||
          order.registration?.bibNumber?.toLowerCase().includes(q) ||
          order.user.email.toLowerCase().includes(q) ||
          (order.user.phone && order.user.phone.includes(q)) ||
          (order.registration?.phone && order.registration.phone.includes(q)) ||
          (order.payment?.transactionId &&
            order.payment.transactionId.toLowerCase().includes(q)) ||
          order.id.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Order status
      if (
        filters.orderStatus !== "all" &&
        order.status !== filters.orderStatus
      ) {
        return false;
      }

      // Source
      if (filters.source !== "all" && order.source !== filters.source) {
        return false;
      }

      // Payment status
      if (filters.paymentStatus !== "all") {
        if (!order.payment) return false;
        if (order.payment.status !== filters.paymentStatus) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const amountA = a.payment?.amount || a.package.price * a.qty;
      const amountB = b.payment?.amount || b.package.price * b.qty;

      switch (filters.sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount_high":
          return amountB - amountA;
        case "amount_low":
          return amountA - amountB;
        default:
          return 0;
      }
    });

  // ─── CSV Export ───────────────────────────────────
  const exportCSV = () => {
    const headers = [
      "Order ID",
      "Source",
      "BIB Number",
      "Order Status",
      "Registration Name",
      "User Email",
      "Registration Email",
      "Phone",
      "Gender",
      "Age Category",
      "Birth Date",
      "Blood Group",
      "T-Shirt Size",
      "Runner Category",
      "Community",
      "Package",
      "Distance",
      "Qty",
      "Package Price",
      "Subtotal",
      "Discount",
      "Total",
      "Payment Amount",
      "Payment Status",
      "Payment Method",
      "Transaction ID",
      "Emergency Contact",
      "Emergency Phone",
      "Admin Note",
      "Order Date",
    ];

    const rows = filteredOrders.map((order) => [
      order.id,
      order.source,
      order.registration?.bibNumber || "",
      order.status,
      order.registration?.fullName || "",
      order.user.email,
      order.registration?.email || "",
      order.registration?.phone || order.user.phone || "",
      order.registration?.gender || "",
      order.registration?.ageCategory || "",
      order.registration?.birthDate
        ? formatBirthDate(order.registration.birthDate)
        : "",
      order.registration?.bloodGroup || "",
      order.registration?.tshirtSize || "",
      order.registration?.runnerCategory || "",
      order.registration?.communityName || "",
      order.package.name,
      order.package.distance,
      order.qty,
      order.package.price,
      order.subtotal,
      order.discount,
      order.total,
      order.payment?.amount ?? "",
      order.payment?.status || "N/A",
      order.payment?.paymentMethod || "",
      order.payment?.transactionId || "",
      order.registration?.emergencyContactName || "",
      order.registration?.emergencyContactNumber || "",
      order.adminNote || "",
      new Date(order.createdAt).toISOString(),
    ]);

    const csv = [
      headers.map(esc).join(","),
      ...rows.map((r) => r.map(esc).join(",")),
    ].join("\r\n");

    // UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.slug}-orders-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ─── Calculate footer revenue ────────────────────
  const filteredRevenue = filteredOrders.reduce(
    (sum, o) => sum + (o.payment?.amount || o.package.price * o.qty),
    0,
  );

  const isCreating = view === "create";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop — inert while the form is open so a stray click can't throw
          away a half-filled registration. */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isCreating ? undefined : onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          {isCreating ? (
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to orders
            </button>
          ) : (
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {event.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Order Management · {orders.length} total order
                {orders.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {!isCreating && (
              <>
                {/* Manual registration */}
                <button
                  onClick={() => setView("create")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer uppercase tracking-wider"
                  title="Register a participant manually"
                >
                  <UserPlus size={13} />
                  Manual
                </button>

                {/* Refresh */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh orders"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                </button>

                {/* Export */}
                {filteredOrders.length > 0 && (
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    <Download size={13} />
                    CSV
                  </button>
                )}
              </>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isCreating ? (
            <ManualRegistrationForm
              event={event}
              onCancel={() => setView("list")}
              onSuccess={handleManualSuccess}
            />
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-bold text-lg">No orders yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Orders appear here once people register
              </p>
              <button
                onClick={() => setView("create")}
                className="mt-5 flex items-center gap-2 px-5 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <UserPlus size={14} />
                Register someone manually
              </button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <OrderStatsRow orders={orders} />

              {/* Filters */}
              <OrderFilters
                filters={filters}
                onChange={setFilters}
                resultCount={filteredOrders.length}
                totalCount={orders.length}
              />

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-medium">
                    No orders match your filters
                  </p>
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="text-sm text-gray-900 font-bold mt-2 hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      expanded={expandedOrder === order.id}
                      onToggle={() =>
                        setExpandedOrder(
                          expandedOrder === order.id ? null : order.id,
                        )
                      }
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Footer ─── */}
        {!isCreating && !loading && orders.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50 rounded-b-2xl">
            <p className="text-xs text-gray-400">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <p className="text-xs font-bold text-gray-600">
              Total: ৳{filteredRevenue.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
