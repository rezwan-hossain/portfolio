// lib/email/send-payment-confirmation.ts
import { Resend } from "resend";
import { getPaymentConfirmationEmailHTML } from "./templates/payment-confirmation";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentConfirmationEmail(orderId: string) {
  try {
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

    if (!order || !order.user.email) {
      console.error("Order or user email not found");
      return { success: false, error: "Order not found" };
    }

    // Format dates
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

    // Generate HTML
    const html = getPaymentConfirmationEmailHTML({
      runnerName:
        order.registration?.fullName || order.user.firstName || "Runner",
      eventName: order.event.name,
      eventDate: eventDate,
      eventAddress: order.event.address,
      packageName: order.package.name,
      distance: order.package.distance,
      amount: order.payment?.amount || 0,
      orderId: order.id,
      orderDate: orderDate,
      orderStatus: order.status,
      paymentStatus: order.payment?.status || "PENDING",
      transactionId: order.payment?.transactionId || undefined,
      paymentMethod: order.payment?.paymentMethod || undefined,
      bibNumber: order.registration?.bibNumber || undefined,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    });

    // Send email
    const { data, error } = await resend.emails.send({
      from: "Marathon Events <onboarding@resend.dev>", // Change in production
      to: [order.user.email],
      subject: `✅ Registration Confirmed - ${order.event.name}`,
      html: html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Confirmation email sent:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error("Failed to send confirmation email:", error);
    return { success: false, error: error.message };
  }
}
