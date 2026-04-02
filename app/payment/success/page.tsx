// app/payment/success/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Hash,
  Calendar,
  MapPin,
  Package,
  User,
  CreditCard,
  Receipt,
  ArrowRight,
  Ticket,
  Shield,
} from "lucide-react";

type SearchParams = Promise<{ orderId?: string }>;

// ✅ Skeleton shown instantly while data streams in
function PaymentSuccessSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-gray-50 flex items-start justify-center px-4 py-12 sm:py-20">
      <div className="mt-20 max-w-xl w-full">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full mx-auto mb-6 animate-pulse" />
          <div className="h-9 bg-gray-200 rounded-lg w-56 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-72 mx-auto animate-pulse" />
        </div>

        {/* Card skeleton */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
          {/* BIB section */}
          <div className="bg-emerald-500/20 px-6 py-7 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-10 bg-emerald-200 rounded-xl w-36" />
              <div className="h-14 bg-emerald-200 rounded-2xl w-32" />
            </div>
          </div>

          {/* Event bar */}
          <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-64 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-5 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="flex items-center justify-between bg-gray-50 -mx-6 px-6 py-4 mt-4">
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-8 bg-emerald-100 rounded w-20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Buttons skeleton */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
          <div className="flex-1 h-12 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ✅ All dynamic data access isolated here
async function PaymentSuccessContent({
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

  const eventDate = new Date(order.event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-gray-50 flex items-start justify-center px-4 py-12 sm:py-20">
      <div className="mt-20 max-w-xl w-full">
        {/* ── Animated Success Header ── */}
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-emerald-200/40 rounded-full animate-ping" />
            <div className="absolute inset-1 bg-emerald-100/60 rounded-full animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            You&apos;re All Set!
          </h1>
          <p className="text-gray-500 mt-2 text-base">
            Payment confirmed &amp; registration complete
          </p>
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
          {/* BIB Number */}
          {order.registration?.bibNumber && (
            <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-7 text-white overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 left-4 text-[120px] font-black leading-none select-none">
                  #
                </div>
              </div>

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-100 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                      Your BIB Number
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-auto bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 border border-white/30 text-center sm:text-left">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-widest">
                    {order.registration.bibNumber}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Event Info Bar */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-50/80 border-b border-gray-100">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 sm:truncate">
                  {order.event.name}
                </h2>
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-x-4 sm:gap-y-1 mt-2 sm:mt-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="truncate">{eventDate}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="line-clamp-1">{order.event.address}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="px-6 py-5 space-y-0 divide-y divide-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
              <DetailItem
                icon={<User className="w-4 h-4" />}
                label="Runner"
                value={order.registration?.fullName || "—"}
              />
              <DetailItem
                icon={<Package className="w-4 h-4" />}
                label="Package"
                value={`${order.package.name}`}
                sub={order.package.distance}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <DetailItem
                icon={<Receipt className="w-4 h-4" />}
                label="Order ID"
                value={order.id.slice(0, 8).toUpperCase()}
                mono
              />
              {order.payment?.transactionId && (
                <DetailItem
                  icon={<Shield className="w-4 h-4" />}
                  label="Transaction ID"
                  value={
                    order.payment.transactionId.length > 16
                      ? `${order.payment.transactionId.slice(0, 16)}...`
                      : order.payment.transactionId
                  }
                  mono
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {order.payment?.paymentMethod && (
                <DetailItem
                  icon={<CreditCard className="w-4 h-4" />}
                  label="Payment Method"
                  value={order.payment.paymentMethod}
                  capitalize
                />
              )}
              <DetailItem
                icon={<Calendar className="w-4 h-4" />}
                label="Date"
                value={orderDate}
              />
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={order.status}
                    variant={
                      order.status === "CONFIRMED" ? "success" : "neutral"
                    }
                  />
                  <StatusBadge
                    label={order.payment?.status || "—"}
                    variant={
                      order.payment?.status === "PAID" ? "success" : "neutral"
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 -mx-6 px-6 py-4 -mb-5 rounded-b-2xl">
                <span className="text-base font-semibold text-gray-900">
                  Total Paid
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  ৳
                  {(
                    order.payment?.amount ?? Number(order.package.price)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Confirmation Note ── */}
        <div className="mt-5 flex items-start gap-3 bg-blue-50/80 border border-blue-100 rounded-xl px-5 py-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Confirmation sent to your email
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              A copy of your registration details has been sent to your
              registered email address.
            </p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 group relative inline-flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/10"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/events"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 bg-white text-gray-700 rounded-xl font-semibold text-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Browse Events
          </Link>
        </div>

        {/* ── Footer Note ── */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Having issues?{" "}
          <Link
            href="/contact"
            className="text-gray-500 underline underline-offset-2 hover:text-gray-700"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}

// ✅ Page component — sync wrapper with Suspense boundary
export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<PaymentSuccessSkeleton />}>
      <PaymentSuccessContent searchParams={searchParams} />
    </Suspense>
  );
}

/* ─── Sub-components ────────────────────────────── */

function DetailItem({
  icon,
  label,
  value,
  sub,
  mono,
  capitalize: cap,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-500 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p
          className={`text-sm font-semibold text-gray-900 truncate mt-0.5 ${
            mono ? "font-mono" : ""
          } ${cap ? "capitalize" : ""}`}
        >
          {value}
        </p>
        {sub && (
          <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-600 rounded">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "neutral";
}) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${styles}`}
    >
      {variant === "success" && (
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
      )}
      {label}
    </span>
  );
}
