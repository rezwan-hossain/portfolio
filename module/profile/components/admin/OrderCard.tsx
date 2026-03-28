// module/profile/components/admin/OrderCard.tsx
"use client";

import { useState } from "react";
import type { EventOrder } from "@/types/profile";
import { updateOrderStatus } from "@/app/actions/admin";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  CreditCard,
  User,
  Loader2,
  MoreHorizontal,
  Shirt,
  Heart,
  Users,
  Hash,
} from "lucide-react";

type Props = {
  order: EventOrder;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (
    orderId: string,
    orderStatus: string,
    paymentStatus: string,
  ) => void;
};

// ─── Status Configs ─────────────────────────────────
const ORDER_STATUS: Record<
  string,
  { icon: typeof CheckCircle; color: string; bg: string; label: string }
> = {
  CONFIRMED: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    label: "Confirmed",
  },
  PENDING: {
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    label: "Pending",
  },
  CANCELLED: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    label: "Cancelled",
  },
};

const PAYMENT_STATUS: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  PAID: { color: "text-green-700", bg: "bg-green-100", label: "Paid" },
  PENDING: { color: "text-yellow-700", bg: "bg-yellow-100", label: "Pending" },
  FAILED: { color: "text-red-700", bg: "bg-red-100", label: "Failed" },
  REFUNDED: {
    color: "text-orange-700",
    bg: "bg-orange-100",
    label: "Refunded",
  },
};

export function OrderCard({
  order,
  expanded,
  onToggle,
  onStatusChange,
}: Props) {
  const [showActions, setShowActions] = useState(false);
  const [updating, setUpdating] = useState(false);

  const orderConfig = ORDER_STATUS[order.status] || ORDER_STATUS.PENDING;
  const paymentConfig = order.payment
    ? PAYMENT_STATUS[order.payment.status] || PAYMENT_STATUS.PENDING
    : null;

  const OrderIcon = orderConfig.icon;

  // Use registration name if available, fallback to user name
  const displayName =
    order.registration?.fullName ||
    [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") ||
    order.user.email.split("@")[0];

  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const orderAmount = order.payment?.amount || order.package.price * order.qty;

  const handleStatusChange = async (
    newOrderStatus: string,
    newPaymentStatus: string,
  ) => {
    setUpdating(true);
    setShowActions(false);

    const result = await updateOrderStatus(
      order.id,
      newOrderStatus,
      newPaymentStatus,
    );

    if (result.success) {
      onStatusChange(order.id, newOrderStatus, newPaymentStatus);
    }

    setUpdating(false);
  };

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        expanded ? "shadow-sm " + orderConfig.bg : "border-gray-200 bg-white"
      }`}
    >
      {/* ─── Header Row ─── */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {order.user.image ? (
            <img
              src={order.user.image}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">
                {userInitials}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900 truncate">
              {displayName}
            </p>
            <span className="px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-600 rounded-full font-bold flex-shrink-0">
              {order.package.distance}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">
              {order.package.name}
              {order.qty > 1 ? ` × ${order.qty}` : ""}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Amount + Statuses */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-bold text-gray-900">
            ৳{orderAmount.toLocaleString()}
          </span>

          {/* Order Status */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${orderConfig.bg} ${orderConfig.color}`}
          >
            <OrderIcon size={11} />
            {orderConfig.label}
          </span>

          {/* Payment Status */}
          {paymentConfig && (
            <span
              className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${paymentConfig.bg} ${paymentConfig.color}`}
            >
              {paymentConfig.label}
            </span>
          )}

          {expanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* ─── Expanded Details ─── */}
      {expanded && (
        <div className="border-t border-gray-200/60 px-4 pb-4 pt-3 space-y-4">
          {/* ─── Contact Info ─── */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Contact
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-gray-400" />
                <a
                  href={`mailto:${order.user.email}`}
                  className="hover:text-gray-900 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {order.user.email}
                </a>
              </span>
              {(order.registration?.phone || order.user.phone) && (
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" />
                  <a
                    href={`tel:${order.registration?.phone || order.user.phone}`}
                    className="hover:text-gray-900 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.registration?.phone || order.user.phone}
                  </a>
                </span>
              )}
              <span className="text-gray-400">
                {new Date(order.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* ─── Registration Details ─── */}
          {order.registration && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Registration Details
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {
                    icon: User,
                    label: "Gender",
                    value: order.registration.gender,
                  },
                  {
                    icon: Shirt,
                    label: "T-Shirt",
                    value: order.registration.tshirtSize,
                  },
                  {
                    icon: Users,
                    label: "Age Category",
                    value: order.registration.ageCategory,
                  },
                  {
                    icon: Heart,
                    label: "Blood Group",
                    value: order.registration.bloodGroup,
                  },
                  {
                    icon: Hash,
                    label: "Runner Type",
                    value: order.registration.runnerCategory,
                  },
                  ...(order.registration.communityName
                    ? [
                        {
                          icon: Users,
                          label: "Community",
                          value: order.registration.communityName,
                        },
                      ]
                    : []),
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100"
                  >
                    <item.icon
                      size={12}
                      className="text-gray-400 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Contact */}
              {order.registration.emergencyContactName && (
                <div className="mt-2 p-2 bg-red-50/50 rounded-lg border border-red-100">
                  <p className="text-[9px] text-red-400 uppercase tracking-wider font-bold mb-0.5">
                    Emergency Contact
                  </p>
                  <p className="text-xs text-gray-700">
                    {order.registration.emergencyContactName}
                    {order.registration.emergencyContactNumber && (
                      <>
                        {" · "}
                        <a
                          href={`tel:${order.registration.emergencyContactNumber}`}
                          className="text-red-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {order.registration.emergencyContactNumber}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── Package & Payment ─── */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Package & Payment
            </p>
            <div className="p-3 bg-white rounded-lg border border-gray-100 space-y-2">
              {/* Package Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-600 rounded-full font-bold">
                    {order.package.distance}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.package.name}
                  </span>
                  {order.qty > 1 && (
                    <span className="text-xs text-gray-400">× {order.qty}</span>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-900">
                  ৳{(order.package.price * order.qty).toLocaleString()}
                </span>
              </div>

              {/* Payment Info */}
              {order.payment && (
                <>
                  <div className="border-t border-dashed border-gray-200 pt-2">
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                      {order.payment.paymentMethod && (
                        <span className="flex items-center gap-1">
                          <CreditCard size={12} className="text-gray-400" />
                          {order.payment.paymentMethod}
                          {order.payment.paymentGateway &&
                            ` via ${order.payment.paymentGateway}`}
                        </span>
                      )}
                      {order.payment.transactionId && (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Hash size={12} className="text-gray-400" />
                          {order.payment.transactionId}
                        </span>
                      )}
                      {order.payment.paymentId && (
                        <span className="text-gray-400 font-mono text-[11px]">
                          ID: {order.payment.paymentId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Amount Charged
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      ৳{Number(order.payment.amount).toLocaleString()}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        {order.payment.currency}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ─── Status Actions ─── */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Update Status
            </p>

            <div className="relative">
              {updating ? (
                <Loader2 size={16} className="animate-spin text-gray-400" />
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(!showActions);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <MoreHorizontal size={13} />
                    Change Status
                  </button>

                  {showActions && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(false);
                        }}
                      />

                      {/* Dropdown */}
                      <div className="absolute right-0 bottom-full mb-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1.5">
                        {/* Confirm + Mark Paid */}
                        {order.status !== "CONFIRMED" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange("CONFIRMED", "PAID");
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
                          >
                            <CheckCircle size={14} />
                            Confirm & Mark Paid
                          </button>
                        )}

                        {/* Mark Payment as Paid Only */}
                        {order.payment?.status !== "PAID" &&
                          order.status === "CONFIRMED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange("CONFIRMED", "PAID");
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
                            >
                              <CreditCard size={14} />
                              Mark as Paid
                            </button>
                          )}

                        {/* Set to Pending */}
                        {order.status !== "PENDING" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange("PENDING", "PENDING");
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-yellow-700 hover:bg-yellow-50 transition-colors cursor-pointer"
                          >
                            <Clock size={14} />
                            Set to Pending
                          </button>
                        )}

                        <div className="border-t border-gray-100 my-1" />

                        {/* Cancel Order */}
                        {order.status !== "CANCELLED" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  "Cancel this order? Slots will be freed.",
                                )
                              ) {
                                handleStatusChange("CANCELLED", "FAILED");
                              }
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <XCircle size={14} />
                            Cancel Order
                          </button>
                        )}

                        {/* Refund */}
                        {order.payment?.status === "PAID" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Mark this order as refunded?")) {
                                handleStatusChange("CANCELLED", "REFUNDED");
                              }
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-orange-700 hover:bg-orange-50 transition-colors cursor-pointer"
                          >
                            <AlertCircle size={14} />
                            Refund
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
