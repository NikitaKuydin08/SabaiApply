"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { StudentProfile } from "@/types/database";

const nationalities = [
  "Thai",
  "American",
  "British",
  "Chinese",
  "Indian",
  "Japanese",
  "Korean",
  "Malaysian",
  "Singaporean",
  "Vietnamese",
  "Other",
];

const genders = ["Male", "Female", "Non-binary", "Prefer not to say"];

interface Props {
  profile: StudentProfile;
}

export default function ProfileForm({ profile }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    first_name_th: profile.first_name_th ?? "",
    last_name_th: profile.last_name_th ?? "",
    dob: profile.dob ?? "",
    nationality: profile.nationality ?? "",
    gender: profile.gender ?? "",
    phone: profile.phone ?? "",
    line_id: profile.line_id ?? "",
    address: profile.address ?? "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("student_profiles")
      .update({
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        first_name_th: form.first_name_th || null,
        last_name_th: form.last_name_th || null,
        dob: form.dob || null,
        nationality: form.nationality || null,
        gender: form.gender || null,
        phone: form.phone || null,
        line_id: form.line_id || null,
        address: form.address || null,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 px-5 py-4 text-base text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 px-5 py-4 text-base text-green-700">
          Profile saved successfully.
        </div>
      )}

      {/* Name (English) */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-[#1a1a1a] mb-1">
          Name (English)
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="First Name"
            value={form.first_name}
            onChange={(v) => updateField("first_name", v)}
            placeholder="e.g. Somchai"
          />
          <InputField
            label="Last Name"
            value={form.last_name}
            onChange={(v) => updateField("last_name", v)}
            placeholder="e.g. Jaidee"
          />
        </div>
      </fieldset>

      {/* Name (Thai) */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-[#1a1a1a] mb-1">
          Name (Thai)
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="First Name"
            value={form.first_name_th}
            onChange={(v) => updateField("first_name_th", v)}
            placeholder="e.g. สมชาย"
          />
          <InputField
            label="Last Name"
            value={form.last_name_th}
            onChange={(v) => updateField("last_name_th", v)}
            placeholder="e.g. ใจดี"
          />
        </div>
      </fieldset>

      {/* Personal Details */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-[#1a1a1a] mb-1">
          Personal Details
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-medium text-[#1a1a1a] mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => updateField("dob", e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
            />
          </div>

          <SelectField
            label="Gender"
            value={form.gender}
            onChange={(v) => updateField("gender", v)}
            options={genders}
            placeholder="Select gender"
          />
        </div>

        <SelectField
          label="Nationality"
          value={form.nationality}
          onChange={(v) => updateField("nationality", v)}
          options={nationalities}
          placeholder="Select nationality"
        />
      </fieldset>

      {/* Contact */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-[#1a1a1a] mb-1">
          Contact Information
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="Phone Number"
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
            placeholder="e.g. 081-234-5678"
          />
          <InputField
            label="LINE ID"
            value={form.line_id}
            onChange={(v) => updateField("line_id", v)}
            placeholder="e.g. somchai_j"
          />
        </div>
      </fieldset>

      {/* Address */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-[#1a1a1a] mb-1">
          Address
        </legend>
        <div>
          <label className="block text-base font-medium text-[#1a1a1a] mb-2">
            Full Address
          </label>
          <textarea
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 resize-none"
            placeholder="House number, street, district, province, postal code"
          />
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#F4C430] px-8 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-base font-medium text-[#1a1a1a] mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-base font-medium text-[#1a1a1a] mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
