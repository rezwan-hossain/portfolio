// app/actions/coupon.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";

export type CouponValidationResult = {
  valid: boolean;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    maxDiscount: number | null;
  };
  discountAmount?: number;
  finalPrice?: number;
};

// ─── VALIDATE COUPON (used from checkout) ──────────
export async function validateCoupon(
  code: string,
  eventId: string,
  orderAmount: number,
): Promise<CouponValidationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { valid: false, error: "You must be logged in" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return { valid: false, error: "User not found" };
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase().trim(),
        eventId: eventId,
        isActive: true,
      },
      include: {
        usages: {
          where: { userId: dbUser.id },
        },
      },
    });

    if (!coupon) {
      return { valid: false, error: "Invalid coupon code for this event" };
    }

    const now = new Date();
    if (now < coupon.validFrom) {
      return { valid: false, error: "Coupon is not yet active" };
    }
    if (now > coupon.validUntil) {
      return { valid: false, error: "Coupon has expired" };
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, error: "Coupon usage limit reached" };
    }

    if (coupon.usages.length >= coupon.maxUsesPerUser) {
      return { valid: false, error: "You have already used this coupon" };
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return {
        valid: false,
        error: `Minimum order amount is ৳${coupon.minOrderAmount}`,
      };
    }

    let discountAmount: number;

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderAmount);
    const finalPrice = orderAmount - discountAmount;

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
      },
      discountAmount: Math.round(discountAmount),
      finalPrice: Math.round(finalPrice),
    };
  } catch (error) {
    console.error("Coupon validation error:", error);
    return { valid: false, error: "Failed to validate coupon" };
  }
}

// ─── ADMIN: CREATE COUPON ──────────────────────────
export async function createCoupon(data: {
  code: string;
  eventId: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
}) {
  try {
    const existing = await prisma.coupon.findFirst({
      where: {
        code: data.code.toUpperCase().trim(),
        eventId: data.eventId,
      },
    });

    if (existing) {
      return { error: "Coupon code already exists for this event" };
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        eventId: data.eventId,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses || null,
        maxUsesPerUser: data.maxUsesPerUser || 1,
        minOrderAmount: data.minOrderAmount || null,
        maxDiscount: data.maxDiscount || null,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
      },
    });

    revalidateTag("coupons", "max");
    return { success: true, coupon };
  } catch (error) {
    console.error("Create coupon error:", error);
    return { error: "Failed to create coupon" };
  }
}

// ─── ADMIN: GET ALL COUPONS ────────────────────────
export async function getAllCoupons(filters?: {
  eventId?: string;
  isActive?: boolean;
}) {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        ...(filters?.eventId && { eventId: filters.eventId }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      include: {
        event: { select: { id: true, name: true, slug: true } },
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { coupons };
  } catch (error) {
    console.error("Get coupons error:", error);
    return { coupons: [], error: "Failed to fetch coupons" };
  }
}

// ─── ADMIN: UPDATE COUPON ──────────────────────────
export async function updateCoupon(
  id: string,
  data: Partial<{
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    maxUses: number | null;
    maxUsesPerUser: number;
    minOrderAmount: number | null;
    maxDiscount: number | null;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
  }>,
) {
  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        ...(data.code && { code: data.code.toUpperCase().trim() }),
      },
    });

    revalidateTag("coupons", "max");
    return { success: true, coupon };
  } catch (error) {
    console.error("Update coupon error:", error);
    return { error: "Failed to update coupon" };
  }
}

// ─── ADMIN: DELETE COUPON ──────────────────────────
export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidateTag("coupons", "max");

    return { success: true };
  } catch (error) {
    console.error("Delete coupon error:", error);
    return { error: "Failed to delete coupon" };
  }
}

// ─── ADMIN: GET USAGE STATS ───────────────────────
export async function getCouponStats(couponId: string) {
  try {
    const usages = await prisma.couponUsage.findMany({
      where: { couponId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        order: { select: { id: true, total: true, createdAt: true } },
      },
      orderBy: { usedAt: "desc" },
    });

    const totalDiscount = usages.reduce((sum, u) => sum + u.discount, 0);
    return { usages, totalUsages: usages.length, totalDiscount };
  } catch (error) {
    console.error("Get coupon stats error:", error);
    return { error: "Failed to fetch coupon stats" };
  }
}
