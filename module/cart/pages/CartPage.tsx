"use client";

import { useState } from "react";

import ticketIcon from "@/assets/ticket-icon.png";
import CartItem from "../components/CartItem";
import CartTotals from "../components/CartTotals";
import { HeroText } from "@/components/ui/HeroText";

const initialItems = [
  {
    id: 1,
    name: "Essential Event Guide – Student Ticket",
    price: 159.0,
    qty: 1,
    // image: ticketIcon,
    image: "https://placehold.co/200x200",
  },
];

const CartPage = () => {
  const [items, setItems] = useState(initialItems);

  const updateQuantity = (id: number, qty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item)),
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-16 ">
        <HeroText title="Cart" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: Event Tickets Table */}
          <div className="flex-1 min-w-0 border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cart-accent inline-block" />
                <h1 className="text-2xl sm:text-3xl font-bold text-cart-foreground uppercase tracking-wider">
                  Event Tickets
                </h1>
              </div>
              <div className="h-0.5 w-28 bg-cart-accent-line mt-1 ml-4" />
            </div>

            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-t border-gray-200 px-4">
                      <th className="text-left text-xs font-medium text-cart-muted  py-4 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="text-center text-xs font-medium text-cart-muted py-4 uppercase tracking-wider hidden sm:table-cell">
                        Price
                      </th>
                      <th className="text-center text-xs font-medium text-cart-muted py-4 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="text-right text-xs font-medium text-cart-muted py-4  uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <CartItem
                        key={item.id}
                        name={item.name}
                        price={item.price}
                        initialQty={item.qty}
                        imageUrl={item.image}
                        onQuantityChange={(qty) => updateQuantity(item.id, qty)}
                        onRemove={() => removeItem(item.id)}
                      />
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-center py-4 bg-cart-subtotal-bg px-4 mt-0">
                  <span className="text-base font-bold text-cart-foreground tracking-wide ">
                    Event Tickets Subtotal:
                  </span>
                  <span className="text-base font-bold  text-cart-foreground">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-3xl font-semibold text-cart-muted text-center">
                  Your cart is empty
                </p>
              </div>
            )}
          </div>

          {/* Right: Cart Totals */}
          <div className="w-full lg:w-94 flex-shrink-0 border border-gray-200 rounded-lg">
            <CartTotals subtotal={subtotal} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
