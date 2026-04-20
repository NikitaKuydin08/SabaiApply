"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentEducation } from "@/types/database";
import { FileText } from "lucide-react";
import SectionPanel from "./section-panel";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";

interface Props {
  education: StudentEducation | null;
  studentId: string;
  onClose: () => void;
  inline?: boolean;
  onSaved?: () => void;
}

const CURRICULUM_TYPES = ["Thai National", "International", "GED", "Overseas"] as const;
const THAI_STUDY_PLANS = ["Science-Math", "Arts-Math", "Arts-Language", "Arts-Society", "Vocational", "Other"];
const INTERNATIONAL_STUDY_PLANS = ["IB", "IGCSE", "AP", "Other"];
const GRADE_LEVELS = ["ม.4 / Grade 10", "ม.5 / Grade 11", "ม.6 / Grade 12", "Graduated"] as const;

const pillCls = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
    active
      ? "border-[#F4C430] bg-[#FFF3D0] text-[#1a1a1a]"
      : "border-[#e0e0e0] text-[#666] hover:border-[#ccc]"
  }`;

export default function EducationSection({ education, studentId, onClose, inline, onSaved }: Props) {
  const { t } = useLocale();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [error]);

  const [schoolProvince, setSchoolProvince] = useState(education?.school_province || "");
  const [schoolName, setSchoolName] = useState(education?.school_name || "");
  const [curriculumType, setCurriculumType] = useState(education?.curriculum_type || "");
  const [studyPlan, setStudyPlan] = useState(education?.study_plan || "");
  const [gpa, setGpa] = useState<string>(education?.gpa != null ? String(education.gpa) : "");
  const [graduationYear, setGraduationYear] = useState<string>(
    education?.graduation_year != null ? String(education.graduation_year) : ""
  );
  const [currentGradeLevel, setCurrentGradeLevel] = useState(education?.current_grade_level || "");

  const studyPlanOptions = curriculumType === "International" ? INTERNATIONAL_STUDY_PLANS : THAI_STUDY_PLANS;

  async function handleSave() {
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const parsedGpa = gpa === "" ? null : parseFloat(gpa);
    const parsedYear = graduationYear === "" ? null : parseInt(graduationYear, 10);

    if (parsedGpa !== null && (isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 4)) {
      setError(t("form.validation.invalidGpa"));
      setSaving(false);
      return;
    }

    const data = {
      student_id: studentId,
      school_province: schoolProvince || null,
      school_name: schoolName || "",
      curriculum_type: curriculumType || null,
      study_plan: studyPlan || null,
      gpa: parsedGpa,
      graduation_year: parsedYear,
      current_grade_level: currentGradeLevel || null,
    };

    if (education) {
      const { error: err } = await supabase.from("student_education").update(data).eq("id", education.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("student_education").insert(data);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    if (onSaved) {
      setSaving(false);
      onSaved();
    } else {
      window.location.reload();
    }
  }

  const inputCls = "w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20";
  const labelCls = "mb-1.5 block text-sm font-medium text-[#1a1a1a]";
  const star = <span className="ml-0.5 text-red-500">*</span>;

  const CURRICULUM_MAP: Record<string, TranslationKey> = {
    "Thai National": "form.curriculum.thaiNational",
    "International": "form.curriculum.international",
    "GED": "form.curriculum.ged",
    "Overseas": "form.curriculum.overseas",
  };

  const GRADE_MAP: Record<string, TranslationKey> = {
    "Graduated": "form.grade.graduated",
  };

  const formContent = (
      <div ref={formRef} className="space-y-8">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* School */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.school")}</legend>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t("form.schoolProvince")}</label>
              <input type="text" value={schoolProvince} onChange={(e) => setSchoolProvince(e.target.value)} placeholder={t("form.ph.schoolProvince")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t("form.schoolName")} {star}</label>
              <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder={t("form.schoolName")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t("form.curriculum")} {star}</label>
              <div className="flex gap-2 flex-wrap">
                {CURRICULUM_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setCurriculumType(type); setStudyPlan(""); }}
                    className={pillCls(curriculumType === type)}
                  >
                    {t(CURRICULUM_MAP[type] || type as any)}
                  </button>
                ))}
              </div>
            </div>
            {curriculumType && (
              <div>
                <label className={labelCls}>{t("form.studyPlan")}</label>
                <div className="flex gap-2 flex-wrap">
                  {studyPlanOptions.map((p) => (
                    <button key={p} type="button" onClick={() => setStudyPlan(p)} className={pillCls(studyPlan === p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </fieldset>

        {/* Academic */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.academic")}</legend>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t("form.gpa")} {star}</label>
                <input type="number" step="0.01" min="0" max="4.00" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="0.00 - 4.00" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t("form.gradYear")}</label>
                <input type="number" min="2020" max="2035" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="e.g. 2026" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t("form.gradeLevel")} {star}</label>
              <div className="flex gap-2 flex-wrap">
                {GRADE_LEVELS.map((g) => (
                  <button key={g} type="button" onClick={() => setCurrentGradeLevel(g)} className={pillCls(currentGradeLevel === g)}>
                    {t(GRADE_MAP[g] || g as any)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </fieldset>

        {/* Transcript */}
        {education?.transcript_url && (
          <fieldset>
            <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.transcript")}</legend>
            <div className="flex items-center gap-3 rounded-lg border border-[#e0e0e0] bg-[#FAFAFA] px-4 py-3">
              <FileText size={18} className="shrink-0 text-[#666]" />
              <a href={education.transcript_url} target="_blank" rel="noopener noreferrer" className="truncate text-sm font-medium text-[#F4C430] underline hover:text-[#e6b82a]">
                {t("form.viewTranscript")}
              </a>
            </div>
          </fieldset>
        )}
      </div>
  );

  if (inline) {
    return (
      <div>
        {formContent}
        <div className="mt-6">
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[#F4C430] px-6 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50">
            {saving ? t("form.saving") : t("form.continue")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <SectionPanel title={t("form.education")} onClose={onClose} onSave={handleSave} saving={saving}>
      {formContent}
    </SectionPanel>
  );
}
