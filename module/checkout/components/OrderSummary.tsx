import { CheckoutItem } from "@/types/checkout";
import Link from "next/link";

interface OrderSummaryProps {
  item: CheckoutItem;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onPlaceOrder: () => void;
  loading: boolean;
}

const paymentMethods = [
  {
    id: "surjopay",
    label: "SurjoPay",
    description:
      "Pay instantly and securely using SurjoPay. You'll be redirected to complete your transaction safely.",
  },
  {
    id: "bkash",
    label: "bKash Payment",
    description:
      "You will be redirected to bKash to complete your payment securely. Please keep your bKash account ready.",
  },
  // {
  //   id: "bank-transfer",
  //   label: "Direct Bank Transfer",
  //   description:
  //     "Make your payment directly into our bank account. Please use your Order ID as the payment reference.",
  // },
  // {
  //   id: "cod",
  //   label: "Cash On Delivery",
  //   description: null,
  // },
];

export const OrderSummary = ({
  item,
  paymentMethod,
  onPaymentMethodChange,
  onPlaceOrder,
  loading,
}: OrderSummaryProps) => {


  const subtotal = item.price * item.qty;



  return (
    <div className="rounded-lg border border-gray-200 p-6 md:p-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-foreground tracking-wider ">
          Order summary
        </h2>
        <span className="text-sm font-bold text-foreground"></span>
      </div>

      <div className="mb-3 pb-3  border-gray-100">
        <p className="text-sm font-semibold text-foreground">{item.eventName}</p>
      </div>

      {/* Product Line */}
      <div className="mb-4  flex items-start justify-between border-b border-gray-200 pb-4">
        <span className="text-sm text-muted-foreground">
            {item.packageName} ({item.distance}) × {item.qty}
          </span>
        <span className="whitespace-nowrap text-sm text-foreground font-medium">
          ৳{subtotal.toFixed(2)}
        </span>
      </div>

      {/* Subtotal */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
        <span className="text-sm font-bold text-foreground">Subtotal</span>
         <span className="text-sm text-foreground">৳{subtotal.toFixed(2)}</span>
      </div>

      {/* Total */}
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <span className="text-sm font-bold text-foreground">Total</span>
        <span className="text-lg font-bold text-foreground">৳{subtotal.toFixed(2)}</span>
      </div>

      {/* Payment Methods */}
      <div className="mb-6 space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id}>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={() => onPaymentMethodChange(method.id)}
                className="h-4 w-4 accent-neon-lime"
              />
              <span className="text-sm text-foreground">{method.label}</span>
            </label>

            {/* Description tooltip */}
            {paymentMethod === method.id && method.description && (
              <div className="relative mt-3">
                {/* Triangle */}
                <div className="absolute -top-2 left-4 h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-gray-200" />
                <div className="rounded-sm bg-gray-200 p-4 text-sm leading-relaxed text-gray-600">
                  {method.description}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Privacy Notice */}
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Your personal data will be used to process your order, support your
        experience throughout this website, and for other purposes described in
        our{" "}
        <Link href="#" className="underline text-foreground hover:text-primary">
          privacy policy
        </Link>
        .
      </p>

      {/* Place Order Button */}
      <button
        onClick={onPlaceOrder}
        disabled={loading}
        className="h-12 w-full rounded-full bg-neon-lime text-white hover:bg-foreground/90 text-base font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Place Order"}
      </button>
    </div>
  );
};
