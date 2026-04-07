// module/cart/pages/CartPage.tsx
"use client";

import { useState } from "react";

import CartItem from "../components/CartItem";
import CartTotals from "../components/CartTotals";
import { HeroText } from "@/components/ui/HeroText";
import { CartItemType } from "@/types/cart";
import Link from "next/link";

type CartPageProps = {
  items: CartItemType[];
};

const CartPage = ({ items: initialItems }: CartPageProps) => {
  const [items, setItems] = useState<CartItemType[]>(initialItems);

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-16">
        <HeroText title="Cart" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: Event Tickets Table */}
          <div className="flex-1 min-w-0 border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cart-accent inline-block" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-cart-foreground uppercase tracking-wider">
                  Event Tickets
                </h1>
              </div>
              <div className="h-0.5 w-20 sm:w-28 bg-cart-accent-line mt-1 ml-4" />
            </div>

            {items.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[320px] px-4 sm:px-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-t border-gray-200">
                        <th className="text-left text-xs font-medium text-cart-muted py-3 sm:py-4 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="text-center text-xs font-medium text-cart-muted py-3 sm:py-4 uppercase tracking-wider hidden sm:table-cell">
                          Price
                        </th>
                        <th className="text-center text-xs font-medium text-cart-muted py-3 sm:py-4 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="text-right text-xs font-medium text-cart-muted py-3 sm:py-4 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <CartItem
                          key={item.id}
                          name={`${item.eventName} – ${item.packageName}`}
                          distance={item.distance}
                          price={item.price}
                          qty={item.qty}
                          imageUrl={item.bannerImage}
                          onRemove={() => removeItem(item.id)}
                        />
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-between items-center py-3 sm:py-4 bg-cart-subtotal-bg px-3 sm:px-4 mt-0">
                    <span className="text-sm sm:text-base font-bold text-cart-foreground tracking-wide">
                      Event Tickets Subtotal:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-cart-foreground">
                      ৳{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 gap-4">
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-cart-muted text-center">
                  Your cart is empty
                </p>
                <Link
                  href="/events"
                  className="text-indigo-500 hover:underline text-sm"
                >
                  ← Browse Events
                </Link>
              </div>
            )}
          </div>

          {/* Right: Cart Totals */}
          <div className="w-full lg:w-94 flex-shrink-0 border border-gray-200 rounded-lg">
            <CartTotals
              subtotal={subtotal}
              items={items}
              disabled={items.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
