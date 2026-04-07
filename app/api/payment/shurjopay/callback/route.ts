// app/api/payment/shurjopay/callback/route.ts
import { autoAssignBibNumber } from "@/lib/bib-package-prefix";
import { sendPaymentConfirmationEmail } from "@/lib/email/send-payment-confirmation";
import { prisma } from "@/lib/prisma";
import {
  verifyShurjoPayPayment,
  isPaymentSuccessful,
  isPaymentCancelled,
  isPaymentDeclined,
  getPaymentStatusMessage,
  SP_CODE,
} from "@/lib/shurjopay2";
import { formatBDPhone, getPaymentConfirmationSMS, sendSMS } from "@/lib/sms";
import { NextRequest, NextResponse } from "next/server";

import { applyCoupon } from "@/app/actions/coupon";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // ✅ Check multiple possible parameter names
  const spOrderId =
    searchParams.get("order_id") ||
    searchParams.get("sp_order_id") ||
    searchParams.get("orderId");

  const origin = new URL(request.url).origin;

  console.log("📥 ShurjoPay callback received:", {
    spOrderId,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  if (!spOrderId) {
    console.error("❌ No order_id in callback");
    return NextResponse.redirect(
      `${origin}/payment/failed?reason=missing_order`,
    );
  }

  try {
    // ─── Verify payment with ShurjoPay ──────────────
    console.log("🔍 Verifying payment with ShurjoPay...");

    let verifyData;
    try {
      verifyData = await verifyShurjoPayPayment(spOrderId);
    } catch (verifyError: any) {
      console.error("❌ Verification API error:", verifyError?.message);

      // Find payment and keep as PENDING for manual review
      const paymentBySpOrderId = await prisma.payment.findFirst({
        where: { paymentId: spOrderId },
      });

      if (paymentBySpOrderId) {
        console.log(
          "⚠️ Payment marked for manual review:",
          paymentBySpOrderId.id,
        );
      }

      return NextResponse.redirect(
        `${origin}/payment/failed?reason=verification_error`,
      );
    }

    if (!verifyData || verifyData.length === 0) {
      console.error("❌ Verification returned empty data");
      return NextResponse.redirect(
        `${origin}/payment/failed?reason=verification_failed`,
      );
    }

    const paymentInfo = verifyData[0];

    // ✅ CRITICAL: Log sp_code which is the ONLY reliable field
    console.log("📋 Payment verification result:", {
      sp_code: paymentInfo.sp_code,
      sp_code_type: typeof paymentInfo.sp_code,
      sp_message: paymentInfo.sp_message,
      method: paymentInfo.method,
      amount: paymentInfo.amount,
      received_amount: paymentInfo.received_amount,
      order_id: paymentInfo.order_id,
      value1: paymentInfo.value1,
      status_message: getPaymentStatusMessage(paymentInfo),
    });

    // ─── Find payment in DB ─────────────────────────
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { paymentId: spOrderId },
          { orderId: paymentInfo.value1 },
          // ✅ Also check customer_order_id if it exists
          ...(paymentInfo.customer_order_id
            ? [{ orderId: paymentInfo.customer_order_id }]
            : []),
        ],
      },
      include: { order: true },
    });

    if (!payment) {
      console.error("❌ Payment not found in DB:", {
        spOrderId,
        value1: paymentInfo.value1,
      });
      return NextResponse.redirect(
        `${origin}/payment/failed?reason=payment_not_found`,
      );
    }

    console.log("📦 Found payment:", payment.id, "for order:", payment.orderId);

    // ✅ Idempotency check
    if (payment.status === "PAID") {
      console.log("ℹ️ Payment already PAID, redirecting to success");
      return NextResponse.redirect(
        `${origin}/payment/success?orderId=${payment.orderId}`,
      );
    }

    // ─── Check payment status using sp_code (per documentation) ───────
    const spCode = Number(paymentInfo.sp_code);

    console.log("📊 Payment status check:", {
      sp_code: spCode,
      is_success: spCode === SP_CODE.SUCCESS,
      is_cancelled: spCode === SP_CODE.CANCELLED_BY_CUSTOMER,
      is_declined: spCode === SP_CODE.DECLINED_BY_BANK,
    });

    // ✅ SUCCESS: sp_code === 1000
    if (spCode === SP_CODE.SUCCESS) {
      console.log("✅ Payment SUCCESS (sp_code=1000) — updating DB...");

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            // ✅ Use order_id from verification as transaction reference
            transactionId: paymentInfo.order_id || spOrderId,
            paymentMethod: paymentInfo.method || "shurjopay",
            paymentGateway: "shurjopay",
            paymentId: spOrderId,
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "CONFIRMED" },
        });
      });

      // ─── Coupon Application ───────────────────────
      try {
        const orderForCoupon = await prisma.order.findUnique({
          where: { id: payment.orderId },
          select: {
            id: true,
            userId: true,
            couponId: true,
            discount: true,
            couponUsage: true,
          },
        });

        if (
          orderForCoupon?.couponId &&
          orderForCoupon.discount > 0 &&
          !orderForCoupon.couponUsage
        ) {
          console.log("🎟️ Applying coupon usage...");
          const couponResult = await applyCoupon({
            couponId: orderForCoupon.couponId,
            userId: orderForCoupon.userId,
            orderId: orderForCoupon.id,
            discount: orderForCoupon.discount,
          });

          if (couponResult.success) {
            console.log("✅ Coupon usage recorded");
          } else {
            console.error("⚠️ Coupon failed:", couponResult.error);
          }
        }
      } catch (couponError: any) {
        console.error("⚠️ Coupon error:", couponError?.message);
      }

      // ─── BIB, Email, SMS ──────────────────────────
      try {
        const order = await prisma.order.findUnique({
          where: { id: payment.orderId },
          include: {
            registration: true,
            event: true,
            user: true,
            package: true,
            payment: true,
          },
        });

        if (order?.registration && order.event && order.package) {
          const bibNumber = await autoAssignBibNumber(
            order.registration.id,
            order.eventId,
            order.packageId,
          );

          // Email
          try {
            const emailResult = await sendPaymentConfirmationEmail({
              to: order.user.email,
              runnerName:
                order.registration?.fullName ||
                order.user.firstName ||
                "Runner",
              eventName: order.event.name,
              eventDate: order.event.date,
              eventAddress: order.event.address,
              packageName: order.package.name,
              distance: order.package.distance,
              amount: order.payment?.amount || 0,
              orderId: order.id,
              orderDate: order.createdAt,
              orderStatus: order.status,
              paymentStatus: order.payment?.status || "PENDING",
              transactionId: paymentInfo.order_id || spOrderId,
              paymentMethod: paymentInfo.method || undefined,
              bibNumber: bibNumber ?? undefined,
              tshirtSize: order.registration?.tshirtSize ?? undefined,
              bloodGroup: order.registration?.bloodGroup ?? undefined,
            });
            if (emailResult.success) console.log("✅ Email sent");
          } catch (e: any) {
            console.error("⚠️ Email error:", e?.message);
          }

          // SMS
          try {
            const phoneNumber = order.registration?.phone || order.user?.phone;
            if (phoneNumber) {
              const formattedPhone = formatBDPhone(phoneNumber);
              const smsMessage = getPaymentConfirmationSMS({
                runnerName:
                  order.registration?.fullName ||
                  order.user.firstName ||
                  "Runner",
                eventName: order.event.name,
                bibNumber: bibNumber ?? undefined,
                tshirtSize: order.registration?.tshirtSize ?? undefined,
              });
              const smsResult = await sendSMS({
                number: formattedPhone,
                message: smsMessage,
              });
              if (smsResult.success) console.log("✅ SMS sent");
            }
          } catch (e: any) {
            console.error("⚠️ SMS error:", e?.message);
          }

          if (bibNumber) {
            console.log(`✅ BIB ${bibNumber} assigned`);
          }
        }
      } catch (e: any) {
        console.error("⚠️ Post-payment processing error:", e?.message);
      }

      console.log("✅ Order confirmed, redirecting to success");
      return NextResponse.redirect(
        `${origin}/payment/success?orderId=${payment.orderId}`,
      );
    }

    // ✅ CANCELLED: sp_code === 1002
    if (spCode === SP_CODE.CANCELLED_BY_CUSTOMER) {
      console.log("⚠️ Payment CANCELLED (sp_code=1002)");
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          paymentMethod: paymentInfo.method || "shurjopay",
          paymentGateway: "shurjopay",
        },
      });

      return NextResponse.redirect(
        `${origin}/payment/failed?orderId=${payment.orderId}&reason=cancelled`,
      );
    }

    // ✅ DECLINED: sp_code === 1001
    if (spCode === SP_CODE.DECLINED_BY_BANK) {
      console.log("❌ Payment DECLINED by bank (sp_code=1001)");
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          paymentMethod: paymentInfo.method || "shurjopay",
          paymentGateway: "shurjopay",
        },
      });

      return NextResponse.redirect(
        `${origin}/payment/failed?orderId=${payment.orderId}&reason=declined`,
      );
    }

    // ─── Unknown sp_code ────────────────────────────
    console.error("❓ Unknown sp_code:", {
      sp_code: spCode,
      sp_message: paymentInfo.sp_message,
    });

    // Keep as PENDING for manual review
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PENDING",
        paymentId: spOrderId,
      },
    });

    return NextResponse.redirect(
      `${origin}/payment/failed?orderId=${payment.orderId}&reason=unknown_status`,
    );
  } catch (error: any) {
    console.error("❌ Callback error:", error?.message);
    return NextResponse.redirect(
      `${origin}/payment/failed?reason=server_error`,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    console.log("📥 ShurjoPay POST callback body:", body);

    if (body.order_id || body.sp_order_id) {
      const url = new URL(request.url);
      url.searchParams.set("order_id", body.order_id || body.sp_order_id);
      const newRequest = new NextRequest(url, {
        method: "GET",
        headers: request.headers,
      });
      return GET(newRequest);
    }
  } catch (e) {
    console.log("POST body parse failed, using GET params");
  }

  return GET(request);
}
