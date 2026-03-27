// app/payment/success/page.tsx
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type SearchParams = Promise<{ orderId?: string }>;

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) redirect("/events");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      event: true,
      package: true,
      registration: true,
      payment: true,
    },
  });

  if (!order) redirect("/events");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="mt-32 max-w-lg w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-500 mb-8">
          Your registration has been confirmed
        </p>

        {/* Order Details */}
        <div className="text-left space-y-4 bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Order ID</span>
            <span className="text-sm font-mono font-medium text-gray-900">
              {order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Event</span>
            <span className="text-sm font-medium text-gray-900">
              {order.event.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Package</span>
            <span className="text-sm font-medium text-gray-900">
              {order.package.name} ({order.package.distance})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Runner</span>
            <span className="text-sm font-medium text-gray-900">
              {order.registration?.fullName}
            </span>
          </div>

          {order.payment?.transactionId && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Transaction ID</span>
              <span className="text-sm font-mono font-medium text-gray-900">
                {order.payment.transactionId}
              </span>
            </div>
          )}

          {order.payment?.paymentGateway && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Gateway</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {order.payment.paymentGateway}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-200 pt-4">
            <span className="text-sm font-bold text-gray-900">Total Paid</span>
            <span className="text-sm font-bold text-green-600">
              ৳{order.payment?.amount ?? Number(order.package.price)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Payment Status</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              {order.payment?.status}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Order Status</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              {order.status}
            </span>
          </div>

          {order.payment?.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Method</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {order.payment.paymentMethod}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full py-3 bg-neutral-900 text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity inline-block text-center"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/events"
            className="text-sm text-indigo-500 hover:underline"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
}
