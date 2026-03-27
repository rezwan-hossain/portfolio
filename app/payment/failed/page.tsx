// app/payment/failed/page.tsx
import Link from "next/link";

type SearchParams = Promise<{ orderId?: string; reason?: string }>;

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const orderId = params.orderId;
  const reason = params.reason;

  const reasonMessages: Record<string, string> = {
    cancelled: "You cancelled the payment",
    payment_failed: "Payment was declined",
    verification_failed: "Payment verification failed",
    payment_not_found: "Payment record not found",
    missing_order: "Order information is missing",
    server_error: "A server error occurred",
    unknown: "An unknown error occurred",
  };

  const message = reason
    ? reasonMessages[reason] || "Payment was not completed"
    : "Payment was not completed";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="mt-32 max-w-lg w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        {/* Failed Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">❌</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-500 mb-8">{message}</p>

        {orderId && (
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Order ID</span>
              <span className="text-sm font-mono font-medium text-gray-900">
                {orderId.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {orderId && (
            <Link
              href={`/payment/retry?orderId=${orderId}`}
              className="w-full py-3 bg-neutral-900 text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity inline-block text-center"
            >
              Retry Payment
            </Link>
          )}
          <Link
            href="/events"
            className="text-sm text-indigo-500 hover:underline"
          >
            Back to Events
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:underline"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
