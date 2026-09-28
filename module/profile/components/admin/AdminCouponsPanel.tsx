// app/(site)/profile/components/admin/AdminCouponsPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
} from "@/app/actions/coupon";
import { CouponForm } from "./CouponForm";
import {
  Plus,
  ArrowLeft,
  Tag,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  Users,
  ToggleLeft,
  ToggleRight,
  Package,
} from "lucide-react";

// Updated types
export type CouponPackage = {
  id: number;
  name: string;
  distance: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  scopeType: "EVENT" | "PACKAGE";
  event: { id: string; name: string };
  packages: CouponPackage[];
  _count: { usages: number };
};

export type CouponEvent = { id: string; name: string };

type Props = {
  initialCoupons: Coupon[];
  events: CouponEvent[];
};

type View = "list" | "create" | "edit";

export function AdminCouponsPanel({ initialCoupons, events }: Props) {
  const [view, setView] = useState<View>("list");
  const [coupons, setCoupons] = useState(initialCoupons);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  const isExpired = (d: string) => new Date(d) < new Date();
  const isScheduled = (d: string) => new Date(d) > new Date();

  const activeCoupons = coupons.filter(
    (c) => c.isActive && !isExpired(c.validUntil),
  );
  const expiredCoupons = coupons.filter((c) => isExpired(c.validUntil));
  const totalUsages = coupons.reduce((sum, c) => sum + c._count.usages, 0);

  const refreshCoupons = async () => {
    const { coupons: updated } = await getAllCoupons();
    setCoupons(updated as Coupon[]);
    return updated as Coupon[];
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setView("create");
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setView("edit");
  };

  const handleBack = () => {
    setView("list");
    setEditingCoupon(null);
  };

  const handleSuccess = (updatedCoupons: Coupon[]) => {
    setCoupons(updatedCoupons);
    setView("list");
    setEditingCoupon(null);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setLoadingId(coupon.id);
    await updateCoupon(coupon.id, { isActive: !coupon.isActive });
    await refreshCoupons();
    setLoadingId(null);
  };

  const handleDelete = async (coupon: Coupon) => {
    setConfirmDelete(null);
    setFlash(null);
    setLoadingId(coupon.id);
    const result = await deleteCoupon(coupon.id);
    if (result.success) {
      await refreshCoupons();
      setFlash({ ok: true, text: result.message ?? `${coupon.code} deleted.` });
    } else {
      setFlash({ ok: false, text: result.error ?? "Failed to delete coupon." });
    }
    setLoadingId(null);
  };

  return (
    <div>
      {confirmDelete && (
        <DeleteCouponDialog
          coupon={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}
      {flash && (
        <div
          className={`mb-4 p-3 rounded-lg border text-sm font-medium flex items-start justify-between gap-2 ${
            flash.ok ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"
          }`}
          role="status"
        >
          <span>{flash.text}</span>
          <button onClick={() => setFlash(null)} className="opacity-60 hover:opacity-100 cursor-pointer" title="Dismiss">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {view === "list" ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Manage Coupons
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-5 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Create Coupon
            </button>
          </>
        ) : (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Coupons
          </button>
        )}
      </div>

      {/* Content */}
      {view === "list" && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total", value: coupons.length, icon: Tag },
              {
                label: "Active",
                value: activeCoupons.length,
                icon: ToggleRight,
              },
              {
                label: "Expired",
                value: expiredCoupons.length,
                icon: Calendar,
              },
              { label: "Total Uses", value: totalUsages, icon: Users },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={14} className="text-gray-400" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
                <p className="text-2xl font-black text-gray-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Coupon Cards */}
          {coupons.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No coupons yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Create one to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => {
                const expired = isExpired(coupon.validUntil);
                const scheduled = isScheduled(coupon.validFrom);

                return (
                  <div
                    key={coupon.id}
                    className={`bg-white border rounded-xl p-4 transition-all ${
                      coupon.isActive && !expired
                        ? "border-green-300 ring-1 ring-green-100"
                        : expired
                          ? "border-gray-200 opacity-60"
                          : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Tag
                              size={16}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="font-mono font-black text-lg text-gray-900 tracking-wider">
                              {coupon.code}
                            </span>
                          </div>

                          {expired ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-gray-100 text-gray-500 rounded-full">
                              Expired
                            </span>
                          ) : scheduled ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 rounded-full">
                              Scheduled
                            </span>
                          ) : coupon.isActive ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-green-500 text-white rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-red-100 text-red-600 rounded-full">
                              Inactive
                            </span>
                          )}

                          {/* NEW: Scope indicator */}
                          {coupon.scopeType === "PACKAGE" ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-indigo-100 text-indigo-600 rounded-full flex items-center gap-1">
                              <Package size={10} />
                              {coupon.packages.length} Package
                              {coupon.packages.length !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-100 text-blue-600 rounded-full">
                              All Packages
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {coupon.event.name}
                        </p>

                        {/* NEW: Show applicable packages if scope is PACKAGE */}
                        {coupon.scopeType === "PACKAGE" &&
                          coupon.packages.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {coupon.packages.map((pkg) => (
                                <span
                                  key={pkg.id}
                                  className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded font-medium"
                                >
                                  {pkg.name} ({pkg.distance})
                                </span>
                              ))}
                            </div>
                          )}

                        <p className="text-sm font-medium text-gray-700 mt-2">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.discountValue}% off`
                            : `৳${coupon.discountValue} off`}
                          {coupon.maxDiscount &&
                            ` · Max ৳${coupon.maxDiscount}`}
                          {coupon.minOrderAmount &&
                            ` · Min order ৳${coupon.minOrderAmount}`}
                        </p>

                        {/* Pills */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded-full font-medium">
                            📅{" "}
                            {new Date(coupon.validFrom).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}{" "}
                            –{" "}
                            {new Date(coupon.validUntil).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] bg-purple-50 text-purple-600 rounded-full font-medium">
                            👥 {coupon._count.usages}
                            {coupon.maxUses ? `/${coupon.maxUses}` : ""} used
                          </span>
                          <span className="px-2 py-0.5 text-[10px] bg-orange-50 text-orange-600 rounded-full font-medium">
                            🔄 {coupon.maxUsesPerUser}/user
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {loadingId === coupon.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(coupon)}
                              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                coupon.isActive
                                  ? "text-green-500 hover:text-red-600 hover:bg-red-50"
                                  : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                              }`}
                              title={
                                coupon.isActive ? "Deactivate" : "Activate"
                              }
                            >
                              {coupon.isActive ? (
                                <ToggleRight size={15} />
                              ) : (
                                <ToggleLeft size={15} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(coupon)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(coupon)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {(view === "create" || view === "edit") && (
        <CouponForm
          coupon={editingCoupon}
          events={events}
          onSuccess={handleSuccess}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}

// ─── Delete confirmation ─────────────────────────────
function DeleteCouponDialog({
  coupon,
  onCancel,
  onConfirm,
}: {
  coupon: Coupon;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const used = coupon._count.usages;

  useEffect(() => {
    cancelRef.current?.focus(); // a stray Enter shouldn't delete
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-coupon-title">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div className="min-w-0">
            <h3 id="delete-coupon-title" className="text-base font-bold text-gray-900">
              Delete coupon <span className="font-mono">{coupon.code}</span>?
            </h3>
            <p className="text-sm text-gray-600 mt-1.5">
              {used > 0
                ? `It has been used ${used} time${used === 1 ? "" : "s"}, so it will be removed from this list and can't be used again. Orders that used it keep it in their history.`
                : "It has never been used and will be permanently deleted."}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
          >
            Delete coupon
          </button>
        </div>
      </div>
    </div>
  );
}
