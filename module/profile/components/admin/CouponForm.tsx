"use client";

import { useState } from "react";
import type { Coupon, CouponEvent } from "./AdminCouponsPanel";
import {
  createCoupon,
  updateCoupon,
  getAllCoupons,
} from "@/app/actions/coupon";
import Input from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2, Save } from "lucide-react";

type CouponFormProps = {
  coupon: Coupon | null;
  events: CouponEvent[];
  onSuccess: (coupons: Coupon[]) => void;
  onCancel: () => void;
};

type FormData = {
  code: string;
  eventId: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  maxUses: string;
  maxUsesPerUser: string;
  minOrderAmount: string;
  maxDiscount: string;
  validFrom: string;
  validUntil: string;
};

export function CouponForm({
  coupon,
  events,
  onSuccess,
  onCancel,
}: CouponFormProps) {
  const isEditing = !!coupon;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<FormData>({
    code: coupon?.code || "",
    eventId: coupon?.event.id || "",
    discountType: coupon?.discountType || "PERCENTAGE",
    discountValue: coupon?.discountValue?.toString() || "",
    maxUses: coupon?.maxUses?.toString() || "",
    maxUsesPerUser: coupon?.maxUsesPerUser?.toString() || "1",
    minOrderAmount: coupon?.minOrderAmount?.toString() || "",
    maxDiscount: coupon?.maxDiscount?.toString() || "",
    validFrom: coupon?.validFrom
      ? new Date(coupon.validFrom).toISOString().slice(0, 16)
      : "",
    validUntil: coupon?.validUntil
      ? new Date(coupon.validUntil).toISOString().slice(0, 16)
      : "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!form.code) {
      setError("Coupon code is required");
      return;
    }
    if (!form.eventId) {
      setError("Event is required");
      return;
    }
    if (!form.discountValue || parseFloat(form.discountValue) <= 0) {
      setError("Discount value is required");
      return;
    }
    if (!form.validFrom) {
      setError("Valid from date is required");
      return;
    }
    if (!form.validUntil) {
      setError("Valid until date is required");
      return;
    }
    if (new Date(form.validFrom) >= new Date(form.validUntil)) {
      setError("Valid until must be after valid from");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (isEditing && coupon) {
        result = await updateCoupon(coupon.id, {
          code: form.code,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          maxUsesPerUser: parseInt(form.maxUsesPerUser) || 1,
          minOrderAmount: form.minOrderAmount
            ? parseFloat(form.minOrderAmount)
            : null,
          maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
          validFrom: new Date(form.validFrom),
          validUntil: new Date(form.validUntil),
        });
      } else {
        result = await createCoupon({
          code: form.code,
          eventId: form.eventId,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
          maxUsesPerUser: parseInt(form.maxUsesPerUser) || 1,
          minOrderAmount: form.minOrderAmount
            ? parseFloat(form.minOrderAmount)
            : undefined,
          maxDiscount: form.maxDiscount
            ? parseFloat(form.maxDiscount)
            : undefined,
          validFrom: new Date(form.validFrom),
          validUntil: new Date(form.validUntil),
        });
      }

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      const { coupons } = await getAllCoupons();
      onSuccess(coupons as Coupon[]);
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isEditing ? "Edit Coupon" : "Create New Coupon"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Code & Event */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.code}
              onChange={(e) =>
                updateField("code", e.target.value.toUpperCase())
              }
              placeholder="e.g. SUMMER20"
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Event <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.eventId}
              onValueChange={(val) => updateField("eventId", val)}
              disabled={isEditing}
            >
              <SelectTrigger className="h-11 rounded-lg border border-gray-200 bg-gray-50">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Discount Type & Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.discountType}
              onValueChange={(val) => updateField("discountType", val)}
            >
              <SelectTrigger className="h-11 rounded-lg border border-gray-200 bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                <SelectItem value="FIXED">Fixed Amount (৳)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Discount Value <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={form.discountValue}
              onChange={(e) => updateField("discountValue", e.target.value)}
              placeholder={
                form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 500"
              }
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
              min="0"
            />
          </div>
        </div>

        {/* Usage Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Max Uses{" "}
              <span className="text-gray-400 font-normal normal-case">
                (optional)
              </span>
            </label>
            <Input
              type="number"
              value={form.maxUses}
              onChange={(e) => updateField("maxUses", e.target.value)}
              placeholder="Unlimited"
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Per User Limit
            </label>
            <Input
              type="number"
              value={form.maxUsesPerUser}
              onChange={(e) => updateField("maxUsesPerUser", e.target.value)}
              placeholder="1"
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
              min="1"
            />
          </div>
        </div>

        {/* Order Constraints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Min Order (৳){" "}
              <span className="text-gray-400 font-normal normal-case">
                (optional)
              </span>
            </label>
            <Input
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => updateField("minOrderAmount", e.target.value)}
              placeholder="No minimum"
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Max Discount (৳){" "}
              <span className="text-gray-400 font-normal normal-case">
                (optional)
              </span>
            </label>
            <Input
              type="number"
              value={form.maxDiscount}
              onChange={(e) => updateField("maxDiscount", e.target.value)}
              placeholder="No cap"
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
              min="0"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Caps the discount for percentage-based coupons
            </p>
          </div>
        </div>

        {/* Validity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Valid From <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={form.validFrom}
              onChange={(e) => updateField("validFrom", e.target.value)}
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Valid Until <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={form.validUntil}
              onChange={(e) => updateField("validUntil", e.target.value)}
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <p className="text-green-600 text-sm font-medium">
              Coupon {isEditing ? "updated" : "created"} successfully!
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? "Update Coupon" : "Create Coupon"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
