// module/profile/components/admin/AdminCouponsPanel.tsx
"use client";

import { useState } from "react";
import { createCoupon, updateCoupon, deleteCoupon } from "@/app/actions/coupon";
import { Plus, Pencil, Trash2, Tag, Calendar, Users } from "lucide-react";

type Coupon = {
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
  event: { id: string; name: string };
  _count: { usages: number };
};

type Event = { id: string; name: string };

type Props = {
  initialCoupons: Coupon[];
  events: Event[];
};

export function AdminCouponsPanel({ initialCoupons, events }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = {
    code: "",
    eventId: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: 0,
    maxUses: "",
    maxUsesPerUser: 1,
    minOrderAmount: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingCoupon(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editingCoupon) {
        const result = await updateCoupon(editingCoupon.id, {
          code: formData.code,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          maxUsesPerUser: formData.maxUsesPerUser,
          minOrderAmount: formData.minOrderAmount
            ? parseFloat(formData.minOrderAmount)
            : null,
          maxDiscount: formData.maxDiscount
            ? parseFloat(formData.maxDiscount)
            : null,
          validFrom: new Date(formData.validFrom),
          validUntil: new Date(formData.validUntil),
        });

        if (result.error) {
          setError(result.error);
        } else {
          window.location.reload();
        }
      } else {
        const result = await createCoupon({
          code: formData.code,
          eventId: formData.eventId,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
          maxUsesPerUser: formData.maxUsesPerUser,
          minOrderAmount: formData.minOrderAmount
            ? parseFloat(formData.minOrderAmount)
            : undefined,
          maxDiscount: formData.maxDiscount
            ? parseFloat(formData.maxDiscount)
            : undefined,
          validFrom: new Date(formData.validFrom),
          validUntil: new Date(formData.validUntil),
        });

        if (result.error) {
          setError(result.error);
        } else {
          window.location.reload();
        }
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      eventId: coupon.event.id,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses?.toString() || "",
      maxUsesPerUser: coupon.maxUsesPerUser,
      minOrderAmount: coupon.minOrderAmount?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const result = await deleteCoupon(id);
    if (result.success) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(result.error);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const result = await updateCoupon(coupon.id, {
      isActive: !coupon.isActive,
    });
    if (result.success) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, isActive: !c.isActive } : c,
        ),
      );
    }
  };

  const isExpired = (d: string) => new Date(d) < new Date();
  const isScheduled = (d: string) => new Date(d) > new Date();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Coupon Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage discount coupons for events
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCoupon ? "Edit Coupon" : "Create Coupon"}
            </h2>

            {error && (
              <p className="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg uppercase"
                  placeholder="e.g. SUMMER20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Event *
                </label>
                <select
                  value={formData.eventId}
                  onChange={(e) =>
                    setFormData({ ...formData, eventId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  disabled={!!editingCoupon}
                >
                  <option value="">Select Event</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "PERCENTAGE" | "FIXED",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Uses (Total)
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUses: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsesPerUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUsesPerUser: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Min Order (৳)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="No minimum"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Discount (৳)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="No cap"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For percentage discounts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Valid From *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Valid Until *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingCoupon
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Code
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Event
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Discount
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Usage
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Validity
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-neutral-500" />
                    <span className="font-mono font-medium">{coupon.code}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px] truncate">
                  {coupon.event.name}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : `৳${coupon.discountValue}`}
                  </span>
                  {coupon.maxDiscount && (
                    <span className="text-xs text-gray-500 block">
                      Max ৳{coupon.maxDiscount}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    {coupon._count.usages}
                    {coupon.maxUses && `/${coupon.maxUses}`}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(coupon.validFrom).toLocaleDateString()} —{" "}
                    {new Date(coupon.validUntil).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {isExpired(coupon.validUntil) ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      Expired
                    </span>
                  ) : isScheduled(coupon.validFrom) ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                      Scheduled
                    </span>
                  ) : coupon.isActive ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`px-2 py-1 text-xs rounded ${
                        coupon.isActive
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {coupon.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="p-1 text-gray-500 hover:text-neutral-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {coupons.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Tag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No coupons created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
