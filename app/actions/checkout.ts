// app/actions/checkout.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCheckoutData(packageId: number) {
  try {
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        event: { include: { organizer: true } },
      },
    });
    if (!pkg) return { package: null, error: "Package not found" };
    return { package: JSON.parse(JSON.stringify(pkg)) };
  } catch (error) {
    console.error("Failed to fetch checkout data:", error);
    return { package: null, error: "Failed to fetch checkout data" };
  }
}

export async function placeOrder(formData: {
  packageId: number;
  eventId: string;
  qty: number;
  fullName: string;
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
  couponCode?: string; // ← NEW
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to place an order" };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) return { error: "User not found" };

    const pkg = await prisma.package.findUnique({
      where: { id: formData.packageId },
    });

    if (!pkg) return { error: "Package not found" };

    const slotsLeft = pkg.availableSlots - pkg.usedSlots;
    if (slotsLeft < formData.qty) {
      return { error: `Only ${slotsLeft} slots remaining` };
    }

    // ─── CALCULATE PRICING ─────────────────────────
    const subtotal = Number(pkg.price) * formData.qty;
    let discount = 0;
    let couponId: string | null = null;

    // ─── VALIDATE COUPON IF PROVIDED ───────────────
    if (formData.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: formData.couponCode.toUpperCase().trim(),
          eventId: formData.eventId,
          isActive: true,
        },
        include: {
          usages: { where: { userId: dbUser.id } },
        },
      });

      if (!coupon) return { error: "Invalid coupon code" };

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return { error: "Coupon is not valid at this time" };
      }

      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return { error: "Coupon usage limit reached" };
      }

      if (coupon.usages.length >= coupon.maxUsesPerUser) {
        return { error: "You have already used this coupon" };
      }

      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        return { error: `Minimum order amount is ৳${coupon.minOrderAmount}` };
      }

      if (coupon.discountType === "PERCENTAGE") {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discountValue;
      }

      discount = Math.min(discount, subtotal);
      couponId = coupon.id;
    }

    const total = subtotal - discount;

    // ─── CREATE ORDER TRANSACTION ──────────────────
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: dbUser.id,
          packageId: formData.packageId,
          eventId: formData.eventId,
          qty: formData.qty,
          subtotal,
          discount,
          total,
          status: "PENDING",
        },
      });

      await tx.registration.create({
        data: {
          eventId: formData.eventId,
          orderId: newOrder.id,
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

      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: Math.round(total),
          currency: "BDT",
          status: "PENDING",
          paymentMethod: formData.paymentMethod,
        },
      });

      // ─── RECORD COUPON USAGE ───────────────────
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            couponId,
            userId: dbUser.id,
            orderId: newOrder.id,
            discount,
          },
        });

        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.package.update({
        where: { id: formData.packageId },
        data: { usedSlots: { increment: formData.qty } },
      });

      return newOrder;
    });

    return {
      success: true,
      orderId: order.id,
      amount: Math.round(total),
      discount: Math.round(discount),
    };
  } catch (error) {
    console.error("Failed to place order:", error);
    return { error: "Failed to place order. Please try again." };
  }
}
