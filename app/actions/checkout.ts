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

// ─── CREATE GUEST USER ─────────────────────────────────────
// Creates a throwaway user row so Order.userId (non-nullable) is satisfied.
// Real email is stored in Registration.email, NOT here.
// isGuest = true so admins can filter/clean these up.
async function createGuestUser() {
  const guestUuid = crypto.randomUUID();
  const guestAuthId = `guest_${guestUuid}`;
  const guestEmail = `${guestAuthId.slice(0, 12)}@guest.com`;
  const guestName = `guest_${guestUuid.slice(0, 4)}`;

  return await prisma.user.create({
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
  // ─── RESOLVE USER (logged-in OR guest) ─────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbUser: { id: string } | null = null;
  let isGuest = false;

  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });
    if (!dbUser) return { error: "User not found" };
  } else {
    try {
      dbUser = await createGuestUser();
      isGuest = true;
    } catch (error) {
      console.error("Failed to create guest user:", error);
      return { error: "Failed to process checkout. Please try again." };
    }
  }

  try {
    const pkg = await prisma.package.findUnique({
      where: { id: formData.packageId },
    });

    if (!pkg) return { error: "Package not found" };

    const slotsLeft = pkg.availableSlots - pkg.usedSlots;
    if (slotsLeft < formData.qty) {
      return { error: `Only ${slotsLeft} slots remaining` };
    }

    // ─── CALCULATE PRICING ─────────────────────────────────
    const subtotal = Number(pkg.price) * formData.qty;
    let discount = 0;
    let couponId: string | null = null;

    // ─── VALIDATE COUPON ───────────────────────────────────
    if (formData.couponCode) {
      const couponWhere = {
        code: formData.couponCode.toUpperCase().trim(),
        eventId: formData.eventId,
        isActive: true,
      };

      if (!isGuest) {
        // Logged-in: full validation including per-user limit
        const coupon = await prisma.coupon.findFirst({
          where: couponWhere,
          include: {
            usages: { where: { userId: dbUser!.id } },
            packages: { select: { id: true } },
          },
        });

        if (!coupon) return { error: "Invalid coupon code" };

        if (coupon.scopeType === "PACKAGE") {
          const applicableIds = coupon.packages.map((p) => p.id);
          if (
            applicableIds.length > 0 &&
            !applicableIds.includes(formData.packageId)
          ) {
            return { error: "This coupon is not valid for this package" };
          }
        }

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

        if (!coupon) return { error: "Invalid coupon code" };

        if (coupon.scopeType === "PACKAGE") {
          const applicableIds = coupon.packages.map((p) => p.id);
          if (
            applicableIds.length > 0 &&
            !applicableIds.includes(formData.packageId)
          ) {
            return { error: "This coupon is not valid for this package" };
          }
        }

        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
          return { error: "Coupon is not valid at this time" };
        }
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
          return { error: "Coupon usage limit reached" };
        }
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
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

        discount = Math.min(discount, subtotal);
        couponId = coupon.id;
      }
    }

    const total = subtotal - discount;

    // ─── CREATE ORDER TRANSACTION ───────────────────────────
    const order = await prisma.$transaction(async (tx) => {
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

      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: Math.round(total),
          currency: "BDT",
          status: "PENDING",
          paymentMethod: formData.paymentMethod,
        },
      });

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
      isGuest,
    };
  } catch (error) {
    console.error("Failed to place order:", error);
    return { error: "Failed to place order. Please try again." };
  }
}
