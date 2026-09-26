// module/profile/components/admin/EditRegistrationForm.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Loader2, Save, X } from "lucide-react";
import { updateRegistrationDetails } from "@/app/actions/registration-edit";
import { tshirtSizes } from "@/module/checkout/data/tshirtSizes";
import {
  AGE_CATEGORIES,
  BLOOD_GROUPS,
  GENDERS,
  RUNNER_CATEGORIES,
  isValidBDPhone,
  isValidEmail,
} from "@/lib/registration-options";
import type { EventOrder, RegistrationEditInput } from "@/types/profile";

type Registration = NonNullable<EventOrder["registration"]>;

type Props = {
  registration: Registration;
  orderId: string;
  onCancel: () => void;
  onSaved: (changes: string[]) => void;
};

const inputCls =
  "w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors";

const LABELS: Record<keyof RegistrationEditInput, string> = {
  fullName: "Name",
  email: "Email",
  phone: "Phone",
  gender: "Gender",
  birthDate: "Birth date",
  ageCategory: "Age category",
  bloodGroup: "Blood group",
  tshirtSize: "T-shirt",
  runnerCategory: "Runner category",
  communityName: "Community",
  emergencyContactName: "Emergency contact",
  emergencyContactNumber: "Emergency number",
  bibNumber: "BIB",
};

const toForm = (r: Registration): RegistrationEditInput => ({
  fullName: r.fullName,
  email: r.email ?? "",
  phone: r.phone,
  gender: r.gender,
  birthDate: r.birthDate ? r.birthDate.slice(0, 10) : "",
  ageCategory: r.ageCategory,
  bloodGroup: r.bloodGroup,
  tshirtSize: r.tshirtSize,
  runnerCategory: r.runnerCategory,
  communityName: r.communityName ?? "",
  emergencyContactName: r.emergencyContactName ?? "",
  emergencyContactNumber: r.emergencyContactNumber ?? "",
  bibNumber: r.bibNumber ?? "",
});

// Options plus the stored value, so legacy values (e.g. "VIRTUAL") still show.
const withCurrent = (options: readonly string[], current: string) =>
  current && !options.includes(current) ? [current, ...options] : [...options];

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

export function EditRegistrationForm({
  registration,
  orderId,
  onCancel,
  onSaved,
}: Props) {
  const original = useMemo(() => toForm(registration), [registration]);
  const [form, setForm] = useState(original);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof RegistrationEditInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const changes = (Object.keys(form) as (keyof RegistrationEditInput)[])
    .filter((k) => form[k].trim() !== original[k].trim())
    .map((k) => `${LABELS[k]}: ${original[k] || "—"} → ${form[k] || "—"}`);

  // Inline hints only; the server re-validates everything.
  const fieldError = {
    fullName: form.fullName.trim().length < 2 ? "Required" : "",
    phone: !isValidBDPhone(form.phone) ? "Bangladeshi mobile, e.g. 01712345678" : "",
    email: form.email.trim() && !isValidEmail(form.email) ? "Not a valid email" : "",
    emergencyContactNumber:
      form.emergencyContactNumber.trim() && !isValidBDPhone(form.emergencyContactNumber)
        ? "Bangladeshi mobile number"
        : "",
  };
  const hasErrors = Object.values(fieldError).some(Boolean);

  const save = async () => {
    setSaving(true);
    setError("");
    const result = await updateRegistrationDetails(orderId, form);
    setSaving(false);
    if (!result.success) {
      setError(result.error ?? "Failed to save changes.");
      return;
    }
    onSaved(result.changes ?? []);
  };

  const id = (k: string) => `edit-${orderId.slice(0, 8)}-${k}`;

  return (
    <div
      className="p-4 bg-white rounded-xl border border-gray-200 space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Edit registration details
        </p>
        <button
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
          title="Close without saving"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Full name" htmlFor={id("name")} error={fieldError.fullName}>
          <input id={id("name")} className={inputCls} value={form.fullName} onChange={set("fullName")} />
        </Field>
        <Field label="BIB number" htmlFor={id("bib")}>
          <input id={id("bib")} className={inputCls} value={form.bibNumber} onChange={set("bibNumber")} placeholder="Not assigned" />
        </Field>
        <Field label="Phone" htmlFor={id("phone")} error={fieldError.phone}>
          <input id={id("phone")} className={inputCls} value={form.phone} onChange={set("phone")} inputMode="tel" />
        </Field>
        <Field label="Email" htmlFor={id("email")} error={fieldError.email}>
          <input id={id("email")} className={inputCls} value={form.email} onChange={set("email")} type="email" placeholder="Optional" />
        </Field>

        <Field label="T-shirt size" htmlFor={id("tshirt")}>
          <select id={id("tshirt")} className={inputCls} value={form.tshirtSize} onChange={set("tshirtSize")}>
            {withCurrent(tshirtSizes.map((s) => s.value), original.tshirtSize).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Gender" htmlFor={id("gender")}>
          <select id={id("gender")} className={inputCls} value={form.gender} onChange={set("gender")}>
            {withCurrent(GENDERS, original.gender).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Date of birth" htmlFor={id("dob")}>
          <input id={id("dob")} className={inputCls} type="date" value={form.birthDate} onChange={set("birthDate")} />
        </Field>
        <Field label="Age category" htmlFor={id("age")}>
          <select id={id("age")} className={inputCls} value={form.ageCategory} onChange={set("ageCategory")}>
            {withCurrent(AGE_CATEGORIES, original.ageCategory).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Blood group" htmlFor={id("blood")}>
          <select id={id("blood")} className={inputCls} value={form.bloodGroup} onChange={set("bloodGroup")}>
            {withCurrent(BLOOD_GROUPS, original.bloodGroup).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Runner category" htmlFor={id("runner")}>
          <select id={id("runner")} className={inputCls} value={form.runnerCategory} onChange={set("runnerCategory")}>
            {withCurrent(RUNNER_CATEGORIES, original.runnerCategory).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Community" htmlFor={id("community")}>
          <input id={id("community")} className={inputCls} value={form.communityName} onChange={set("communityName")} placeholder="Optional" />
        </Field>
        <div className="hidden sm:block" />
        <Field label="Emergency contact name" htmlFor={id("ecname")}>
          <input id={id("ecname")} className={inputCls} value={form.emergencyContactName} onChange={set("emergencyContactName")} placeholder="Optional" />
        </Field>
        <Field label="Emergency contact number" htmlFor={id("ecnum")} error={fieldError.emergencyContactNumber}>
          <input id={id("ecnum")} className={inputCls} value={form.emergencyContactNumber} onChange={set("emergencyContactNumber")} inputMode="tel" placeholder="Optional" />
        </Field>
      </div>

      {changes.length > 0 && (
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            {changes.length} change{changes.length !== 1 && "s"} · saved to the order note
          </p>
          <ul className="text-xs text-gray-700 space-y-0.5">
            {changes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving || changes.length === 0 || hasErrors}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save changes
        </button>
      </div>
    </div>
  );
}
