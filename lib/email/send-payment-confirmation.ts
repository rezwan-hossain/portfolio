// lib/email/send-payment-confirmation.ts
import { Resend } from "resend";
import { getPaymentConfirmationEmailHTML } from "./templates/payment-confirmation";
import { prisma } from "@/lib/prisma";

type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface PaymentConfirmationEmailProps {
  to: string;
  runnerName: string;
  eventName: string;
  eventDate: string | Date;
  eventAddress: string;
  packageName: string;
  distance: string;
  amount: number;
  orderId: string;
  orderDate: string | Date;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paymentMethod?: string;
  bibNumber?: string;
  tshirtSize?: string;
  bloodGroup?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentConfirmationEmail(
  params: PaymentConfirmationEmailProps,
) {
  try {
    // const order = await prisma.order.findUnique({
    //   where: { id: orderId },
    //   include: {
    //     user: true,
    //     package: true,
    //     event: true,
    //     registration: true,
    //     payment: true,
    //   },
    // });

    // if (!order || !order.user.email) {
    //   console.error("Order or user email not found");
    //   return { success: false, error: "Order not found" };
    // }

    // Format dates
    const eventDateFormatted = new Date(params.eventDate).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    const orderDateFormatted = new Date(params.orderDate).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );

    // Generate HTML
    const html = getPaymentConfirmationEmailHTML({
      runnerName: params.runnerName || "Runner",
      eventName: params.eventName,
      eventDate: eventDateFormatted,
      eventAddress: params.eventAddress,
      packageName: params.packageName,
      distance: params.distance,
      amount: params.amount || 0,
      orderId: params.orderId,
      orderDate: orderDateFormatted,
      orderStatus: params.orderStatus,
      paymentStatus: params.paymentStatus,
      transactionId: params.transactionId || undefined,
      paymentMethod: params.paymentMethod || undefined,
      bibNumber: params.bibNumber || undefined,
      appUrl: process.env.NEXT_PUBLIC_APP_URL! || "http://localhost:3000",
      tshirtSize: params.tshirtSize || undefined,
      bloodGroup: params.bloodGroup || undefined,
    });

    // Send email
    const { data, error } = await resend.emails.send({
      from: "Marathon Events <onboarding@resend.dev>", // Change in production
      to: [params.to],
      subject: `✅ Registration Confirmed - ${params.eventName}`,
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
