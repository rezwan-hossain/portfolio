// module/payment/components/PaymentProcessingClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getPaymentProgress } from "@/app/actions/payment-status";

const POLL_MS = 4_000;
const GIVE_UP_MS = 3 * 60 * 1000;

export function PaymentProcessingClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const [review, setReview] = useState(false);

  useEffect(() => {
    const started = Date.now();
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (stopped) return;
      let state = "PENDING";
      try {
        state = await getPaymentProgress(orderId);
      } catch {
        // network blip — just try again
      }
      if (stopped) return;

      if (state === "CONFIRMED") {
        router.replace(`/payment/success?orderId=${orderId}`);
        return;
      }
      if (state === "NOT_PAID") {
        router.replace(`/payment/failed?orderId=${orderId}&reason=payment_failed`);
        return;
      }
      if (state === "REVIEW" || state === "NOT_FOUND") {
        setReview(true);
        return;
      }
      if (Date.now() - started > GIVE_UP_MS) {
        setTimedOut(true);
        return;
      }
      timer = setTimeout(poll, POLL_MS);
    };

    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [orderId, router]);

  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="mt-32 max-w-lg w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        {!timedOut && !review ? (
          <>
            <Loader2 className="w-14 h-14 mx-auto mb-6 animate-spin text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Confirming your payment…
            </h1>
            <p className="text-gray-500">
              We&apos;re checking with the payment provider. This usually takes a
              few seconds — please keep this page open and{" "}
              <strong>don&apos;t pay again</strong>.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {review ? "We're reviewing your payment" : "Still confirming your payment"}
            </h1>
            <p className="text-gray-500">
              {review
                ? "Your payment reached us and our team is checking it. You don't need to pay again — we'll contact you."
                : "If you were charged, your registration will be confirmed automatically within a few minutes and you'll get an email and SMS. Please don't pay again."}
            </p>
          </>
        )}

        <div className="text-left bg-gray-50 rounded-lg p-4 mt-6">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Order ID</span>
            <span className="text-sm font-mono font-medium text-gray-900">{shortId}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <Link
            href="/dashboard"
            className="w-full py-3 bg-neutral-900 text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity inline-block text-center"
          >
            Go to my registrations
          </Link>
          <Link href="/events" className="text-sm text-indigo-500 hover:underline">
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}
