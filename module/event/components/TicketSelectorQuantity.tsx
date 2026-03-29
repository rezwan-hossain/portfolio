"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { EventPackage } from "@/types/event";

type TicketSelectorProps = {
  packages: EventPackage[];
  eventSlug: string;
  eventId: string;
};

const tickets = [
  { label: "Student", price: 159 },
  { label: "General Admission", price: 299 },
  { label: "VIP", price: 499 },
];

const TicketSelectorQuantity = ({
  packages,
  eventSlug,
  eventId,
}: TicketSelectorProps) => {
  const router = useRouter();

  const [selectedPackage, setSelectedPackage] = useState(packages[0]);
  const [quantity, setQuantity] = useState(1);

  const subtotal = selectedPackage.price * quantity;
  const slotsLeft = selectedPackage.availableSlots - selectedPackage.usedSlots;

  const handleGetTicket = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // 👇 Not logged in — redirect to login
      // router.push("/login");
      const cartUrl = `/cart?package=${selectedPackage.id}&qty=${quantity}&event=${eventSlug}`;
      router.push(`/login?redirect=${encodeURIComponent(cartUrl)}`);

      return;
    }

    // ✅ Logged in — proceed with ticket purchase
    // router.push("/cart");
    router.push(
      `/cart?package=${selectedPackage.id}&qty=${quantity}&event=${eventSlug}`,
    );

    // router.push(
    //   `/events/${eventSlug}/register?package=${selectedPackage.id}&qty=${quantity}&event=${eventSlug}`
    // );
  };

  // No packages available
  if (packages.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-display text-3xl lg:text-4xl tracking-wide mb-4">
          TICKET
        </h3>
        <p className="text-muted-foreground text-sm">
          No packages available for this event.
        </p>
      </div>
    );
  }

  return (
    <div className="border  border-gray-200 rounded-lg p-4">
      <h3 className="font-display text-3xl lg:text-4xl tracking-wide mb-4">
        TICKET
      </h3>

      {/* Dropdown */}
      <div className="border border-border rounded-lg mb-4 relative">
        <select
          className="w-full bg-gray-100 p-4 pr-10 text-gray-900 font-body text-sm lg:text-base rounded-lg appearance-none cursor-pointer focus:outline-none"
          value={selectedPackage.id}
          onChange={(e) => {
            const pkg = packages.find((p) => p.id === Number(e.target.value))!;
            setSelectedPackage(pkg);
            setQuantity(1);
          }}
        >
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} ({pkg.distance}) - ৳{pkg.price}
            </option>
          ))}
        </select>

        <ChevronDown
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          size={18}
        />
      </div>

      {/* Slots Left Info */}
      <div className="mb-4 px-1">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{slotsLeft} slots remaining</span>
          <span>{selectedPackage.availableSlots} total</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              slotsLeft < 20
                ? "bg-red-500"
                : slotsLeft < 50
                  ? "bg-yellow-500"
                  : "bg-neon-lime"
            }`}
            style={{
              width: `${
                (selectedPackage.usedSlots / selectedPackage.availableSlots) *
                100
              }%`,
            }}
          />
        </div>
        {slotsLeft < 20 && slotsLeft > 0 && (
          <p className="text-xs text-red-500 mt-1 font-medium">
            ⚠️ Almost sold out!
          </p>
        )}
      </div>

      {/* Price row */}
      <div className="bg-[#FDFD96] border border-gray-400 rounded-lg px-4 py-4 lg:px-6 lg:py-5 flex items-center justify-between mb-4">
        <div className="text-center">
          <p className="text-[10px] lg:text-xs font-semibold tracking-widest text-primary-foreground mb-1">
            TICKET PRICE
          </p>
          <p className="font-display text-3xl lg:text-4xl text-primary-foreground">
            ৳{selectedPackage.price}
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
              onClick={() => setQuantity(Math.min(quantity + 1, slotsLeft))}
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
            ৳{subtotal}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="font-body text-sm font-semibold text-foreground">
          QUANTITY: {quantity}
        </p>
        <p className="font-body text-sm text-foreground">
          TOTAL: <span className="font-bold text-lg">৳{subtotal}</span>
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={handleGetTicket}
        disabled={slotsLeft === 0}
        className={`cursor-pointer w-full rounded-full py-4 flex items-center justify-center gap-3 font-body font-semibold text-sm tracking-wide transition ${
          slotsLeft === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-neutral-900 text-white hover:opacity-90"
        }`}
      >
        {slotsLeft === 0 ? "SOLD OUT" : "GET TICKET"}
        {slotsLeft > 0 && (
          <span className="w-8 h-8 rounded-full bg-[#FDFD96] flex items-center justify-center">
            <ArrowRight size={16} className="text-black" />
          </span>
        )}
      </button>
    </div>
  );
};

export default TicketSelectorQuantity;
