interface OrderSummaryProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

const paymentMethods = [
  {
    id: "bank-transfer",
    label: "Direct Bank Transfer",
    description:
      "Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.",
  },
  {
    id: "check",
    label: "Check Payments",
    description: null,
  },
  {
    id: "cod",
    label: "Cash On Delivery",
    description: null,
  },
];

export const OrderSummary = ({
  paymentMethod,
  onPaymentMethodChange,
}: OrderSummaryProps) => {
  return (
    <div className="rounded-lg border border-gray-200 p-6 md:p-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-foreground tracking-wider ">
          Order summary
        </h2>
        <span className="text-sm font-bold text-foreground"></span>
      </div>

      {/* Product Line */}
      <div className="mb-4  flex items-start justify-between border-b border-gray-200 pb-4">
        <span className="pr-4 text-sm text-muted-foreground">
          Essential Event Guide – Student Ticket × 1
        </span>
        <span className="whitespace-nowrap text-sm text-foreground">
          $159.00
        </span>
      </div>

      {/* Subtotal */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
        <span className="text-sm font-bold text-foreground">Subtotal</span>
        <span className="text-sm text-foreground">$159.00</span>
      </div>

      {/* Total */}
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <span className="text-sm font-bold text-foreground">Total</span>
        <span className="text-lg font-bold text-foreground">$159.00</span>
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
        <a href="#" className="underline text-foreground hover:text-primary">
          privacy policy
        </a>
        .
      </p>

      {/* Place Order Button */}
      <button className="h-12 w-full rounded-full bg-neon-lime text-white hover:bg-foreground/90 text-base font-bold cursor-pointer">
        Place Order
      </button>
    </div>
  );
};
