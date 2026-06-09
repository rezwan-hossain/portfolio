"use server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getRequestId } from "@/utils/requestUtils";

export async function getCheckoutData(packageId: number) {
  const requestId = await getRequestId();
  const start = Date.now();

  const log = logger.child({
    requestId,
    action: "getCheckoutData",
    packageId,
  });

  log.info("action:start");

  try {
    const dbStart = Date.now();

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        event: { include: { organizer: true } },
      },
    });

    const dbDuration = Date.now() - dbStart;

    if (!pkg) {
      log.warn(
        {
          db: {
            model: "Package",
            operation: "findUnique",
            durationMs: dbDuration,
          },
        },
        "db:not_found",
      );
      log.info({ durationMs: Date.now() - start }, "action:success");
      return { package: null, error: "Package not found" };
    }

    log.info(
      {
        db: {
          model: "Package",
          operation: "findUnique",
          durationMs: dbDuration,
        },
        eventId: pkg.eventId,
      },
      "db:success",
    );

    log.info({ durationMs: Date.now() - start, found: true }, "action:success");
    return { package: JSON.parse(JSON.stringify(pkg)) };
  } catch (error) {
    log.error({ err: error, durationMs: Date.now() - start }, "action:error");

    console.error("Failed to fetch checkout data:", error);
    return { package: null, error: "Failed to fetch checkout data" };
  }
}

// ─── CREATE GUEST USER ─────────────────────────────────────
// Creates a throwaway user row so Order.userId (non-nullable) is satisfied.
// Real email is stored in Registration.email, NOT here.
// isGuest = true so admins can filter/clean these up.
async function createGuestUser() {
  const guestUuid = crypto.randomUUID();
  const guestAuthId = `guest_${guestUuid}`;
  const guestEmail = `${guestAuthId.slice(0, 12)}@guest.com`;
  const guestName = `guest_${guestUuid.slice(0, 4)}`;

  // logger
  const requestId = await getRequestId();
  const start = Date.now();

  const log = logger.child({ requestId, action: "createGuestUser" });

  log.info("db:creating guest user");
  const dbStart = Date.now();

  const user = await prisma.user.create({
    data: {
      authId: guestAuthId,
      email: guestEmail,
      firstName: guestName,
      isGuest: true,
      role: "USER",
      isActive: true,
      isArchived: false,
    },
  });

  log.info(
    {
      db: {
        model: "User",
        operation: "create",
        durationMs: Date.now() - dbStart,
      },
      guestUserId: user.id,
    },
    "db:success",
  );

  return user;
}

export async function placeOrder(formData: {
  packageId: number;
  eventId: string;
  qty: number;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  ageCategory: string;
  bloodGroup: string;
  tshirtSize: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  communityName?: string;
  runnerCategory: string;
  paymentMethod: string;
  couponCode?: string;
}) {
  const requestId = await getRequestId();
  const start = Date.now();

  const log = logger.child({
    requestId,
    action: "placeOrder",
    packageId: formData.packageId,
    eventId: formData.eventId,
    qty: formData.qty,
    paymentMethod: formData.paymentMethod,
    hasCoupon: !!formData.couponCode,
  });

  log.info("action:start");

  // ─── RESOLVE USER (logged-in OR guest) ─────────────────

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbUser: { id: string } | null = null;
  let isGuest = false;

  if (user) {
    const dbStart = Date.now();

    dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });
    if (!dbUser) {
      log.error(
        {
          auth: { reason: "user_not_in_db" },
          db: {
            model: "User",
            operation: "findUnique",
            durationMs: Date.now() - dbStart,
          },
        },
        "auth:failure",
      );
      return { error: "User not found" };
    }

    log.info(
      {
        userId: dbUser.id,
        auth: { isGuest: false },
        db: {
          model: "User",
          operation: "findUnique",
          durationMs: Date.now() - dbStart,
        },
      },
      "auth:success",
    );
  } else {
    log.info({ auth: { reason: "no_session" } }, "auth:guest_path");

    try {
      dbUser = await createGuestUser();
      isGuest = true;
      log.info(
        { userId: dbUser.id, auth: { isGuest: true } },
        "auth:guest_created",
      );
    } catch (error) {
      log.error(
        {
          err: error,
          auth: { reason: "guest_creation_failed" },
          durationMs: Date.now() - start,
        },
        "auth:failure",
      );

      console.error("Failed to create guest user:", error);
      return { error: "Failed to process checkout. Please try again." };
    }
  }

  const userId = dbUser.id;

  // re-bind log with userId so every log below carries it
  const logWithUser = log.child({ userId, isGuest });

  try {
    const pkgStart = Date.now();

    const pkg = await prisma.package.findUnique({
      where: { id: formData.packageId },
    });
    const pkgDuration = Date.now() - pkgStart;

    if (!pkg) {
      logWithUser.warn(
        {
          db: {
            model: "Package",
            operation: "findUnique",
            durationMs: pkgDuration,
          },
        },
        "db:not_found",
      );
      return { error: "Package not found" };
    }

    logWithUser.info(
      {
        db: {
          model: "Package",
          operation: "findUnique",
          durationMs: pkgDuration,
        },
      },
      "db:success",
    );

    // ─── slot check ────────────────────────────────────────────

    const slotsLeft = pkg.availableSlots - pkg.usedSlots;
    if (slotsLeft < formData.qty) {
      logWithUser.warn(
        { slotsLeft, requestedQty: formData.qty },
        "order:slot_limit_exceeded",
      );

      return { error: `Only ${slotsLeft} slots remaining` };
    }

    // ─── CALCULATE PRICING ─────────────────────────────────
    const subtotal = Number(pkg.price) * formData.qty;
    let discount = 0;
    let couponId: string | null = null;

    // ─── VALIDATE COUPON ───────────────────────────────────
    if (formData.couponCode) {
      const couponCode = formData.couponCode.toUpperCase().trim();

      logWithUser.info({ couponCode }, "coupon:validating");

      const couponWhere = {
        code: formData.couponCode.toUpperCase().trim(),
        eventId: formData.eventId,
        isActive: true,
      };

      const couponStart = Date.now();

      if (!isGuest) {
        // Logged-in: full validation including per-user limit
        const coupon = await prisma.coupon.findFirst({
          where: couponWhere,
          include: {
            usages: { where: { userId: dbUser!.id } },
            packages: { select: { id: true } },
          },
        });

        logWithUser.info(
          {
            db: {
              model: "Coupon",
              operation: "findFirst",
              durationMs: Date.now() - couponStart,
            },
          },
          coupon ? "db:success" : "db:not_found",
        );

        if (!coupon) {
          logWithUser.warn({ couponCode }, "coupon:invalid — not found");
          return { error: "Invalid coupon code" };
        }

        // scope check
        if (coupon.scopeType === "PACKAGE") {
          const applicableIds = coupon.packages.map((p) => p.id);
          if (
            applicableIds.length > 0 &&
            !applicableIds.includes(formData.packageId)
          ) {
            logWithUser.warn(
              { couponCode, couponId: coupon.id },
              "coupon:invalid — not for this package",
            );

            return { error: "This coupon is not valid for this package" };
          }
        }

        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
          logWithUser.warn(
            { couponCode, couponId: coupon.id },
            "coupon:invalid — outside valid time window",
          );
          return { error: "Coupon is not valid at this time" };
        }
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
          logWithUser.warn(
            { couponCode, couponId: coupon.id },
            "coupon:invalid — global usage limit reached",
          );
          return { error: "Coupon usage limit reached" };
        }
        if (coupon.usages.length >= coupon.maxUsesPerUser) {
          logWithUser.warn(
            { couponCode, couponId: coupon.id },
            "coupon:invalid — already used this coupon",
          );

          return { error: "You have already used this coupon" };
        }
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          logWithUser.warn(
            { couponCode, couponId: coupon.id },
            "coupon:invalid — Minimum order amount",
          );

          return {
            error: `Minimum order amount is ৳${coupon.minOrderAmount}`,
          };
        }

        if (coupon.discountType === "PERCENTAGE") {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }

        logWithUser.info(
          { couponCode, couponId: coupon.id, discount, isGuest },
          "coupon:applied",
        );

        discount = Math.min(discount, subtotal);
        couponId = coupon.id;
      } else {
        // Guest: skip per-user limit, check everything else
        const coupon = await prisma.coupon.findFirst({
          where: couponWhere,
          include: {
            packages: { select: { id: true } },
          },
        });

        logWithUser.info(
          {
            db: {
              model: "Coupon",
              operation: "findFirst - Guest",
              durationMs: Date.now() - couponStart,
            },
          },
          coupon ? "db:success" : "db:not_found",
        );

        if (!coupon) {
          logWithUser.warn(
            { couponCode },
            "coupon:invalid — not found - Guest",
          );
          return { error: "Invalid coupon code" };
        }

        if (coupon.scopeType === "PACKAGE") {
          const applicableIds = coupon.packages.map((p) => p.id);
          if (
            applicableIds.length > 0 &&
            !applicableIds.includes(formData.packageId)
          ) {
            logWithUser.warn(
              { couponCode, couponId: coupon.id },
              "coupon:invalid — not for this package - Guest",
            );
            return { error: "This coupon is not valid for this package" };
          }
        }

        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
          logWithUser.warn(
            { couponCode, couponId: coupon.id },
            "coupon:invalid — outside valid time window - Guest",
          );
          return { error: "Coupon is not valid at this time" };
        }
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
          logWithUser.warn(
            { couponCode, couponId: coupon.id },
            "coupon:invalid — global usage limit reached",
          );
          return { error: "Coupon usage limit reached" };
        }
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          logWithUser.warn(
            { couponCode, couponId: coupon.id },
            "coupon:invalid — Minimum order amount - Guest",
          );

          return {
            error: `Minimum order amount is ৳${coupon.minOrderAmount}`,
          };
        }

        if (coupon.discountType === "PERCENTAGE") {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }

        logWithUser.info(
          { couponCode, couponId: coupon.id, discount, isGuest },
          "coupon:applied",
        );

        discount = Math.min(discount, subtotal);
        couponId = coupon.id;
      }
    }

    const total = subtotal - discount;

    logWithUser.info({ subtotal, discount, total }, "order:pricing_calculated");

    // ─── CREATE ORDER TRANSACTION ───────────────────────────

    logWithUser.info("db:transaction_start");
    const txStart = Date.now();

    const order = await prisma.$transaction(async (tx) => {
      logWithUser.info("tx:order.create");

      const newOrder = await tx.order.create({
        data: {
          userId: dbUser!.id,
          packageId: formData.packageId,
          eventId: formData.eventId,
          qty: formData.qty,
          subtotal,
          discount,
          total,
          status: "PENDING",
          couponId,
        },
      });

      logWithUser.info({ orderId: newOrder.id }, "tx:registration.create");

      await tx.registration.create({
        data: {
          eventId: formData.eventId,
          orderId: newOrder.id,
          email: formData.email || null, // ← real email stored here
          fullName: formData.fullName,
          phone: formData.phone.trim(),
          gender: formData.gender,
          birthDate: new Date(formData.birthDate),
          ageCategory: formData.ageCategory,
          bloodGroup: formData.bloodGroup,
          tshirtSize: formData.tshirtSize,
          emergencyContactName: formData.emergencyContactName || null,
          emergencyContactNumber: formData.emergencyContactNumber || null,
          communityName: formData.communityName || null,
          runnerCategory: formData.runnerCategory,
        },
      });

      logWithUser.info({ orderId: newOrder.id }, "tx:payment.create");

      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: Math.round(total),
          currency: "BDT",
          status: "PENDING",
          paymentMethod: formData.paymentMethod,
        },
      });

      logWithUser.info(
        { orderId: newOrder.id, qty: formData.qty },
        "tx:package.usedSlots.increment",
      );

      await tx.package.update({
        where: { id: formData.packageId },
        data: { usedSlots: { increment: formData.qty } },
      });

      return newOrder;
    });

    logWithUser.info(
      {
        orderId: order.id,
        total,
        discount,
        db: { operation: "transaction", durationMs: Date.now() - txStart },
      },
      "db:transaction_success",
    );

    logWithUser.info(
      { orderId: order.id, durationMs: Date.now() - start },
      "action:success",
    );

    return {
      success: true,
      orderId: order.id,
      amount: Math.round(total),
      discount: Math.round(discount),
      isGuest,
    };
  } catch (error) {
    logWithUser.error(
      { err: error, durationMs: Date.now() - start },
      "action:error",
    );
    console.error("Failed to place order:", error);
    return { error: "Failed to place order. Please try again." };
  }
}
