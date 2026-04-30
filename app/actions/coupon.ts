// app/actions/coupon.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";
import type { CouponValidationResult } from "@/types/coupon";

// ─── VALIDATE COUPON ──────────────────────────────
// IMPORTANT: Added packageId parameter - update all callers!
export async function validateCoupon(
  code: string,
  eventId: string,
  packageId: number,
  orderAmount: number,
): Promise<CouponValidationResult> {
  try {
    // Auth is now optional
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let dbUser: { id: string } | null = null;

    if (user) {
      dbUser = await prisma.user.findUnique({
        where: { authId: user.id },
      });
    }

    //  include — only fetch per-user usages if logged in
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase().trim(),
        eventId: eventId,
        isActive: true,
      },
      include: {
        usages: dbUser ? { where: { userId: dbUser.id } } : false,
        packages: {
          select: { id: true, name: true },
        },
      },
    });

    if (!coupon) {
      return { valid: false, error: "Invalid coupon code" };
    }

    // ─── PACKAGE SCOPE VALIDATION ─────────────────────────
    if (coupon.scopeType === "PACKAGE") {
      const applicablePackageIds = coupon.packages.map((p) => p.id);

      if (applicablePackageIds.length === 0) {
        return {
          valid: false,
          error: "This coupon is not configured correctly",
        };
      }

      if (!applicablePackageIds.includes(packageId)) {
        const packageNames = coupon.packages.map((p) => p.name).join(", ");
        return {
          valid: false,
          error: `This coupon is only valid for: ${packageNames}`,
        };
      }
    }

    // ─── TIME VALIDATION ──────────────────────────────────
    const now = new Date();
    if (now < coupon.validFrom) {
      return { valid: false, error: "Coupon is not yet active" };
    }
    if (now > coupon.validUntil) {
      return { valid: false, error: "Coupon has expired" };
    }

    // ─── USAGE LIMITS ─────────────────────────────────────
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, error: "Coupon usage limit reached" };
    }

    // Per-user limit only applies to logged-in users
    if (
      dbUser &&
      coupon.usages &&
      coupon.usages.length >= coupon.maxUsesPerUser
    ) {
      return { valid: false, error: "You have already used this coupon" };
    }

    // ─── ORDER AMOUNT CHECK ───────────────────────────────
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return {
        valid: false,
        error: `Minimum order amount is ৳${coupon.minOrderAmount}`,
      };
    }

    // ─── CALCULATE DISCOUNT ───────────────────────────────
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

// ─── GET PACKAGES FOR EVENT ───────────────────────
export async function getPackagesForEvent(eventId: string) {
  try {
    const packages = await prisma.package.findMany({
      where: {
        eventId,
        isActive: true,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        distance: true,
        price: true,
      },
      orderBy: { price: "asc" },
    });

    return { packages, error: null };
  } catch (error) {
    console.error("Get packages error:", error);
    return { packages: [], error: "Failed to fetch packages" };
  }
}

// ─── CREATE COUPON ────────────────────────────────
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
  scopeType?: "EVENT" | "PACKAGE";
  packageIds?: number[];
}) {
  try {
    const normalizedCode = data.code.toUpperCase().trim();

    // Check for duplicate
    const existing = await prisma.coupon.findFirst({
      where: {
        code: normalizedCode,
        eventId: data.eventId,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Coupon code already exists for this event",
      };
    }

    // Validate packages belong to event (if provided)
    const scopeType = data.scopeType || "EVENT";
    const packageIds = data.packageIds || [];

    if (scopeType === "PACKAGE") {
      if (packageIds.length === 0) {
        return {
          success: false,
          error:
            "Please select at least one package for package-specific coupon",
        };
      }

      const validPackages = await prisma.package.findMany({
        where: {
          id: { in: packageIds },
          eventId: data.eventId,
        },
        select: { id: true },
      });

      if (validPackages.length !== packageIds.length) {
        return {
          success: false,
          error: "One or more selected packages do not belong to this event",
        };
      }
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        eventId: data.eventId,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses ?? null,
        maxUsesPerUser: data.maxUsesPerUser ?? 1,
        minOrderAmount: data.minOrderAmount ?? null,
        maxDiscount: data.maxDiscount ?? null,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        scopeType: scopeType,
        ...(scopeType === "PACKAGE" &&
          packageIds.length > 0 && {
            packages: {
              connect: packageIds.map((id) => ({ id })),
            },
          }),
      },
      include: {
        event: { select: { id: true, name: true } },
        packages: { select: { id: true, name: true, distance: true } },
      },
    });

    revalidateTag("coupons", "max");
    return { success: true, coupon, error: null };
  } catch (error) {
    console.error("Create coupon error:", error);
    return { success: false, error: "Failed to create coupon" };
  }
}

// ─── GET ALL COUPONS ──────────────────────────────
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
        packages: { select: { id: true, name: true, distance: true } },
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Ensure scopeType has a default for old records
    const normalizedCoupons = coupons.map((coupon) => ({
      ...coupon,
      scopeType: coupon.scopeType || "EVENT",
      packages: coupon.packages || [],
    }));

    return { coupons: normalizedCoupons, error: null };
  } catch (error) {
    console.error("Get coupons error:", error);
    return { coupons: [], error: "Failed to fetch coupons" };
  }
}

// ─── UPDATE COUPON ────────────────────────────────
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
    scopeType: "EVENT" | "PACKAGE";
    packageIds: number[];
  }>,
) {
  try {
    // Get current coupon
    const currentCoupon = await prisma.coupon.findUnique({
      where: { id },
      select: { eventId: true, scopeType: true },
    });

    if (!currentCoupon) {
      return { success: false, error: "Coupon not found" };
    }

    // Determine final scope type
    const finalScopeType = data.scopeType ?? currentCoupon.scopeType ?? "EVENT";
    const packageIds = data.packageIds;

    // Validate packages if updating to PACKAGE scope
    if (finalScopeType === "PACKAGE" && packageIds !== undefined) {
      if (packageIds.length === 0) {
        return {
          success: false,
          error:
            "Please select at least one package for package-specific coupon",
        };
      }

      const validPackages = await prisma.package.findMany({
        where: {
          id: { in: packageIds },
          eventId: currentCoupon.eventId,
        },
        select: { id: true },
      });

      if (validPackages.length !== packageIds.length) {
        return {
          success: false,
          error: "One or more selected packages do not belong to this event",
        };
      }
    }

    // Build update data
    const { packageIds: _, ...updateFields } = data;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...updateFields,
        ...(updateFields.code && {
          code: updateFields.code.toUpperCase().trim(),
        }),
        // Handle package connections
        ...(packageIds !== undefined && {
          packages: {
            set: packageIds.map((pkgId) => ({ id: pkgId })),
          },
        }),
        // If switching to EVENT scope, disconnect all packages
        ...(data.scopeType === "EVENT" && {
          packages: { set: [] },
        }),
      },
      include: {
        event: { select: { id: true, name: true } },
        packages: { select: { id: true, name: true, distance: true } },
      },
    });

    revalidateTag("coupons", "max");
    return { success: true, coupon, error: null };
  } catch (error) {
    console.error("Update coupon error:", error);
    return { success: false, error: "Failed to update coupon" };
  }
}

// ─── DELETE COUPON ────────────────────────────────
export async function deleteCoupon(id: string) {
  try {
    // Check if coupon has been used
    const usageCount = await prisma.couponUsage.count({
      where: { couponId: id },
    });

    if (usageCount > 0) {
      // Soft delete by deactivating instead
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
      revalidateTag("coupons", "max");
      return {
        success: true,
        warning: `Coupon has ${usageCount} usages. Deactivated instead of deleted.`,
      };
    }

    await prisma.coupon.delete({ where: { id } });
    revalidateTag("coupons", "max");

    return { success: true, error: null };
  } catch (error) {
    console.error("Delete coupon error:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}

// ─── GET COUPON STATS ─────────────────────────────
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
    return { usages, totalUsages: usages.length, totalDiscount, error: null };
  } catch (error) {
    console.error("Get coupon stats error:", error);
    return {
      usages: [],
      totalUsages: 0,
      totalDiscount: 0,
      error: "Failed to fetch coupon stats",
    };
  }
}

// ─── APPLY COUPON (after payment success) ─────────
export async function applyCoupon({
  couponId,
  userId,
  orderId,
  discount,
}: {
  couponId: string;
  userId: string;
  orderId: string;
  discount: number;
}) {
  try {
    // Idempotency check
    const existingUsage = await prisma.couponUsage.findUnique({
      where: { orderId },
    });

    if (existingUsage) {
      console.log("⚠️ Coupon already applied for order:", orderId);
      return { success: true, alreadyApplied: true };
    }

    // Transaction: create usage + increment counter
    await prisma.$transaction([
      prisma.couponUsage.create({
        data: {
          couponId,
          userId,
          orderId,
          discount,
        },
      }),
      prisma.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: { increment: 1 },
        },
      }),
    ]);

    console.log("✅ Coupon applied successfully:", {
      couponId,
      orderId,
      discount,
    });
    return { success: true, error: null };
  } catch (error) {
    console.error("Apply coupon error:", error);
    return { success: false, error: "Failed to apply coupon" };
  }
}
