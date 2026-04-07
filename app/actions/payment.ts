"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getShurjoPayToken, createShurjoPayPayment } from "@/lib/shurjopay";
import { getClientIp } from "@/lib/get-client-ip";

export async function initiateShurjoPayPayment({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
}: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in", checkoutUrl: "" };
  }

  try {
    // ✅ Get client IP at the start
    const clientIp = await getClientIp();
    console.log("🌐 Client IP:", clientIp);

    // Get order with payment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        package: true,
        event: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found", checkoutUrl: "" };
    }

    if (!order.payment) {
      return {
        success: false,
        error: "Payment record not found",
        checkoutUrl: "",
      };
    }

    if (order.payment.status === "PAID") {
      return {
        success: false,
        error: "Order is already paid",
        checkoutUrl: "",
      };
    }

    // Step 1: Get ShurjoPay token
    console.log("🔑 Getting ShurjoPay token...");
    const tokenData = await getShurjoPayToken();

    if (!tokenData.token) {
      return {
        success: false,
        error: "Payment gateway unavailable. Please try again.",
        checkoutUrl: "",
      };
    }

    // Step 2: Create ShurjoPay payment
    console.log("💳 Creating ShurjoPay payment...");
    const paymentResponse = await createShurjoPayPayment({
      token: tokenData.token,
      storeId: tokenData.store_id,
      orderId: order.id,
      amount: order.payment.amount,
      customerName,
      customerEmail,
      customerPhone,
      clientIp,
    });

    if (!paymentResponse.checkout_url) {
      return {
        success: false,
        error: "Failed to initiate payment. Please try again.",
        checkoutUrl: "",
      };
    }

    // Step 3: Update payment record with ShurjoPay order ID
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        paymentId: String(paymentResponse.sp_order_id),
        paymentMethod: "shurjopay",
        paymentGateway: "shurjopay",
      },
    });

    console.log("✅ ShurjoPay payment created, redirecting to checkout...");

    // Return checkout URL
    return {
      success: true,
      error: "",
      checkoutUrl: String(paymentResponse.checkout_url),
    };
  } catch (error: any) {
    console.error("❌ ShurjoPay error:", error?.message);
    return {
      success: false,
      error: "Failed to initiate payment. Please try again.",
      checkoutUrl: "",
    };
  }
}
