// module/cart/components/CartTotals.tsx
import { CartItemType } from "@/types/cart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CartTotalsProps {
  subtotal: number;
  items: CartItemType[];
  disabled?: boolean;
}

const CartTotals = ({ subtotal, items, disabled = false }: CartTotalsProps) => {
  const [agreed, setAgreed] = useState(false);

  const router = useRouter();

  const handleCheckout = () => {
    if (items.length === 0 || !agreed) return;

    // Pass first item info to checkout
    // Quantity is fixed at 1
    const item = items[0];
    const params = new URLSearchParams({
      package: String(item.packageId),
      event: item.eventId,
      qty: "1", // Fixed quantity
    });

    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="bg-cart-totals-bg rounded-sm p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-cart-foreground mb-4 sm:mb-6 tracking-wider uppercase">
        Cart Totals
      </h2>

      {/* Items Summary */}
      {items.length > 0 && (
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-xs sm:text-sm text-cart-muted"
            >
              <span className="truncate mr-2">
                {item.packageName} ({item.distance}) × {item.qty}
              </span>
              <span className="flex-shrink-0">
                ৳{(item.price * item.qty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center py-4 sm:py-5 border-b border-t border-gray-200">
        <span className="text-sm sm:text-base text-cart-muted">Subtotal</span>
        <span className="text-sm sm:text-base text-cart-foreground">
          ৳{subtotal.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between items-center py-4 sm:py-5 border-b border-gray-200">
        <span className="text-base sm:text-lg font-bold text-cart-foreground">
          Total
        </span>
        <span className="text-base sm:text-lg font-bold text-cart-foreground">
          ৳{subtotal.toFixed(2)}
        </span>
      </div>

      <p className="text-xs text-cart-muted mt-3 mb-4 sm:mb-6">
        Taxes and shipping calculated at checkout
      </p>

      <label className="flex items-start gap-2 mb-4 sm:mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-cart-border accent-cart-foreground"
        />
        <span className="text-xs sm:text-sm font-mono font-semibold text-cart-muted">
          I agree with{" "}
          <Link
            href="/terms-and-conditions"
            className="text-cart-foreground font-medium underline hover:opacity-80"
          >
            terms and conditions
          </Link>
        </span>
      </label>

      <button
        onClick={handleCheckout}
        disabled={!agreed || disabled}
        className="w-full py-3 sm:py-3.5 bg-neon-lime text-white text-sm sm:text-base font-bold tracking-wide rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Proceed To Checkout
      </button>
    </div>
  );
};

export default CartTotals;
