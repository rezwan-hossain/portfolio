// app/api/payment/shurjopay/callback/route.ts
import { autoAssignBibNumber, getEventBibPrefix } from "@/lib/bib";
import { prisma } from "@/lib/prisma";
import { verifyShurjoPayPayment } from "@/lib/shurjopay";
import { NextResponse, type NextRequest } from "next/server";

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

      // ──────────────────────────────────────────────────────
      // ✨ AUTO-ASSIGN BIB NUMBER AFTER PAYMENT CONFIRMED
      // ──────────────────────────────────────────────────────
      try {
        const order = await prisma.order.findUnique({
          where: { id: payment.orderId },
          include: {
            registration: true,
            event: true,
          },
        });

        if (order?.registration && order.event) {
          const prefix = getEventBibPrefix(order.eventId);
          const bibNumber = await autoAssignBibNumber(
            order.registration.id,
            order.eventId,
            prefix,
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
