// lib/email/send-payment-confirmation.ts

import { Resend } from "resend";

import { prisma } from "@/lib/prisma";
import { getPaymentConfirmationEmailHTML } from "./payment-confirmation-archiv";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentConfirmationEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      package: true,
      event: true,
      registration: true,
      payment: true,
    },
  });

  if (!order?.user?.email) {
    console.error("❌ Order or email not found for:", orderId);
    return { success: false };
  }

  const html = getPaymentConfirmationEmailHTML({
    runnerName:
      order.registration?.fullName || order.user.firstName || "Runner",
    eventName: order.event.name,
    eventDate: new Date(order.event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    packageName: order.package.name,
    distance: order.package.distance,
    amount: order.payment?.amount || 0,
    orderId: order.id,
    bibNumber: order.registration?.bibNumber || undefined,
  });

  const { data, error } = await resend.emails.send({
    from: "Marathon Events <onboarding@resend.dev>",
    to: [order.user.email],
    subject: `✅ Registration Confirmed - ${order.event.name}`,
    html,
  });

  if (error) {
    console.error("❌ Email error:", error.message);
    return { success: false };
  }

  console.log("✅ Email sent:", data?.id);
  return { success: true };
}
