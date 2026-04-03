// types/checkout.ts
export type CheckoutItem = {
  packageId: number;
  eventId: string;
  eventName: string;
  packageName: string;
  distance: string;
  price: number;
  qty: number;
};

export type BillingFormData = {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  ageCategory: string;
  bloodGroup: string;
  tshirtSize: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  communityName: string;
  runnerCategory: string;
};

export type AppliedCoupon = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  discountAmount: number;
};
