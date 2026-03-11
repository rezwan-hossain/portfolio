"use client";

import { useState } from "react";
import { BillingForm } from "../components/BillingForm";
import { OrderSummary } from "../components/OrderSummary";
import { HeroText } from "@/components/ui/HeroText";

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("bank-transfer");

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-16 ">
        <HeroText title="Checkout" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Billing Details */}
          <div className="flex-1">
            <BillingForm />
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[450px]">
            <OrderSummary
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
