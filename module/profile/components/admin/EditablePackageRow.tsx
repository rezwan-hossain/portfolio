// module/profile/components/admin/EditablePackageRow.tsx
"use client";

import { useState } from "react";
import type { AdminPackage } from "@/types/profile";
import { updatePackage, deletePackage } from "@/app/actions/admin";
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type Props = {
  pkg: AdminPackage;
  onUpdate: () => void;
  onDelete: () => void;
};

export function EditablePackageRow({ pkg, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: pkg.name,
    distance: pkg.distance,
    price: String(pkg.price),
    availableSlots: String(pkg.availableSlots),
  });

  const handleSave = async () => {
    setLoading(true);
    const safeForm = JSON.parse(JSON.stringify(form));
    const result = await updatePackage(pkg.id, safeForm);
    if (!result.error) {
      onUpdate();
      setEditing(false);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${pkg.name}"?`)) return;
    setLoading(true);
    await deletePackage(pkg.id);
    onDelete();
    setLoading(false);
  };

  if (editing) {
    return (
      <div className="p-3 border border-indigo-200 rounded-lg bg-indigo-50/30 space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none"
          />
          <input
            value={form.distance}
            onChange={(e) => setForm({ ...form, distance: e.target.value })}
            placeholder="Distance"
            className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none"
          />
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Price"
            className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none"
          />
          <input
            type="number"
            value={form.availableSlots}
            onChange={(e) =>
              setForm({ ...form, availableSlots: e.target.value })
            }
            placeholder="Slots"
            className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {/* ✅ type="button" prevents form submission */}
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Check size={12} />
            )}
            Save
          </button>
          {/* ✅ type="button" prevents form submission */}
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              // Reset form to original values on cancel
              setForm({
                name: pkg.name,
                distance: pkg.distance,
                price: String(pkg.price),
                availableSlots: String(pkg.availableSlots),
              });
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg cursor-pointer"
          >
            <X size={12} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white group">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded-full font-bold">
          {pkg.distance}
        </span>
        <span className="text-sm font-medium text-gray-900">{pkg.name}</span>
        <span className="text-sm text-gray-500">৳{Number(pkg.price)}</span>
        <span className="text-xs text-gray-400">
          {pkg.usedSlots}/{pkg.availableSlots} slots
        </span>

        {/* Capacity bar */}
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pkg.usedSlots / pkg.availableSlots > 0.9
                ? "bg-red-500"
                : pkg.usedSlots / pkg.availableSlots > 0.7
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{
              width: `${Math.min(
                (pkg.usedSlots / pkg.availableSlots) * 100,
                100,
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* ✅ type="button" prevents form submission */}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
        >
          <Pencil size={14} />
        </button>
        {/* ✅ type="button" prevents form submission */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
