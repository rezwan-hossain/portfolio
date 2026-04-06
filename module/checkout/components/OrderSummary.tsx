// module/checkout/components/OrderSummary.tsx
"use client";

import { CheckoutItem, AppliedCoupon } from "@/types/checkout";
import { CouponInput } from "./CouponInput";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface OrderSummaryProps {
  item: CheckoutItem;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onPlaceOrder: () => void;
  loading: boolean;

  // Coupon props
  appliedCoupon: AppliedCoupon | null;
  onApplyCoupon: (coupon: AppliedCoupon, finalPrice: number) => void;
  onRemoveCoupon: () => void;
  finalPrice: number;
}

const paymentMethods = [
  {
    id: "shurjopay",
    label: "SurjoPay",
    description:
      "Pay securely via ShurjoPay. Supports bKash, Nagad, Rocket, Visa, Mastercard, and more. You will be redirected to complete your payment.",
  },
  {
    id: "bkash",
    label: "bKash Payment",
    description:
      "You will be redirected to bKash to complete your payment securely. Please keep your bKash account ready.",
  },
];

export const OrderSummary = ({
  item,
  paymentMethod,
  onPaymentMethodChange,
  onPlaceOrder,
  loading,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  finalPrice,
}: OrderSummaryProps) => {
  const subtotal = item.price * item.qty;
  const discount = appliedCoupon?.discountAmount || 0;
  const hasDiscount = discount > 0;

  return (
    <div className="rounded-lg border border-gray-200 p-6 md:p-8 bg-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-foreground tracking-wider">
          Order summary
        </h2>
      </div>

      {/* Event Name */}
      <div className="mb-4 pb-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-foreground">
          {item.eventName}
        </p>
      </div>

      {/* Package Line */}
      <div className="mb-6 flex items-start justify-between border-b border-gray-200 pb-6">
        <span className="text-sm text-muted-foreground">
          {item.packageName} ({item.distance}) × {item.qty}
        </span>
        <span className="whitespace-nowrap text-sm font-medium text-foreground">
          ৳{subtotal.toLocaleString()}
        </span>
      </div>

      {/* Coupon Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <CouponInput
          eventId={item.eventId}
          orderAmount={subtotal}
          appliedCoupon={appliedCoupon}
          onApply={onApplyCoupon}
          onRemove={onRemoveCoupon}
          packageId={item.packageId}
        />
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 pb-6 border-b border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">
            ৳{subtotal.toLocaleString()}
          </span>
        </div>

        {hasDiscount && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium">Discount</span>
            <span className="text-green-600 font-medium">
              −৳{discount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between !mt-4 pt-4 border-t border-dashed border-gray-300">
          <span className="text-base font-bold text-foreground">Total</span>
          <span className="text-2xl font-bold text-foreground">
            ৳{finalPrice.toLocaleString()}
          </span>
        </div>

        {hasDiscount && (
          <p className="text-xs text-green-600 text-right mt-1">
            You saved ৳{discount.toLocaleString()} 🎉
          </p>
        )}
      </div>

      {/* Payment Methods */}
      <div className="mb-8 space-y-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Payment Method
        </h3>
        {paymentMethods.map((method) => (
          <div key={method.id}>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={() => onPaymentMethodChange(method.id)}
                className="h-4 w-4 accent-neon-lime"
              />
              <span className="text-sm font-medium text-foreground">
                {method.label}
              </span>
            </label>

            {/* Description tooltip */}
            {paymentMethod === method.id && method.description && (
              <div className="relative mt-3">
                <div className="absolute -top-2 left-4 h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-gray-200" />
                <div className="rounded-sm bg-gray-200 p-4 text-sm leading-relaxed text-gray-600">
                  {method.description}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Privacy Notice */}
      <p className="mb-8 text-xs leading-relaxed text-muted-foreground">
        Your personal data will be used to process your order. By clicking below
        you agree to our{" "}
        <Link
          href="/privacy-policy"
          className="underline text-foreground hover:text-primary"
        >
          privacy policy
        </Link>
        .
      </p>

      {/* Place Order Button */}
      <button
        onClick={onPlaceOrder}
        disabled={loading}
        className="h-12 w-full rounded-full bg-neon-lime text-black font-bold text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-neon-lime/30"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : paymentMethod === "shurjopay" ? (
          `Pay ৳${finalPrice.toLocaleString()} with ShurjoPay`
        ) : (
          `Place Order – ৳${finalPrice.toLocaleString()}`
        )}
      </button>
    </div>
  );
};
