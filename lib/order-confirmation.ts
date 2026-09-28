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
import { formatBDPhone, sendSMS } from "@/lib/sms";
import { buildConfirmationSms } from "@/lib/sms-template-server";
import { recordDelivery } from "@/lib/notification-log";
import type { ChildLogger } from "@/lib/logger";

export async function runPostPaymentSteps({
  orderId,
  transactionId,
  paymentMethod,
  log,
  only,
  resentBy,
}: {
  orderId: string;
  transactionId: string;
  paymentMethod?: string;
  log: ChildLogger;
  /** Resend: send only these messages and skip the coupon step. */
  only?: ("email" | "sms")[];
  /** Resend: the admin who asked, shown in the delivery log. */
  resentBy?: string;
}): Promise<void> {
  const sendEmail = !only || only.includes("email");
  const sendSms = !only || only.includes("sms");
  const record = (entry: Parameters<typeof recordDelivery>[0]) =>
    recordDelivery({ ...entry, note: resentBy ? `resent by ${resentBy}` : undefined });

  // ─── Coupon Application (not on a resend) ─────
  if (!only) try {
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
      const emailTo = order.registration?.email || order.user.email || null;
      if (sendEmail) try {
        // Guest checkouts without an email get a placeholder address ending in
        // ".invalid" — it can never receive mail, so don't try.
        if (!emailTo || emailTo.endsWith(".invalid")) {
          await record({
            orderId: order.id,
            eventId: order.eventId,
            channel: "email",
            status: "skipped",
            to: null,
            reason: "no email address on this registration",
          });
          throw new SkipEmail();
        }
        const emailResult = await sendPaymentConfirmationEmail({
          to: emailTo,
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
        await record({
          orderId: order.id,
          eventId: order.eventId,
          channel: "email",
          status: emailResult.success ? "sent" : "failed",
          to: emailTo,
          reason: emailResult.success ? null : (emailResult.error ?? "unknown error"),
          providerRef: emailResult.success ? (emailResult.messageId ?? null) : null,
        });
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
        // SkipEmail = no real address; already recorded as skipped.
        if (!(e instanceof SkipEmail)) {
          await record({
            orderId: order.id,
            eventId: order.eventId,
            channel: "email",
            status: "failed",
            to: emailTo,
            reason: e instanceof Error ? e.message : String(e),
          });
          log.error(
            { err: e, notification: { type: "email" }, orderId: order.id },
            "notification:error — non-fatal",
          );

          console.error("⚠️ Email error:", e instanceof Error ? e.message : e);
        }
      } finally {
        await log.flush();
      }

      // SMS
      if (sendSms) try {
        const phoneNumber = order.registration?.phone || order.user?.phone;
        if (phoneNumber) {
          const formattedPhone = formatBDPhone(phoneNumber);
          // Admin-editable template (event's own → default → built-in).
          const smsMessage = await buildConfirmationSms(order.eventId, {
            name:
              order.registration?.fullName ||
              order.user.firstName ||
              "Runner",
            event: order.event.name,
            package: order.package.name,
            distance: order.package.distance,
            tshirt: order.registration?.tshirtSize ?? undefined,
            bib: order.registration?.bibNumber ?? undefined,
            eventDate: new Date(order.event.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "Asia/Dhaka",
            }),
            orderId: order.id.slice(0, 8).toUpperCase(),
            amount: order.payment ? `৳${order.payment.amount.toLocaleString("en-IN")}` : undefined,
          });
          const smsResult = await sendSMS({
            number: formattedPhone,
            message: smsMessage,
          });
          await record({
            orderId: order.id,
            eventId: order.eventId,
            channel: "sms",
            status: smsResult.success ? "sent" : "failed",
            to: phoneNumber,
            reason: smsResult.success ? null : (smsResult.error ?? "unknown error"),
            // The gateway's own reply — it can say "error" even with HTTP 200.
            providerRef: smsResult.data ? JSON.stringify(smsResult.data) : null,
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
          await record({
            orderId: order.id,
            eventId: order.eventId,
            channel: "sms",
            status: "skipped",
            to: null,
            reason: "no phone number on this registration",
          });
          log.warn(
            {
              notification: { type: "sms", reason: "no_phone_number" },
              orderId: order.id,
            },
            "notification:skipped",
          );
        }
      } catch (e) {
        await record({
          orderId: order.id,
          eventId: order.eventId,
          channel: "sms",
          status: "failed",
          to: order.registration?.phone || order.user?.phone || null,
          reason: e instanceof Error ? e.message : String(e),
        });
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

// Thrown to leave the email step early when there is no real address.
class SkipEmail extends Error {}
