export type CouponPackage = {
  id: number;
  name: string;
  distance: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  scopeType: "EVENT" | "PACKAGE";
  event: { id: string; name: string };
  packages: CouponPackage[];
  _count: { usages: number };
};

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
