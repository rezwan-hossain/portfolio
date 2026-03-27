// app/payment/retry/page.tsx
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import RetryPaymentClient from "@/module/payment/components/RetryPaymentClient";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ orderId?: string }>;

export default async function RetryPaymentPage({
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

  if (!order || !order.registration) redirect("/events");

  // Already paid
  if (order.payment?.status === "PAID") {
    redirect(`/payment/success?orderId=${orderId}`);
  }

  // Reset failed payment for retry
  if (order.payment?.status === "FAILED") {
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status: "PENDING",
        paymentId: null,
        transactionId: null,
      },
    });
  }

  // Build plain props
  const props = JSON.parse(
    JSON.stringify({
      orderId: order.id,
      eventName: order.event.name,
      packageName: order.package.name,
      distance: order.package.distance,
      amount: order.payment?.amount ?? Number(order.package.price),
      customerName: order.registration.fullName,
      customerEmail: user.email ?? "",
      customerPhone: order.registration.phone,
    }),
  );

  return <RetryPaymentClient {...props} />;
}
