// module/checkout/components/CouponInput.tsx
"use client";

import { useState } from "react";
import { validateCoupon } from "@/app/actions/coupon";
import { AppliedCoupon } from "@/types/checkout";
import { Loader2, Tag, X, Check } from "lucide-react";

type CouponInputProps = {
  eventId: string;
  packageId: number; // Optional, only needed if validating package-specific coupons
  orderAmount: number;
  appliedCoupon: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon, finalPrice: number) => void;
  onRemove: () => void;
};

export function CouponInput({
  eventId,
  orderAmount,
  appliedCoupon,
  packageId,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await validateCoupon(
        code,
        eventId,
        packageId,
        orderAmount,
      );

      if (!result.valid || !result.coupon) {
        setError(result.error || "Invalid coupon");
        setLoading(false);
        return;
      }

      onApply(
        {
          code: result.coupon.code,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discountValue,
          discountAmount: result.discountAmount!,
        },
        result.finalPrice!,
      );

      setSuccess(`Coupon applied! You save ৳${result.discountAmount}`);
      setCode("");
    } catch {
      setError("Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onRemove();
    setSuccess("");
    setError("");
  };

  // ── Applied state ──
  if (appliedCoupon) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">
              {appliedCoupon.code}
            </span>
            <span className="text-sm text-green-600">
              {appliedCoupon.discountType === "PERCENTAGE"
                ? `${appliedCoupon.discountValue}% off`
                : `৳${appliedCoupon.discountValue} off`}
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="text-green-600 hover:text-green-800 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-green-600 mt-1">
          You save ৳{appliedCoupon.discountAmount}
        </p>
      </div>
    );
  }

  // ── Input state ──
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Have a coupon code?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="Enter coupon code"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent uppercase"
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <Check className="h-4 w-4" />
          {success}
        </p>
      )}
    </div>
  );
}
