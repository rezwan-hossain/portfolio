"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getShurjoPayToken, createShurjoPayPayment } from "@/lib/shurjopay";
import { getClientIp } from "@/lib/get-client-ip";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/utils/requestUtils";

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
  // const supabase = await createClient();
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // if (!user) {
  //   return { success: false, error: "You must be logged in", checkoutUrl: "" };
  // }

  const requestId = await getRequestId();
  const start = Date.now();

  const log = logger.child({
    requestId,
    action: "initiateShurjoPayPayment",
    orderId,
  });

  log.info("action:start");

  try {
    // ✅ Get client IP at the start
    const clientIp = await getClientIp();
    console.log("🌐 Client IP:", clientIp);
    log.info({ clientIp }, "client_ip:resolved");

    // Get order with payment
    const dbStart = Date.now();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        package: true,
        event: true,
      },
    });

    const dbDuration = Date.now() - dbStart;

    if (!order) {
      log.warn(
        {
          db: {
            model: "Order",
            operation: "findUnique",
            durationMs: dbDuration,
          },
        },
        "db:not_found",
      );

      return { success: false, error: "Order not found", checkoutUrl: "" };
    }

    log.info(
      {
        db: { model: "Order", operation: "findUnique", durationMs: dbDuration },
      },
      "db:success",
    );

    if (!order.payment) {
      log.error({ orderId }, "payment:record_missing");
      return {
        success: false,
        error: "Payment record not found",
        checkoutUrl: "",
      };
    }

    if (order.payment.status === "PAID") {
      log.warn(
        { paymentId: order.payment.id },
        "payment:already_paid — duplicate initiation attempt",
      );

      return {
        success: false,
        error: "Order is already paid",
        checkoutUrl: "",
      };
    }

    // Step 1: Get ShurjoPay token
    log.info(
      { externalApi: { service: "shurjopay", operation: "getToken" } },
      "external_api:start",
    );

    const tokenStart = Date.now();

    console.log("🔑 Getting ShurjoPay token...");
    const tokenData = await getShurjoPayToken();

    const tokenDuration = Date.now() - tokenStart;

    if (!tokenData.token) {
      log.error(
        {
          externalApi: {
            service: "shurjopay",
            operation: "getToken",
            durationMs: tokenDuration,
          },
        },
        "external_api:failure — empty token",
      );

      return {
        success: false,
        error: "Payment gateway unavailable. Please try again.",
        checkoutUrl: "",
      };
    }

    log.info(
      {
        externalApi: {
          service: "shurjopay",
          operation: "getToken",
          durationMs: tokenDuration,
        },
      },
      "external_api:success",
    );

    // Step 2: Create ShurjoPay payment

    log.info(
      {
        externalApi: { service: "shurjopay", operation: "createPayment" },
        amount: order.payment.amount,
      },
      "external_api:start",
    );

    const paymentStart = Date.now();

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

    const paymentDuration = Date.now() - paymentStart;

    if (!paymentResponse.checkout_url) {
      log.error(
        {
          externalApi: {
            service: "shurjopay",
            operation: "createPayment",
            durationMs: paymentDuration,
          },
          spOrderId: paymentResponse.sp_order_id,
        },
        "external_api:failure — no checkout_url",
      );

      return {
        success: false,
        error: "Failed to initiate payment. Please try again.",
        checkoutUrl: "",
      };
    }

    log.info(
      {
        externalApi: {
          service: "shurjopay",
          operation: "createPayment",
          durationMs: paymentDuration,
        },
        spOrderId: paymentResponse.sp_order_id,
      },
      "external_api:success",
    );

    // Step 3: Update payment record with ShurjoPay order ID
    const updateStart = Date.now();

    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        paymentId: String(paymentResponse.sp_order_id),
        paymentMethod: "shurjopay",
        paymentGateway: "shurjopay",
      },
    });

    console.log("✅ ShurjoPay payment created, redirecting to checkout...");
    log.info(
      {
        db: {
          model: "Payment",
          operation: "update",
          durationMs: Date.now() - updateStart,
        },
        spOrderId: paymentResponse.sp_order_id,
      },
      "db:success",
    );

    log.info(
      {
        spOrderId: paymentResponse.sp_order_id,
        durationMs: Date.now() - start,
      },
      "action:success",
    );
    // Return checkout URL
    return {
      success: true,
      error: "",
      checkoutUrl: String(paymentResponse.checkout_url),
    };
  } catch (error: any) {
    log.error({ err: error, durationMs: Date.now() - start }, "action:error");
    console.error("❌ ShurjoPay error:", error?.message);
    return {
      success: false,
      error: "Failed to initiate payment. Please try again.",
      checkoutUrl: "",
    };
  }
}
