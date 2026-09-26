// lib/coupon/apply-coupon.ts
//
// ⚠️ Deliberately NOT a "use server" file. Every export of a "use server" file
// becomes a public, unauthenticated HTTP endpoint, and this function trusts all
// of its inputs (couponId, userId, orderId, discount). It must only be called
// from server code that has already verified the payment — currently the
// ShurjoPay callback route. Do not move it back into app/actions/.

import { prisma } from "@/lib/prisma";

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
