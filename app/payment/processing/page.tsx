// app/payment/processing/page.tsx
//
// Where the ShurjoPay callback sends the customer when it couldn't get a
// definite answer yet (gateway slow/unreachable, status not settled). Never a
// "failed" page for a payment that may have gone through.

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PaymentProcessingClient } from "@/module/payment/components/PaymentProcessingClient";

type SearchParams = Promise<{ orderId?: string }>;

function Fallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
    </div>
  );
}

async function Content({ searchParams }: { searchParams: SearchParams }) {
  const { orderId } = await searchParams;
  if (!orderId) redirect("/payment/failed?reason=missing_order");
  return <PaymentProcessingClient orderId={orderId} />;
}

export default function PaymentProcessingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
