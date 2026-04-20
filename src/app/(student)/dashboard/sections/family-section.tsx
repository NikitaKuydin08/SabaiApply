"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentFamily } from "@/types/database";
import { Search, ChevronDown } from "lucide-react";
import SectionPanel from "./section-panel";

const PHONE_CODES = [
  "+66", "+1", "+7", "+20", "+27", "+30", "+31", "+32", "+33", "+34",
  "+36", "+39", "+40", "+41", "+43", "+44", "+45", "+46", "+47", "+48",
  "+49", "+51", "+52", "+53", "+54", "+55", "+56", "+57", "+58", "+60",
  "+61", "+62", "+63", "+64", "+65", "+81", "+82", "+84", "+86",
  "+90", "+91", "+92", "+93", "+94", "+95", "+98", "+212", "+213", "+216",
  "+218", "+234", "+249", "+251", "+254", "+255", "+351", "+352", "+353",
  "+370", "+371", "+372", "+380", "+381", "+385", "+386", "+420", "+421",
  "+852", "+855", "+856", "+880", "+886", "+960", "+961", "+962", "+963",
  "+964", "+965", "+966", "+968", "+971", "+972", "+973", "+974", "+975",
  "+976", "+977", "+992", "+993", "+994", "+995", "+996", "+998",
].sort((a, b) => parseInt(a.replace("+", "")) - parseInt(b.replace("+", "")));

function parsePhone(phone: string | null): { code: string; number: string } {
  if (!phone) return { code: "+66", number: "" };
  const match = phone.match(/^(\+\d{1,4})\s*(.*)$/);
  if (match) return { code: match[1], number: match[2] };
  return { code: "+66", number: phone };
}

interface Props {
  family: StudentFamily | null;
  studentId: string;
  onClose: () => void;
  inline?: boolean;
  onSaved?: () => void;
}

const PREFIX_OPTIONS = ["Mr.", "Ms.", "Mrs."];
const EDUCATION_LEVELS = [
  "Below high school",
  "High school",
  "Bachelor",
  "Master",
  "Doctorate",
];
const INCOME_RANGES = [
  "< 15,000",
  "15,000 - 30,000",
  "30,000 - 50,000",
  "50,000 - 100,000",
  "> 100,000",
];

const pillCls = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
    active
      ? "border-[#F4C430] bg-[#FFF3D0] text-[#1a1a1a]"
      : "border-[#e0e0e0] text-[#666] hover:border-[#ccc]"
  }`;

export default function FamilySection({ family, studentId, onClose, inline, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [error]);

  const [fatherPrefix, setFatherPrefix] = useState(family?.father_prefix || "");
  const [fatherFirstName, setFatherFirstName] = useState(family?.father_first_name || "");
  const [fatherLastName, setFatherLastName] = useState(family?.father_last_name || "");
  const [fatherFirstNameTh, setFatherFirstNameTh] = useState(family?.father_first_name_th || "");
  const [fatherLastNameTh, setFatherLastNameTh] = useState(family?.father_last_name_th || "");
  const [fatherOccupation, setFatherOccupation] = useState(family?.father_occupation || "");
  const [fatherEducationLevel, setFatherEducationLevel] = useState(family?.father_education_level || "");
  const fatherParsed = parsePhone(family?.father_phone ?? null);
  const [fatherPhoneCode, setFatherPhoneCode] = useState(fatherParsed.code);
  const [fatherPhoneNumber, setFatherPhoneNumber] = useState(fatherParsed.number);

  const [motherPrefix, setMotherPrefix] = useState(family?.mother_prefix || "");
  const [motherFirstName, setMotherFirstName] = useState(family?.mother_first_name || "");
  const [motherLastName, setMotherLastName] = useState(family?.mother_last_name || "");
  const [motherFirstNameTh, setMotherFirstNameTh] = useState(family?.mother_first_name_th || "");
  const [motherLastNameTh, setMotherLastNameTh] = useState(family?.mother_last_name_th || "");
  const [motherOccupation, setMotherOccupation] = useState(family?.mother_occupation || "");
  const [motherEducationLevel, setMotherEducationLevel] = useState(family?.mother_education_level || "");
  const motherParsed = parsePhone(family?.mother_phone ?? null);
  const [motherPhoneCode, setMotherPhoneCode] = useState(motherParsed.code);
  const [motherPhoneNumber, setMotherPhoneNumber] = useState(motherParsed.number);

  const [hasGuardian, setHasGuardian] = useState(family?.has_guardian ?? false);
  const [guardianRelationship, setGuardianRelationship] = useState(family?.guardian_relationship || "");
  const [guardianPrefix, setGuardianPrefix] = useState(family?.guardian_prefix || "");
  const [guardianFirstName, setGuardianFirstName] = useState(family?.guardian_first_name || "");
  const [guardianLastName, setGuardianLastName] = useState(family?.guardian_last_name || "");
  const [guardianFirstNameTh, setGuardianFirstNameTh] = useState(family?.guardian_first_name_th || "");
  const [guardianLastNameTh, setGuardianLastNameTh] = useState(family?.guardian_last_name_th || "");
  const [guardianOccupation, setGuardianOccupation] = useState(family?.guardian_occupation || "");
  const [guardianEducationLevel, setGuardianEducationLevel] = useState(family?.guardian_education_level || "");
  const guardianParsed = parsePhone(family?.guardian_phone ?? null);
  const [guardianPhoneCode, setGuardianPhoneCode] = useState(guardianParsed.code);
  const [guardianPhoneNumber, setGuardianPhoneNumber] = useState(guardianParsed.number);

  const [householdIncome, setHouseholdIncome] = useState(family?.household_income || "");
  const [numberOfSiblings, setNumberOfSiblings] = useState<number | "">(family?.number_of_siblings ?? "");
  const [siblingOrder, setSiblingOrder] = useState<number | "">(family?.sibling_order ?? "");

  async function handleSave() {
    setSaving(true);
    setError(null);

    const supabase = createClient();

    const data = {
      student_id: studentId,
      father_prefix: fatherPrefix || null,
      father_first_name: fatherFirstName || null,
      father_last_name: fatherLastName || null,
      father_first_name_th: fatherFirstNameTh || null,
      father_last_name_th: fatherLastNameTh || null,
      father_occupation: fatherOccupation || null,
      father_education_level: fatherEducationLevel || null,
      father_phone: fatherPhoneNumber ? `${fatherPhoneCode} ${fatherPhoneNumber}` : null,
      mother_prefix: motherPrefix || null,
      mother_first_name: motherFirstName || null,
      mother_last_name: motherLastName || null,
      mother_first_name_th: motherFirstNameTh || null,
      mother_last_name_th: motherLastNameTh || null,
      mother_occupation: motherOccupation || null,
      mother_education_level: motherEducationLevel || null,
      mother_phone: motherPhoneNumber ? `${motherPhoneCode} ${motherPhoneNumber}` : null,
      has_guardian: hasGuardian,
      guardian_relationship: hasGuardian ? guardianRelationship || null : null,
      guardian_prefix: hasGuardian ? guardianPrefix || null : null,
      guardian_first_name: hasGuardian ? guardianFirstName || null : null,
      guardian_last_name: hasGuardian ? guardianLastName || null : null,
      guardian_first_name_th: hasGuardian ? guardianFirstNameTh || null : null,
      guardian_last_name_th: hasGuardian ? guardianLastNameTh || null : null,
      guardian_occupation: hasGuardian ? guardianOccupation || null : null,
      guardian_education_level: hasGuardian ? guardianEducationLevel || null : null,
      guardian_phone: hasGuardian && guardianPhoneNumber ? `${guardianPhoneCode} ${guardianPhoneNumber}` : null,
      household_income: householdIncome || null,
      number_of_siblings: numberOfSiblings === "" ? null : numberOfSiblings,
      sibling_order: siblingOrder === "" ? null : siblingOrder,
    };

    if (family) {
      const { error: err } = await supabase.from("student_family").update(data).eq("id", family.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("student_family").insert(data);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    if (onSaved) {
      setSaving(false);
      onSaved();
    } else {
      window.location.reload();
    }
  }

  const formContent = (
      <div ref={formRef} className="space-y-8">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <ParentFields
          label="Father"
          prefix={fatherPrefix} setPrefix={setFatherPrefix}
          firstName={fatherFirstName} setFirstName={setFatherFirstName}
          lastName={fatherLastName} setLastName={setFatherLastName}
          firstNameTh={fatherFirstNameTh} setFirstNameTh={setFatherFirstNameTh}
          lastNameTh={fatherLastNameTh} setLastNameTh={setFatherLastNameTh}
          occupation={fatherOccupation} setOccupation={setFatherOccupation}
          educationLevel={fatherEducationLevel} setEducationLevel={setFatherEducationLevel}
          phoneCode={fatherPhoneCode} setPhoneCode={setFatherPhoneCode}
          phoneNumber={fatherPhoneNumber} setPhoneNumber={setFatherPhoneNumber}
        />

        <ParentFields
          label="Mother"
          prefix={motherPrefix} setPrefix={setMotherPrefix}
          firstName={motherFirstName} setFirstName={setMotherFirstName}
          lastName={motherLastName} setLastName={setMotherLastName}
          firstNameTh={motherFirstNameTh} setFirstNameTh={setMotherFirstNameTh}
          lastNameTh={motherLastNameTh} setLastNameTh={setMotherLastNameTh}
          occupation={motherOccupation} setOccupation={setMotherOccupation}
          educationLevel={motherEducationLevel} setEducationLevel={setMotherEducationLevel}
          phoneCode={motherPhoneCode} setPhoneCode={setMotherPhoneCode}
          phoneNumber={motherPhoneNumber} setPhoneNumber={setMotherPhoneNumber}
        />

        {/* Guardian */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">Guardian</legend>
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm font-medium text-[#1a1a1a]">
              <input type="checkbox" checked={hasGuardian} onChange={(e) => setHasGuardian(e.target.checked)} className="h-4 w-4 rounded border-[#e0e0e0] accent-[#F4C430]" />
              I have a separate guardian
            </label>

            {hasGuardian && (
              <div className="space-y-4 rounded-lg border border-[#f0f0f0] bg-[#FAFAFA] p-4">
                <div>
                  <label className={labelCls}>Relationship</label>
                  <input type="text" value={guardianRelationship} onChange={(e) => setGuardianRelationship(e.target.value)} placeholder="e.g. Uncle, Aunt, Grandparent" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Prefix</label>
                  <PrefixPills value={guardianPrefix} onChange={setGuardianPrefix} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>First Name</label>
                    <input type="text" value={guardianFirstName} onChange={(e) => setGuardianFirstName(e.target.value)} placeholder="First name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
                    <input type="text" value={guardianLastName} onChange={(e) => setGuardianLastName(e.target.value)} placeholder="Last name" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>ชื่อ (Thai)</label>
                    <input type="text" value={guardianFirstNameTh} onChange={(e) => setGuardianFirstNameTh(e.target.value)} placeholder="ชื่อ" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>นามสกุล (Thai)</label>
                    <input type="text" value={guardianLastNameTh} onChange={(e) => setGuardianLastNameTh(e.target.value)} placeholder="นามสกุล" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Occupation</label>
                  <input type="text" value={guardianOccupation} onChange={(e) => setGuardianOccupation(e.target.value)} placeholder="Occupation" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Education Level</label>
                  <EducationPills value={guardianEducationLevel} onChange={setGuardianEducationLevel} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <div className="flex gap-2">
                    <div className="w-[140px] shrink-0">
                      <PhoneCodeSelect value={guardianPhoneCode} onChange={setGuardianPhoneCode} />
                    </div>
                    <input type="tel" value={guardianPhoneNumber} onChange={(e) => setGuardianPhoneNumber(e.target.value)} placeholder="Phone number" className={inputCls} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </fieldset>

        {/* Household */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">Household</legend>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Household Income (THB/month) {requiredStar}</label>
              <div className="flex gap-2 flex-wrap">
                {INCOME_RANGES.map((r) => (
                  <button key={r} type="button" onClick={() => setHouseholdIncome(r)} className={pillCls(householdIncome === r)}>{r}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Number of Siblings</label>
                <input type="number" min={0} value={numberOfSiblings} onChange={(e) => setNumberOfSiblings(e.target.value === "" ? "" : parseInt(e.target.value, 10))} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Sibling Order</label>
                <input type="number" min={1} value={siblingOrder} onChange={(e) => setSiblingOrder(e.target.value === "" ? "" : parseInt(e.target.value, 10))} placeholder="e.g. 1 = oldest" className={inputCls} />
              </div>
            </div>
          </div>
        </fieldset>
      </div>
  );

  if (inline) {
    return (
      <div>
        {formContent}
        <div className="mt-6">
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[#F4C430] px-6 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <SectionPanel title="Family Information" onClose={onClose} onSave={handleSave} saving={saving}>
      {formContent}
    </SectionPanel>
  );
}

function PhoneCodeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return PHONE_CODES;
    return PHONE_CODES.filter((code) => code.includes(search));
  }, [search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-[#e0e0e0] px-3 py-3 text-left text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
      >
        <span className="text-[#1a1a1a]">{value}</span>
        <ChevronDown size={14} className={`text-[#999] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setSearch(""); }} />
          <div className="absolute left-0 top-full z-20 mt-1 w-[200px] rounded-lg border border-[#e8e8e8] bg-white shadow-lg">
            <div className="border-b border-[#f0f0f0] px-3 py-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. +66"
                autoFocus
                className="w-full rounded-md border border-[#e0e0e0] px-3 py-1.5 text-sm outline-none focus:border-[#F4C430]"
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-2 text-sm text-[#999]">No results</p>
              ) : (
                filtered.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => { onChange(code); setOpen(false); setSearch(""); }}
                    className={`flex w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                      value === code ? "bg-[#FFF3D0] text-[#1a1a1a]" : "text-[#444] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {code}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Components moved outside to prevent remount on every render ── */

const inputCls = "w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20";
const labelCls = "mb-1.5 block text-sm font-medium text-[#1a1a1a]";
const requiredStar = <span className="ml-0.5 text-red-500">*</span>;
const optionalTag = <span className="ml-1 text-xs font-normal text-[#999]">(optional)</span>;

function PrefixPills({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PREFIX_OPTIONS.map((p) => (
        <button key={p} type="button" onClick={() => onChange(p)} className={pillCls(value === p)}>{p}</button>
      ))}
    </div>
  );
}

function EducationPills({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {EDUCATION_LEVELS.map((l) => (
        <button key={l} type="button" onClick={() => onChange(l)} className={pillCls(value === l)}>{l}</button>
      ))}
    </div>
  );
}

function ParentFields({ label, prefix: pfx, setPrefix: setPfx, firstName: fn, setFirstName: setFn, lastName: ln, setLastName: setLn, firstNameTh: fnTh, setFirstNameTh: setFnTh, lastNameTh: lnTh, setLastNameTh: setLnTh, occupation: occ, setOccupation: setOcc, educationLevel: edu, setEducationLevel: setEdu, phoneCode: phCode, setPhoneCode: setPhCode, phoneNumber: phNum, setPhoneNumber: setPhNum }: {
  label: string;
  prefix: string; setPrefix: (v: string) => void;
  firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
  firstNameTh: string; setFirstNameTh: (v: string) => void;
  lastNameTh: string; setLastNameTh: (v: string) => void;
  occupation: string; setOccupation: (v: string) => void;
  educationLevel: string; setEducationLevel: (v: string) => void;
  phoneCode: string; setPhoneCode: (v: string) => void;
  phoneNumber: string; setPhoneNumber: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-base font-semibold text-[#1a1a1a]">{label} {optionalTag}</legend>
      <p className="mb-4 text-xs text-[#999]">Fill in if applicable. At least one parent is required.</p>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Prefix</label>
          <PrefixPills value={pfx} onChange={setPfx} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>First Name {requiredStar}</label>
            <input type="text" value={fn} onChange={(e) => setFn(e.target.value)} placeholder="First name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Last Name {requiredStar}</label>
            <input type="text" value={ln} onChange={(e) => setLn(e.target.value)} placeholder="Last name" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>ชื่อ (Thai)</label>
            <input type="text" value={fnTh} onChange={(e) => setFnTh(e.target.value)} placeholder="ชื่อ" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>นามสกุล (Thai)</label>
            <input type="text" value={lnTh} onChange={(e) => setLnTh(e.target.value)} placeholder="นามสกุล" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Occupation</label>
          <input type="text" value={occ} onChange={(e) => setOcc(e.target.value)} placeholder="Occupation" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Education Level</label>
          <EducationPills value={edu} onChange={setEdu} />
        </div>
        <div>
          <label className={labelCls}>Phone {requiredStar}</label>
          <div className="flex gap-2">
            <div className="w-[140px] shrink-0">
              <PhoneCodeSelect value={phCode} onChange={setPhCode} />
            </div>
            <input type="tel" value={phNum} onChange={(e) => setPhNum(e.target.value)} placeholder="Phone number" className={inputCls} />
          </div>
        </div>
      </div>
    </fieldset>
  );
}
