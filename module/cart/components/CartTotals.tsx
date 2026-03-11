import Link from "next/link";
import { useState } from "react";

interface CartTotalsProps {
  subtotal: number;
}

const CartTotals = ({ subtotal }: CartTotalsProps) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="bg-cart-totals-bg rounded-sm p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-cart-foreground mb-6 tracking-wider uppercase">
        Cart Totals
      </h2>

      <div className="flex justify-between items-center py-5 border-b border-gray-200">
        <span className="text-base text-cart-muted">Subtotal</span>
        <span className="text-base text-cart-foreground">
          ${subtotal.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between items-center py-5 border-b border-gray-200">
        <span className="text-lg font-bold text-cart-foreground">Total</span>
        <span className="text-lg font-bold text-cart-foreground">
          ${subtotal.toFixed(2)}
        </span>
      </div>

      <p className="text-xs text-cart-muted mt-3 mb-6">
        Taxes and shipping calculated at checkout
      </p>

      <label className="flex items-start gap-2 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-cart-border accent-cart-foreground"
        />
        <span className="text-sm font-mono font-semibold  text-cart-muted">
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
        disabled={!agreed}
        className="w-full py-3.5 bg-neon-lime text-white text-base font-bold tracking-wide rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Proceed To Checkout
      </button>
    </div>
  );
};

export default CartTotals;
