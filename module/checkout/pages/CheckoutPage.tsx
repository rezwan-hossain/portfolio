// module/checkout/pages/CheckoutPage.tsx
"use client";

import { useState, useRef, useMemo } from "react";
import { BillingForm, BillingFormRef } from "../components/BillingForm";
import { OrderSummary } from "../components/OrderSummary";
import { HeroText } from "@/components/ui/HeroText";
import { BillingFormData, CheckoutItem, AppliedCoupon } from "@/types/checkout";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/app/actions/checkout";
import { initiateShurjoPayPayment } from "@/app/actions/payment";

type CheckoutPageProps = {
  item: CheckoutItem;
  userEmail: string;
  userName: string;
};

// Bangladeshi phone number regex for validation
const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckoutPage = ({ item, userEmail, userName }: CheckoutPageProps) => {
  const router = useRouter();
  const billingFormRef = useRef<BillingFormRef>(null);

  const [paymentMethod, setPaymentMethod] = useState("shurjopay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Coupon state ───
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );
  const [finalPrice, setFinalPrice] = useState(item.price * item.qty);

  const [formData, setFormData] = useState<BillingFormData>({
    fullName: userName?.trim() || "",
    email: userEmail?.trim() || "",
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

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = useMemo(() => {
    // Check required fields
    const requiredFields: (keyof BillingFormData)[] = [
      "fullName",
      "email",
      "phone",
      "gender",
      "birthDate",
      "ageCategory",
      "bloodGroup",
      "tshirtSize",
      "runnerCategory",
    ];

    // Check if all required fields have values
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        return false;
      }
    }

    // Validate email format
    if (!EMAIL_REGEX.test(formData.email)) {
      return false;
    }

    // Validate phone format
    const cleanPhone = formData.phone.replace(/[\s-]/g, "");
    if (!BD_PHONE_REGEX.test(cleanPhone)) {
      return false;
    }

    // Validate birth date is in the past
    const selectedDate = new Date(formData.birthDate);
    const today = new Date();
    if (selectedDate >= today) {
      return false;
    }

    // Validate emergency contact number if provided
    if (formData.emergencyContactNumber?.trim()) {
      const cleanEmergencyPhone = formData.emergencyContactNumber.replace(
        /[\s-]/g,
        "",
      );
      if (!BD_PHONE_REGEX.test(cleanEmergencyPhone)) {
        return false;
      }
    }

    return true;
  }, [formData]);

  const updateField = (field: keyof BillingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Coupon handlers ───
  const handleApplyCoupon = (coupon: AppliedCoupon, newFinalPrice: number) => {
    setAppliedCoupon(coupon);
    setFinalPrice(newFinalPrice);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setFinalPrice(item.price * item.qty);
  };

  const handlePlaceOrder = async () => {
    setError("");

    // Validate form and focus on first invalid field
    const isValid = billingFormRef.current?.validateAndFocus();

    if (!isValid) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      const safeArgs = JSON.parse(
        JSON.stringify({
          packageId: item.packageId,
          eventId: item.eventId,
          qty: item.qty,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          birthDate: formData.birthDate,
          ageCategory: formData.ageCategory,
          bloodGroup: formData.bloodGroup,
          tshirtSize: formData.tshirtSize,
          emergencyContactName: formData.emergencyContactName || "",
          emergencyContactNumber: formData.emergencyContactNumber || "",
          communityName: formData.communityName || "",
          runnerCategory: formData.runnerCategory,
          paymentMethod,
          couponCode: appliedCoupon?.code || undefined,
        }),
      );

      const orderResult = await placeOrder(safeArgs);

      console.log("🛒 Place order result:", orderResult);

      if (orderResult.error) {
        setError(orderResult.error);
        setLoading(false);
        return;
      }

      if (!orderResult.orderId) {
        setError("Failed to create order");
        setLoading(false);
        return;
      }

      // ✅ Step 2: If ShurjoPay → initiate payment & redirect
      if (paymentMethod === "shurjopay") {
        const paymentArgs = JSON.parse(
          JSON.stringify({
            orderId: orderResult.orderId,
            customerName: formData.fullName,
            customerEmail: formData.email || userEmail,
            customerPhone: formData.phone,
          }),
        );

        const paymentResult = await initiateShurjoPayPayment(paymentArgs);

        console.log("💳 ShurjoPay initiation result:", paymentResult);

        if (paymentResult.error) {
          setError(paymentResult.error);
          setLoading(false);
          return;
        }

        if (paymentResult.checkoutUrl) {
          // ✅ Redirect to ShurjoPay checkout page
          window.location.href = paymentResult.checkoutUrl;
          return;
        }

        setError("Failed to get payment URL");
        setLoading(false);
        return;
      }

      // Non-ShurjoPay → go to confirmation directly
      router.push(`/order-confirmation?orderId=${orderResult.orderId}`);
    } catch (err) {
      console.error("Error placing order:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-42 ">
        <HeroText title="Checkout" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 md:py-12">
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs sm:text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:gap-12">
          {/* Billing Details */}
          <div className="flex-1">
            <BillingForm
              ref={billingFormRef}
              formData={formData}
              updateField={updateField}
            />
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[450px]">
            <OrderSummary
              item={item}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onPlaceOrder={handlePlaceOrder}
              loading={loading}
              isFormValid={isFormValid}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              finalPrice={finalPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
