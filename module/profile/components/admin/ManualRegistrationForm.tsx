// module/profile/components/admin/ManualRegistrationForm.tsx
"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2, AlertCircle, Info, PackageX } from "lucide-react";
import {
  createManualRegistration,
  getEventPackages,
} from "@/app/actions/manual-registration";
import { tshirtSizes } from "@/module/checkout/data/tshirtSizes";
import {
  GENDERS,
  AGE_CATEGORIES,
  BLOOD_GROUPS,
  RUNNER_CATEGORIES,
  isValidBDPhone,
  isValidEmail,
} from "@/lib/registration-options";
import type {
  AdminEvent,
  ManualPackage,
  ManualRegistrationInput,
} from "@/types/profile";

type Props = {
  event: AdminEvent;
  onCancel: () => void;
  onSuccess: () => void;
};

/**
 * No CANCELLED option: an admin never enters a registration that's already
 * cancelled. They cancel it afterwards from the order list, where
 * updateOrderStatus releases the slot and marks the payment FAILED.
 */
const STATUS_CHOICES = [
  {
    value: "CONFIRMED" as const,
    label: "Confirmed",
    hint: "Treated as paid — counts toward revenue",
    active: "bg-green-500 text-white border-green-500",
  },
  {
    value: "PENDING" as const,
    label: "Pending",
    hint: "Holds the slot, not yet paid",
    active: "bg-amber-500 text-white border-amber-500",
  },
];

const EMPTY: ManualRegistrationInput = {
  eventId: "",
  packageId: 0,
  qty: 1,
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  birthDate: "",
  ageCategory: "",
  bloodGroup: "",
  tshirtSize: "",
  runnerCategory: "Amateur",
  communityName: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  bibNumber: "",
  discount: 0,
  orderStatus: "CONFIRMED",
  adminNote: "",
};

const inputCls =
  "w-full h-10 sm:h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors";

const selectCls = `${inputCls} cursor-pointer appearance-none bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat pr-9 bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")]`;

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <header className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {step}
        </span>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          {title}
        </h4>
      </header>
      <div className="p-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

export function ManualRegistrationForm({ event, onCancel, onSuccess }: Props) {
  const [packages, setPackages] = useState<ManualPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ManualRegistrationInput>({
    ...EMPTY,
    eventId: event.id,
  });

  const set = <K extends keyof ManualRegistrationInput>(
    key: K,
    value: ManualRegistrationInput[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  // Load live slot counts — the packages on `event` go stale the moment
  // anyone registers.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { packages: data, error: err } = await getEventPackages(event.id);
      if (cancelled) return;
      if (err) setError(err);
      setPackages(data);
      const firstOpen = data.find(
        (p) => p.isActive && p.availableSlots - p.usedSlots > 0,
      );
      if (firstOpen) setForm((prev) => ({ ...prev, packageId: firstOpen.id }));
      setLoadingPackages(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [event.id]);

  const selected = packages.find((p) => p.id === form.packageId) ?? null;
  const slotsLeft = selected ? selected.availableSlots - selected.usedSlots : 0;

  const { subtotal, discount, total } = useMemo(() => {
    const sub = selected ? selected.price * form.qty : 0;
    const disc = Math.min(Math.max(0, Math.round(form.discount || 0)), sub);
    return { subtotal: sub, discount: disc, total: sub - disc };
  }, [selected, form.qty, form.discount]);

  const canSubmit = useMemo(() => {
    if (!selected || form.qty < 1) return false;
    if (slotsLeft < form.qty) return false;
    if (form.fullName.trim().length < 2) return false;
    if (!isValidBDPhone(form.phone)) return false;
    if (form.email.trim() && !isValidEmail(form.email)) return false;
    if (
      form.emergencyContactNumber.trim() &&
      !isValidBDPhone(form.emergencyContactNumber)
    )
      return false;
    if (!form.birthDate || new Date(form.birthDate) >= new Date()) return false;
    return Boolean(
      form.gender &&
      form.ageCategory &&
      form.bloodGroup &&
      form.tshirtSize &&
      form.runnerCategory,
    );
  }, [form, selected, slotsLeft]);

  const handleSave = async () => {
    setError("");
    setSaving(true);
    const result = await createManualRegistration(
      JSON.parse(JSON.stringify(form)),
    );
    if (!result.success) {
      setError(result.error ?? "Couldn't save the registration");
      setSaving(false);
      return;
    }
    onSuccess();
  };

  if (loadingPackages) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300 mb-3" />
        <p className="text-sm text-gray-400">Loading packages…</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <PackageX className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-900 font-bold text-lg">No packages yet</p>
        <p className="text-gray-400 text-sm mt-1 max-w-xs">
          Add a package to this event before registering anyone.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-2">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle
            size={15}
            className="text-red-500 mt-0.5 flex-shrink-0"
          />
          <p className="text-red-600 text-xs font-medium">{error}</p>
        </div>
      )}

      {/* ─── 1. Package ─── */}
      <Section step={1} title="Package">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {packages.map((pkg) => {
            const left = pkg.availableSlots - pkg.usedSlots;
            const soldOut = left < 1;
            const disabled = !pkg.isActive || soldOut;
            const isSelected = form.packageId === pkg.id;

            return (
              <button
                key={pkg.id}
                type="button"
                disabled={disabled}
                onClick={() => set("packageId", pkg.id)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? "border-gray-900 ring-1 ring-gray-900 bg-gray-50"
                    : disabled
                      ? "border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed"
                      : "border-gray-200 hover:border-gray-400 cursor-pointer"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-sm text-gray-900 truncate">
                    {pkg.name}
                  </span>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                    ৳{pkg.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                  <span>{pkg.distance}</span>
                  <span className="text-gray-300">·</span>
                  <span className={soldOut ? "text-red-500 font-semibold" : ""}>
                    {soldOut ? "Sold out" : `${left} left`}
                  </span>
                  {!pkg.isActive && (
                    <span className="text-red-500 font-semibold">Inactive</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-start">
          <Field label="Quantity" required>
            <input
              type="number"
              min={1}
              max={Math.max(1, slotsLeft)}
              value={form.qty}
              onChange={(e) =>
                set("qty", Math.max(1, Number(e.target.value) || 1))
              }
              className={inputCls}
            />
          </Field>
          <Field label="Discount ৳" hint="Flat amount">
            <input
              type="number"
              min={0}
              value={form.discount}
              onChange={(e) => set("discount", Number(e.target.value) || 0)}
              className={inputCls}
            />
          </Field>
          <div className="col-span-2 rounded-lg bg-gray-50 border border-gray-200 p-3">
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[11px] text-green-600 mt-1">
                <span>Discount</span>
                <span>−৳{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {selected && slotsLeft < form.qty && (
          <p className="text-xs font-medium text-red-600">
            Only {slotsLeft} slot{slotsLeft === 1 ? "" : "s"} left in{" "}
            {selected.name}. Lower the quantity or pick another package.
          </p>
        )}
      </Section>

      {/* ─── 2. Participant ─── */}
      <Section step={2} title="Participant">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" required>
            <input
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g. Rafiul Karim"
              className={inputCls}
            />
          </Field>
          <Field
            label="Email"
            hint="Optional — links to an existing account if one matches"
          >
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@example.com"
              className={inputCls}
            />
          </Field>
          <Field label="Contact number" required>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="01712345678"
              className={inputCls}
            />
          </Field>
          <Field label="Gender" required>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className={selectCls}
            >
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date of birth" required>
            <input
              type="date"
              value={form.birthDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => set("birthDate", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Age category" required>
            <select
              value={form.ageCategory}
              onChange={(e) => set("ageCategory", e.target.value)}
              className={selectCls}
            >
              <option value="">Select category</option>
              {AGE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Blood group" required>
            <select
              value={form.bloodGroup}
              onChange={(e) => set("bloodGroup", e.target.value)}
              className={selectCls}
            >
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="T-shirt size" required>
            <select
              value={form.tshirtSize}
              onChange={(e) => set("tshirtSize", e.target.value)}
              className={selectCls}
            >
              <option value="">Select size</option>
              {tshirtSizes.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.chest && s.length
                    ? `${s.value} (Chest ${s.chest}", Length ${s.length}")`
                    : s.value}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Runner category" required>
            <select
              value={form.runnerCategory}
              onChange={(e) => set("runnerCategory", e.target.value)}
              className={selectCls}
            >
              <option value="">Select category</option>
              {RUNNER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Community">
            <input
              value={form.communityName}
              onChange={(e) => set("communityName", e.target.value)}
              placeholder="Running club or team"
              className={inputCls}
            />
          </Field>
          <Field label="Emergency contact name">
            <input
              value={form.emergencyContactName}
              onChange={(e) => set("emergencyContactName", e.target.value)}
              placeholder="Who to call"
              className={inputCls}
            />
          </Field>
          <Field label="Emergency contact number">
            <input
              value={form.emergencyContactNumber}
              onChange={(e) => set("emergencyContactNumber", e.target.value)}
              placeholder="01712345678"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* ─── 3. Order ─── */}
      <Section step={3} title="Order">
        <Field label="Order status" required>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_CHOICES.map((choice) => {
              const isSelected = form.orderStatus === choice.value;
              return (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => set("orderStatus", choice.value)}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isSelected
                      ? choice.active
                      : "border-gray-200 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {choice.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">
            {STATUS_CHOICES.find((c) => c.value === form.orderStatus)?.hint}
          </p>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="BIB number" hint="Leave blank to assign later">
            <input
              value={form.bibNumber}
              onChange={(e) => set("bibNumber", e.target.value)}
              placeholder="e.g. 10K-042"
              className={inputCls}
            />
          </Field>
          <Field label="Note" hint="Only visible to admins">
            <input
              value={form.adminNote}
              onChange={(e) => set("adminNote", e.target.value)}
              placeholder="Cash at booth, sponsor comp…"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <Info size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Manual entries skip the payment gateway. The payment is recorded as{" "}
            <span className="font-semibold text-gray-700">MANUAL</span> and its
            status follows the order status above. To cancel, save the
            registration first, then change its status from the order list.
          </p>
        </div>
      </Section>

      {/* ─── Actions ─── */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSubmit || saving}
          className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Saving…" : "Register participant"}
        </button>
      </div>
    </div>
  );
}
