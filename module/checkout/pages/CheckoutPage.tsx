"use client";

import { useState } from "react";
import { BillingForm } from "../components/BillingForm";
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

const CheckoutPage = ({ item, userEmail, userName }: CheckoutPageProps) => {
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState("shurjopay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Coupon state ───
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );
  const [finalPrice, setFinalPrice] = useState(item.price * item.qty);

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

    // Validation
    const required: (keyof BillingFormData)[] = [
      "fullName",
      "phone",
      "gender",
      "birthDate",
      "ageCategory",
      "bloodGroup",
      "tshirtSize",
      "runnerCategory",
    ];

    for (const field of required) {
      if (!formData[field]) {
        setError(
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        );
        return;
      }
    }

    setLoading(true);

    try {
      const safeArgs = JSON.parse(
        JSON.stringify({
          packageId: item.packageId,
          eventId: item.eventId,
          qty: item.qty,
          fullName: formData.fullName,
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

    // const result = await placeOrder({
    //   packageId: item.packageId,
    //   eventId: item.eventId,
    //   qty: item.qty,
    //   fullName: formData.fullName,
    //   phone: formData.phone,
    //   gender: formData.gender,
    //   birthDate: formData.birthDate,
    //   ageCategory: formData.ageCategory,
    //   bloodGroup: formData.bloodGroup,
    //   tshirtSize: formData.tshirtSize,
    //   emergencyContactName: formData.emergencyContactName || undefined,
    //   emergencyContactNumber: formData.emergencyContactNumber || undefined,
    //   communityName: formData.communityName || undefined,
    //   runnerCategory: formData.runnerCategory,
    //   paymentMethod,
    // });

    // if (result.error) {
    //   setError(result.error);
    //   setLoading(false);
    //   return;
    // }

    // if (result.success && result.orderId) {
    //   router.push(`/order-confirmation?orderId=${result.orderId}`);
    // }
  };

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
            {/* <OrderSummary
              item={item}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onPlaceOrder={handlePlaceOrder}
              loading={loading}
            /> */}
            <OrderSummary
              item={item}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onPlaceOrder={handlePlaceOrder}
              loading={loading}
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
