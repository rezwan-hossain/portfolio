"use client";

import { useState } from "react";
import { BillingForm } from "../components/BillingForm";
import { OrderSummary } from "../components/OrderSummary";
import { HeroText } from "@/components/ui/HeroText";
import { BillingFormData, CheckoutItem } from "@/types/checkout";
import { useRouter } from "next/navigation";

type CheckoutPageProps = {
  item: CheckoutItem;
  userEmail: string;
  userName: string;
};

const CheckoutPage = ({ item, userEmail, userName }: CheckoutPageProps) => {
  const router = useRouter();


  const [paymentMethod, setPaymentMethod] = useState("surjopay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<BillingFormData>({
    fullName: userName,
    email: userEmail,
    phone: "",
    gender: "",
    birthDate: "",
    ageCategory: "",
    bloodGroup: "",
    tshirtSize: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    communityName: "",
    runnerCategory: "",
  });

  const updateField = (field: keyof BillingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

    const handlePlaceOrder = async () => {


    }

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-16 ">
        <HeroText title="Checkout" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
         {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Billing Details */}
          <div className="flex-1">
            <BillingForm formData={formData} updateField={updateField} />
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[450px]">
            <OrderSummary
              item={item}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onPlaceOrder={handlePlaceOrder}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
