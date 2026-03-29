// lib/email/send-payment-confirmation.ts
import { Resend } from "resend";
import { getPaymentConfirmationEmailHTML } from "./templates/payment-confirmation";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentConfirmationEmail(orderId: string) {
  try {
    // Fetch order with all details
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

    // Format event date
    const eventDate = new Date(order.event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate HTML
    const html = getPaymentConfirmationEmailHTML({
      runnerName:
        order.registration?.fullName || order.user.firstName || "Runner",
      eventName: order.event.name,
      eventDate: eventDate,
      packageName: order.package.name,
      distance: order.package.distance,
      amount: order.payment?.amount || 0,
      orderId: order.id,
      bibNumber: order.registration?.bibNumber || undefined,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    });

    // Send email using HTML instead of react
    const { data, error } = await resend.emails.send({
      from: "Marathon Events <onboarding@resend.dev>", // Change to your domain in production
      to: [order.user.email],
      subject: `✅ Registration Confirmed - ${order.event.name}`,
      html: html, // ← Use html instead of react
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
