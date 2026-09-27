// lib/order-confirmation.ts
//
// What happens after an order is confirmed as paid: record coupon usage, then
// send the confirmation email and SMS. Shared by the ShurjoPay callback, the
// background payment reconciler and the "confirming your payment" page, so a
// runner gets the same messages whichever path confirmed them. Every step is
// non-fatal — a failed email never undoes a payment.
//
// ⚠️ Not a "use server" file — called only from trusted server code.

import { prisma } from "@/lib/prisma";
import { applyCoupon } from "@/lib/coupon/apply-coupon";
import { sendPaymentConfirmationEmail } from "@/lib/email/send-payment-confirmation";
import { formatBDPhone, getPaymentConfirmationSMS, sendSMS } from "@/lib/sms";
import type { ChildLogger } from "@/lib/logger";

export async function runPostPaymentSteps({
  orderId,
  transactionId,
  paymentMethod,
  log,
}: {
  orderId: string;
  transactionId: string;
  paymentMethod?: string;
  log: ChildLogger;
}): Promise<void> {
  // ─── Coupon Application ───────────────────────
  try {
    const orderForCoupon = await prisma.order.findUnique({
      where: { id: orderId },
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
      log.info(
        { couponId: orderForCoupon.couponId, orderId: orderForCoupon.id },
        "coupon:applying_usage",
      );

      console.log("🎟️ Applying coupon usage...");
      const couponResult = await applyCoupon({
        couponId: orderForCoupon.couponId,
        userId: orderForCoupon.userId,
        orderId: orderForCoupon.id,
        discount: orderForCoupon.discount,
      });

      if (couponResult.success) {
        log.info(
          { couponId: orderForCoupon.couponId },
          "coupon:usage_recorded",
        );
        console.log("✅ Coupon usage recorded");
      } else {
        log.error(
          {
            couponId: orderForCoupon.couponId,
            couponError: couponResult.error,
          },
          "coupon:usage_failed",
        );
        console.error("⚠️ Coupon failed:", couponResult.error);
      }
    }
  } catch (couponError) {
    log.error({ err: couponError }, "coupon:error — non-fatal");

    console.error("⚠️ Coupon error:", couponError instanceof Error ? couponError.message : couponError);
  } finally {
    await log.flush();
  }

  // ─── BIB, Email, SMS ──────────────────────────
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        registration: true,
        event: true,
        user: true,
        package: true,
        payment: true,
      },
    });

    if (order?.registration && order.event && order.package) {
      // const bibNumber = await autoAssignBibNumber(
      //   order.registration.id,
      //   order.eventId,
      //   order.packageId,
      // );

      // Email
      try {
        const emailResult = await sendPaymentConfirmationEmail({
          to: order.registration?.email || order.user.email,
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
          transactionId: transactionId,
          paymentMethod: paymentMethod,
          // bibNumber: bibNumber ?? undefined,
          tshirtSize: order.registration?.tshirtSize ?? undefined,
          bloodGroup: order.registration?.bloodGroup ?? undefined,
        });
        // if (emailResult.success) console.log("✅ Email sent");
        if (emailResult.success) {
          log.info(
            { notification: { type: "email" }, orderId: order.id },
            "notification:sent",
          );
        } else {
          log.error(
            { notification: { type: "email" }, orderId: order.id },
            "notification:failed",
          );
        }
      } catch (e) {
        log.error(
          { err: e, notification: { type: "email" }, orderId: order.id },
          "notification:error — non-fatal",
        );

        console.error("⚠️ Email error:", e instanceof Error ? e.message : e);
      } finally {
        await log.flush();
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
            // bibNumber: bibNumber ?? undefined,
            tshirtSize: order.registration?.tshirtSize ?? undefined,
          });
          const smsResult = await sendSMS({
            number: formattedPhone,
            message: smsMessage,
          });
          if (smsResult.success) {
            log.info(
              { notification: { type: "sms" }, orderId: order.id },
              "notification:sent",
            );
          } else {
            log.error(
              { notification: { type: "sms" }, orderId: order.id },
              "notification:failed",
            );
          }
        } else {
          log.warn(
            {
              notification: { type: "sms", reason: "no_phone_number" },
              orderId: order.id,
            },
            "notification:skipped",
          );
        }
      } catch (e) {
        log.error(
          { err: e, notification: { type: "sms" }, orderId: order.id },
          "notification:error — non-fatal",
        );

        console.error("⚠️ SMS error:", e instanceof Error ? e.message : e);
      } finally {
        await log.flush();
      }

      // if (bibNumber) {
      //   console.log(`✅ BIB ${bibNumber} assigned`);
      // }
    }
  } catch (e) {
    log.error({ err: e }, "payment:post_processing_error — non-fatal");
    console.error("⚠️ Post-payment processing error:", e instanceof Error ? e.message : e);
  } finally {
    await log.flush();
  }
}
