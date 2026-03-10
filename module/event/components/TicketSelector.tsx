"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Minus, Plus } from "lucide-react";

const tickets = [
  { label: "Student", price: 159 },
  { label: "General Admission", price: 299 },
  { label: "VIP", price: 499 },
];

const TicketSelector = () => {
  const [selectedTicket, setSelectedTicket] = useState(tickets[0]);
  const [quantity, setQuantity] = useState(1);

  const subtotal = selectedTicket.price * quantity;

  return (
    <div className="border  border-gray-200 rounded-lg p-4">
      <h3 className="font-display text-3xl lg:text-4xl tracking-wide mb-4">
        TICKET
      </h3>

      {/* Dropdown */}
      <div className="border border-border rounded-lg mb-4 relative">
        <select
          className="w-full bg-gray-100 p-4 pr-10 text-gray-900 font-body text-sm lg:text-base rounded-lg appearance-none cursor-pointer focus:outline-none"
          value={selectedTicket.label}
          onChange={(e) => {
            const t = tickets.find((t) => t.label === e.target.value)!;
            setSelectedTicket(t);
            setQuantity(1);
          }}
        >
          {tickets.map((t) => (
            <option key={t.label} value={t.label}>
              {t.label} - ${t.price.toFixed(2)}
            </option>
          ))}
        </select>

        <ChevronDown
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          size={18}
        />
      </div>

      {/* Price row */}
      <div className="bg-[#FDFD96] border border-gray-400 rounded-lg px-4 py-4 lg:px-6 lg:py-5 flex items-center justify-between mb-4">
        <div className="text-center">
          <p className="text-[10px] lg:text-xs font-semibold tracking-widest text-primary-foreground mb-1">
            TICKET PRICE
          </p>
          <p className="font-display text-3xl lg:text-4xl text-primary-foreground">
            ${selectedTicket.price}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] lg:text-xs font-semibold tracking-widest text-primary-foreground mb-1">
            QUANTITY
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-full border border-primary-foreground flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/10 transition"
            >
              <Minus size={14} />
            </button>
            <span className="font-display text-2xl text-primary-foreground w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-full border border-primary-foreground flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/10 transition"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] lg:text-xs font-semibold tracking-widest text-primary-foreground mb-1">
            SUBTOTAL
          </p>
          <p className="font-display text-3xl lg:text-4xl text-primary-foreground">
            ${subtotal}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="font-body text-sm font-semibold text-foreground">
          QUANTITY: {quantity}
        </p>
        <p className="font-body text-sm text-foreground">
          TOTAL: <span className="font-bold text-lg">${subtotal}</span>
        </p>
      </div>

      {/* CTA */}
      <button className="cursor-pointer w-full bg-neutral-900 text-white rounded-full py-4 flex items-center justify-center gap-3 font-body font-semibold text-sm tracking-wide hover:opacity-90 transition">
        GET TICKET
        <span className="w-8 h-8 rounded-full bg-[#FDFD96] flex items-center justify-center">
          <ArrowRight size={16} className="text-black" />
        </span>
      </button>
    </div>
  );
};

export default TicketSelector;
