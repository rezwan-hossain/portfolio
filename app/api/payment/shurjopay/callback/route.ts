// app/api/payment/shurjopay/callback/route.ts
// import { autoAssignBibNumber, getEventBibPrefix } from "@/lib/bib";
import { autoAssignBibNumber } from "@/lib/bib-package-prefix";
import { sendPaymentConfirmationEmail } from "@/lib/email/send-payment-confirmation";
import { prisma } from "@/lib/prisma";
import { verifyShurjoPayPayment } from "@/lib/shurjopay";
import { formatBDPhone, getPaymentConfirmationSMS, sendSMS } from "@/lib/sms";
import { NextResponse, type NextRequest } from "next/server";
import { applyCoupon } from "@/app/actions/coupon";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spOrderId = searchParams.get("order_id");
  const origin = new URL(request.url).origin;

  console.log("📥 ShurjoPay callback received:", { spOrderId });

  // ─── No order ID ──────────────────────────────────
  if (!spOrderId) {
    console.error("❌ No order_id in callback");
    return NextResponse.redirect(
      `${origin}/payment/failed?reason=missing_order`,
    );
  }

  try {
    // ─── Verify payment with ShurjoPay ──────────────
    console.log("🔍 Verifying payment with ShurjoPay...");
    const verifyData = await verifyShurjoPayPayment(spOrderId);

    if (!verifyData || verifyData.length === 0) {
      console.error("❌ Verification returned empty data");
      return NextResponse.redirect(
        `${origin}/payment/failed?reason=verification_failed`,
      );
    }

    const paymentInfo = verifyData[0];
    console.log("📋 Payment info:", {
      bank_status: paymentInfo.bank_status,
      sp_code: paymentInfo.sp_code,
      transaction_status: paymentInfo.transaction_status,
      bank_trx_id: paymentInfo.bank_trx_id,
      amount: paymentInfo.amount,
      method: paymentInfo.method,
      customer_order_id: paymentInfo.customer_order_id,
      value1: paymentInfo.value1,
    });

    // ─── Find payment in DB ─────────────────────────
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { paymentId: spOrderId },
          { orderId: paymentInfo.customer_order_id },
          { orderId: paymentInfo.value1 },
        ],
      },
      include: { order: true },
    });

    if (!payment) {
      console.error("❌ Payment not found in DB for:", spOrderId);
      return NextResponse.redirect(
        `${origin}/payment/failed?reason=payment_not_found`,
      );
    }

    console.log("📦 Found payment:", payment.id, "for order:", payment.orderId);

    // ─── Check payment status ───────────────────────
    const isSuccess =
      paymentInfo.bank_status === "Success" ||
      paymentInfo.sp_code === 1000 ||
      paymentInfo.transaction_status === "Completed";

    const isCancelled =
      paymentInfo.bank_status === "Cancel" ||
      paymentInfo.transaction_status === "Cancelled";

    const isFailed =
      paymentInfo.bank_status === "Failed" ||
      paymentInfo.transaction_status === "Failed";

    if (isSuccess) {
      console.log("✅ Payment SUCCESS — updating DB...");

      await prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            transactionId: paymentInfo.bank_trx_id || null,
            paymentMethod: paymentInfo.method || "shurjopay",
            paymentGateway: "shurjopay",
          },
        });

        // Confirm order
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "CONFIRMED" },
        });
      });

      // ⭐ ADD THIS BLOCK — Apply coupon AFTER payment confirmed
      // ──────────────────────────────────────────────────────
      // ✨ APPLY COUPON USAGE (only after successful payment!)
      // ──────────────────────────────────────────────────────
      try {
        const orderForCoupon = await prisma.order.findUnique({
          where: { id: payment.orderId },
          select: {
            id: true,
            userId: true,
            couponId: true,
            discount: true,
            couponUsage: true, // Check if already applied
          },
        });

        // Apply coupon if:
        // 1. Order has a couponId (coupon was used)
        // 2. Discount > 0
        // 3. CouponUsage doesn't exist yet (not already applied)
        if (
          orderForCoupon?.couponId &&
          orderForCoupon.discount > 0 &&
          !orderForCoupon.couponUsage
        ) {
          console.log("🎟️ Applying coupon usage for order:", payment.orderId);

          const couponResult = await applyCoupon({
            couponId: orderForCoupon.couponId,
            userId: orderForCoupon.userId,
            orderId: orderForCoupon.id,
            discount: orderForCoupon.discount,
          });

          if (couponResult.success) {
            console.log("✅ Coupon usage recorded successfully");
          } else {
            console.error(
              "⚠️ Failed to record coupon usage:",
              couponResult.error,
            );
          }
        } else if (orderForCoupon?.couponUsage) {
          console.log("ℹ️ Coupon already applied for this order");
        }
      } catch (couponError: any) {
        // Don't fail the payment if coupon application fails
        console.error(
          "⚠️ Coupon application error (non-critical):",
          couponError?.message,
        );
      }
      // ⭐ END OF COUPON BLOCK
      // ──────────────────────────────────────────────────────

      // ──────────────────────────────────────────────────────
      // ✨ AUTO-ASSIGN BIB NUMBER AFTER PAYMENT CONFIRMED
      // ──────────────────────────────────────────────────────
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
          // const prefix = getEventBibPrefix(order.eventId);
          // const bibNumber = await autoAssignBibNumber(
          //   order.registration.id,
          //   order.eventId,
          //   prefix,
          // );

          const bibNumber = await autoAssignBibNumber(
            order.registration.id,
            order.eventId,
            order.packageId, // ← just pass packageId, prefix resolved internally
          );

          // ✅ Send BIB email to runner TODO: Implement sendBibEmail function and uncomment
          // if (bibNumber && order.user?.email) {
          //   await sendBibEmail({
          //     to: order.user.email,
          //     bibNumber,
          //     eventName: order.event.name,
          //     runnerName: order.registration.fullName,
          //   });
          // }

          // ──────────────────────────────────────────────────────
          // ✨ SEND CONFIRMATION EMAIL
          // ──────────────────────────────────────────────────────
          console.log("📧 Sending payment confirmation email...");
          try {
            // const emailResult = await sendPaymentConfirmationEmail({
            //   to: order.user.email,
            //   runnerName: order.registration?.fullName || order.user.firstName || "Runner",
            // });
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
              transactionId: order.payment?.transactionId ?? undefined,
              paymentMethod: order.payment?.paymentMethod ?? undefined,
              bibNumber: bibNumber ?? undefined,
              tshirtSize: order.registration?.tshirtSize ?? undefined,
              bloodGroup: order.registration?.bloodGroup ?? undefined,
            });
            if (emailResult.success) {
              console.log("✅ Confirmation email sent");
            } else {
              console.error(
                "⚠️ Email failed (non-critical):",
                emailResult.error,
              );
            }
          } catch (emailError: any) {
            // Don't fail payment if email fails
            console.error(
              "⚠️ Email error (non-critical):",
              emailError?.message,
            );
          }
          // ──────────────────────────────────────────────────────

          // ──────────────────────────────────────────────────────
          // ✨ SEND CONFIRMATION SMS
          // ──────────────────────────────────────────────────────
          console.log("📱 Sending payment confirmation SMS...");
          try {
            // Check if user has phone number
            if (order.registration?.phone || order.user?.phone) {
              const phoneNumber =
                order.registration?.phone || order.user?.phone || "";
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

              if (smsResult.success) {
                console.log("✅ Confirmation SMS sent to:", formattedPhone);
              } else {
                console.error("⚠️ SMS failed (non-critical):", smsResult.error);
              }
            } else {
              console.warn("⚠️ No phone number found for user");
            }
          } catch (smsError: any) {
            // Don't fail payment if SMS fails
            console.error("⚠️ SMS error (non-critical):", smsError?.message);
          }
          // ──────────────────────────────────────────────────────

          if (bibNumber) {
            console.log(`✅ BIB ${bibNumber} assigned to order ${order.id}`);
          } else {
            console.warn(`⚠️ Failed to auto-assign BIB for order ${order.id}`);
          }
        }
      } catch (bibError: any) {
        // Don't fail the payment if BIB assignment fails
        console.error(
          "⚠️ BIB assignment error (non-critical):",
          bibError?.message,
        );
      }
      // ──────────────────────────────────────────────────────

      console.log("✅ Order confirmed, redirecting to success page");
      return NextResponse.redirect(
        `${origin}/payment/success?orderId=${payment.orderId}`,
      );
    }

    if (isCancelled) {
      console.log("⚠️ Payment CANCELLED");
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

    if (isFailed) {
      console.log("❌ Payment FAILED");
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          paymentMethod: paymentInfo.method || "shurjopay",
        },
      });

      return NextResponse.redirect(
        `${origin}/payment/failed?orderId=${payment.orderId}&reason=payment_failed`,
      );
    }

    // ─── Unknown status ─────────────────────────────
    console.error("❓ Unknown payment status:", paymentInfo.bank_status);
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });

    return NextResponse.redirect(
      `${origin}/payment/failed?orderId=${payment.orderId}&reason=unknown`,
    );
  } catch (error: any) {
    console.error("❌ Callback error:", error?.message);
    return NextResponse.redirect(
      `${origin}/payment/failed?reason=server_error`,
    );
  }
}

// ShurjoPay might POST to callback
export async function POST(request: NextRequest) {
  return GET(request);
}
