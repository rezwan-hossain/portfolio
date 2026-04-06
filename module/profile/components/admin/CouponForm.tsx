// app/(site)/profile/components/admin/CouponForm.tsx
"use client";

import { useState, useEffect } from "react";
import type { Coupon, CouponEvent } from "./AdminCouponsPanel";
import {
  createCoupon,
  updateCoupon,
  getAllCoupons,
  getPackagesForEvent,
} from "@/app/actions/coupon";
import Input from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2, Save, Package, X } from "lucide-react";

type CouponFormProps = {
  coupon: Coupon | null;
  events: CouponEvent[];
  onSuccess: (coupons: Coupon[]) => void;
  onCancel: () => void;
};

type EventPackage = {
  id: number;
  name: string;
  distance: string;
  price: number;
};

type FormData = {
  code: string;
  eventId: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  maxUses: string;
  maxUsesPerUser: string;
  minOrderAmount: string;
  maxDiscount: string;
  validFrom: string;
  validUntil: string;
  scopeType: "EVENT" | "PACKAGE";
  packageIds: number[];
};

export function CouponForm({
  coupon,
  events,
  onSuccess,
  onCancel,
}: CouponFormProps) {
  const isEditing = !!coupon;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Package state
  const [eventPackages, setEventPackages] = useState<EventPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  const [form, setForm] = useState<FormData>({
    code: coupon?.code || "",
    eventId: coupon?.event.id || "",
    discountType: coupon?.discountType || "PERCENTAGE",
    discountValue: coupon?.discountValue?.toString() || "",
    maxUses: coupon?.maxUses?.toString() || "",
    maxUsesPerUser: coupon?.maxUsesPerUser?.toString() || "1",
    minOrderAmount: coupon?.minOrderAmount?.toString() || "",
    maxDiscount: coupon?.maxDiscount?.toString() || "",
    validFrom: coupon?.validFrom
      ? new Date(coupon.validFrom).toISOString().slice(0, 16)
      : "",
    validUntil: coupon?.validUntil
      ? new Date(coupon.validUntil).toISOString().slice(0, 16)
      : "",
    scopeType: coupon?.scopeType || "EVENT",
    packageIds: coupon?.packages?.map((p) => p.id) || [],
  });

  // Load packages when event changes
  useEffect(() => {
    const loadPackages = async () => {
      if (!form.eventId) {
        setEventPackages([]);
        return;
      }

      setLoadingPackages(true);
      const { packages } = await getPackagesForEvent(form.eventId);
      setEventPackages(packages as EventPackage[]);
      setLoadingPackages(false);
    };

    loadPackages();
  }, [form.eventId]);

  const updateField = (field: keyof FormData, value: string | number[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  };

  const handleEventChange = (eventId: string) => {
    updateField("eventId", eventId);
    // Reset package selection when event changes
    updateField("packageIds", []);
  };

  const togglePackage = (packageId: number) => {
    const current = form.packageIds;
    const updated = current.includes(packageId)
      ? current.filter((id) => id !== packageId)
      : [...current, packageId];
    updateField("packageIds", updated);
  };

  const selectAllPackages = () => {
    updateField(
      "packageIds",
      eventPackages.map((p) => p.id),
    );
  };

  const clearAllPackages = () => {
    updateField("packageIds", []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!form.code) {
      setError("Coupon code is required");
      return;
    }
    if (!form.eventId) {
      setError("Event is required");
      return;
    }
    if (!form.discountValue || parseFloat(form.discountValue) <= 0) {
      setError("Discount value is required");
      return;
    }
    if (!form.validFrom) {
      setError("Valid from date is required");
      return;
    }
    if (!form.validUntil) {
      setError("Valid until date is required");
      return;
    }
    if (new Date(form.validFrom) >= new Date(form.validUntil)) {
      setError("Valid until must be after valid from");
      return;
    }

    // Package scope validation
    if (form.scopeType === "PACKAGE" && form.packageIds.length === 0) {
      setError(
        "Please select at least one package for package-specific coupon",
      );
      return;
    }

    setLoading(true);

    try {
      let result;

      if (isEditing && coupon) {
        result = await updateCoupon(coupon.id, {
          code: form.code,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          maxUsesPerUser: parseInt(form.maxUsesPerUser) || 1,
          minOrderAmount: form.minOrderAmount
            ? parseFloat(form.minOrderAmount)
            : null,
          maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
          validFrom: new Date(form.validFrom),
          validUntil: new Date(form.validUntil),
          scopeType: form.scopeType,
          packageIds: form.scopeType === "PACKAGE" ? form.packageIds : [],
        });
      } else {
        result = await createCoupon({
          code: form.code,
          eventId: form.eventId,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
          maxUsesPerUser: parseInt(form.maxUsesPerUser) || 1,
          minOrderAmount: form.minOrderAmount
            ? parseFloat(form.minOrderAmount)
            : undefined,
          maxDiscount: form.maxDiscount
            ? parseFloat(form.maxDiscount)
            : undefined,
          validFrom: new Date(form.validFrom),
          validUntil: new Date(form.validUntil),
          scopeType: form.scopeType,
          packageIds: form.scopeType === "PACKAGE" ? form.packageIds : [],
        });
      }

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      const { coupons } = await getAllCoupons();
      onSuccess(coupons as Coupon[]);
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isEditing ? "Edit Coupon" : "Create New Coupon"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Code & Event */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.code}
              onChange={(e) =>
                updateField("code", e.target.value.toUpperCase())
              }
              placeholder="e.g. SUMMER20"
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Event <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.eventId}
              onValueChange={handleEventChange}
              disabled={isEditing}
            >
              <SelectTrigger className="h-11 rounded-lg border border-gray-200 bg-gray-50">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* NEW: Coupon Scope Section */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            Coupon Scope <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scopeType"
                value="EVENT"
                checked={form.scopeType === "EVENT"}
                onChange={() => updateField("scopeType", "EVENT")}
                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <span className="text-sm font-medium text-gray-700">
                All Packages
              </span>
              <span className="text-xs text-gray-500">
                (Applies to entire event)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scopeType"
                value="PACKAGE"
                checked={form.scopeType === "PACKAGE"}
                onChange={() => updateField("scopeType", "PACKAGE")}
                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <span className="text-sm font-medium text-gray-700">
                Specific Packages
              </span>
              <span className="text-xs text-gray-500">
                (Select packages below)
              </span>
            </label>
          </div>

          {/* Package Selection (only shown when scope is PACKAGE) */}
          {form.scopeType === "PACKAGE" && (
            <div className="mt-4">
              {!form.eventId ? (
                <p className="text-sm text-gray-500 italic">
                  Please select an event first
                </p>
              ) : loadingPackages ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading packages...
                </div>
              ) : eventPackages.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No packages found for this event
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-600">
                      Select applicable packages:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllPackages}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={clearAllPackages}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {eventPackages.map((pkg) => {
                      const isSelected = form.packageIds.includes(pkg.id);
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => togglePackage(pkg.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer text-left ${
                            isSelected
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 bg-white hover:border-gray-400"
                          }`}
                        >
                          <Package
                            size={16}
                            className={
                              isSelected ? "text-white" : "text-gray-400"
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                isSelected ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {pkg.name}
                            </p>
                            <p
                              className={`text-xs ${
                                isSelected ? "text-white/70" : "text-gray-500"
                              }`}
                            >
                              {pkg.distance} · ৳{pkg.price}
                            </p>
                          </div>
                          {isSelected && (
                            <Check
                              size={16}
                              className="text-neon-lime flex-shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {form.packageIds.length > 0 && (
                    <p className="mt-3 text-xs text-gray-600">
                      <span className="font-semibold">
                        {form.packageIds.length}
                      </span>{" "}
                      package(s) selected
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Discount Type & Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.discountType}
              onValueChange={(val) => updateField("discountType", val)}
            >
              <SelectTrigger className="h-11 rounded-lg border border-gray-200 bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                <SelectItem value="FIXED">Fixed Amount (৳)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Discount Value <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={form.discountValue}
              onChange={(e) => updateField("discountValue", e.target.value)}
              placeholder={
                form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 500"
              }
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
              min="0"
            />
          </div>
        </div>

        {/* Usage Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Max Uses{" "}
              <span className="text-gray-400 font-normal normal-case">
                (optional)
              </span>
            </label>
            <Input
              type="number"
              value={form.maxUses}
              onChange={(e) => updateField("maxUses", e.target.value)}
              placeholder="Unlimited"
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Per User Limit
            </label>
            <Input
              type="number"
              value={form.maxUsesPerUser}
              onChange={(e) => updateField("maxUsesPerUser", e.target.value)}
              placeholder="1"
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
              min="1"
            />
          </div>
        </div>

        {/* Order Constraints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Min Order (৳){" "}
              <span className="text-gray-400 font-normal normal-case">
                (optional)
              </span>
            </label>
            <Input
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => updateField("minOrderAmount", e.target.value)}
              placeholder="No minimum"
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Max Discount (৳){" "}
              <span className="text-gray-400 font-normal normal-case">
                (optional)
              </span>
            </label>
            <Input
              type="number"
              value={form.maxDiscount}
              onChange={(e) => updateField("maxDiscount", e.target.value)}
              placeholder="No cap"
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
              min="0"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Caps the discount for percentage-based coupons
            </p>
          </div>
        </div>

        {/* Validity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Valid From <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={form.validFrom}
              onChange={(e) => updateField("validFrom", e.target.value)}
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Valid Until <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={form.validUntil}
              onChange={(e) => updateField("validUntil", e.target.value)}
              className="h-11 border border-gray-200 bg-gray-50 rounded-lg"
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <p className="text-green-600 text-sm font-medium">
              Coupon {isEditing ? "updated" : "created"} successfully!
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? "Update Coupon" : "Create Coupon"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
