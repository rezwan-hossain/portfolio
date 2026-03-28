// module/profile/components/admin/EventOrdersModal.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getEventOrders } from "@/app/actions/admin";
import type { AdminEvent, EventOrder, OrderFilterState } from "@/types/profile";
import { OrderStatsRow } from "./OrderStatsRow";
import { OrderFilters } from "./OrderFilters";
import { OrderCard } from "./OrderCard";
import { X, Loader2, ShoppingBag, Download, RefreshCw } from "lucide-react";

type Props = {
  event: AdminEvent;
  onClose: () => void;
};

export function EventOrdersModal({ event, onClose }: Props) {
  const [orders, setOrders] = useState<EventOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilterState>({
    search: "",
    paymentStatus: "all",
    orderStatus: "all",
    sortBy: "newest",
  });

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
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

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
      "Order Status",
      "Registration Name",
      "User Email",
      "Phone",
      "Gender",
      "Age Category",
      "Blood Group",
      "T-Shirt Size",
      "Runner Category",
      "Community",
      "Package",
      "Distance",
      "Qty",
      "Package Price",
      "Payment Amount",
      "Payment Status",
      "Payment Method",
      "Transaction ID",
      "Emergency Contact",
      "Emergency Phone",
      "Order Date",
    ];

    const rows = filteredOrders.map((order) => [
      order.id,
      order.status,
      `"${order.registration?.fullName || ""}"`,
      order.user.email,
      `"${order.registration?.phone || order.user.phone || ""}"`,
      order.registration?.gender || "",
      order.registration?.ageCategory || "",
      order.registration?.bloodGroup || "",
      order.registration?.tshirtSize || "",
      order.registration?.runnerCategory || "",
      `"${order.registration?.communityName || ""}"`,
      `"${order.package.name}"`,
      order.package.distance,
      order.qty,
      order.package.price,
      order.payment?.amount || "",
      order.payment?.status || "N/A",
      order.payment?.paymentMethod || "",
      order.payment?.transactionId || "",
      `"${order.registration?.emergencyContactName || ""}"`,
      order.registration?.emergencyContactNumber || "",
      new Date(order.createdAt).toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {event.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Order Management · {orders.length} total order
              {orders.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
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
          {loading ? (
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
                Orders will appear here once people register
              </p>
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
                    onClick={() =>
                      setFilters({
                        search: "",
                        paymentStatus: "all",
                        orderStatus: "all",
                        sortBy: "newest",
                      })
                    }
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
        {!loading && orders.length > 0 && (
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
