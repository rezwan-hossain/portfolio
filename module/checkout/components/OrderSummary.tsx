// module/checkout/components/OrderSummary.tsx
"use client";

import { CheckoutItem, AppliedCoupon } from "@/types/checkout";
import { CouponInput } from "./CouponInput";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";

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
    image: "/icons/shurjopay.png",
    description:
      "Pay securely via ShurjoPay. Supports bKash, Nagad, Rocket, Visa, Mastercard, and more. You will be redirected to complete your payment.",
  },
  // {
  //   id: "bkash",
  //   label: "bKash Payment",
  //   image: "/images/payment/bkash.svg",
  //   description:
  //     "You will be redirected to bKash to complete your payment securely. Please keep your bKash account ready.",
  // },  // {
  //   id: "bkash",
  //   label: "bKash Payment",
  //   image: "/images/payment/bkash.svg",
  //   description:
  //     "You will be redirected to bKash to complete your payment securely. Please keep your bKash account ready.",
  // },
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
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-3 mt-3">
          Payment Method
        </h3>
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const isSelected = paymentMethod === method.id;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onPaymentMethodChange(method.id)}
                className={`w-full text-left rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-neon-lime bg-neon-lime/5 shadow-sm shadow-neon-lime/20"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {/* Main row: radio indicator + image + label */}
                <div className="flex items-center gap-3 p-3.5">
                  {/* Custom radio indicator */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-neon-lime bg-neon-lime"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-black" strokeWidth={3} />
                    )}
                  </div>

                  {/* Payment logo */}
                  <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-gray-50 p-1">
                    <img
                      src={method.image}
                      alt={method.label}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {method.label}
                  </span>
                </div>

                {/* Expandable description */}
                {isSelected && method.description && (
                  <div className="px-3.5 pb-3.5 pt-0">
                    <div className="rounded-lg bg-gray-100 px-4 py-3 text-xs leading-relaxed text-gray-500">
                      {method.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
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
