"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import {
  getProgramsForRequirements,
  getRequirements,
  saveRequirements,
  type RequirementsPayload,
} from "./actions";

interface University {
  id: string;
  name: string;
  name_th: string | null;
}

interface Faculty {
  id: string;
  name: string;
  name_th: string | null;
  university_id: string;
}

interface Program {
  id: string;
  faculty_id: string;
  name: string;
  name_th: string | null;
  degree_type: string;
}

const SCORE_TYPES = ["TGAT", "TPAT1", "TPAT2", "TPAT3", "TPAT4", "TPAT5", "GAT", "PAT1", "PAT2", "PAT3", "O-NET", "SAT", "IELTS", "TOEFL"];
const DOC_TYPES = ["transcript", "id_copy", "photo", "certificate", "portfolio"] as const;
const QUESTION_TYPES = ["text", "textarea", "yes_no"];

const emptyPayload: RequirementsPayload = {
  min_gpa: null,
  required_subjects: [],
  required_scores: [],
  required_documents: [],
  custom_questions: [],
  scoring_rubric: [],
  deadline_round_1: null,
  deadline_round_2: null,
  deadline_round_4: null,
};

export default function RequirementsPage() {
  const { locale } = useLocale();
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedUniId, setSelectedUniId] = useState<string>("");
  const [selectedFacId, setSelectedFacId] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<RequirementsPayload>(emptyPayload);
  const [minGpaText, setMinGpaText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    (async () => {
      const result = await getProgramsForRequirements();
      const unis = (result.universities as University[]) ?? [];
      setUniversities(unis);
      setFaculties((result.faculties as Faculty[]) ?? []);
      setPrograms((result.programs as Program[]) ?? []);
      if (unis.length === 1) setSelectedUniId(unis[0].id);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const result = await getRequirements(selectedId);
      if (result.error) {
        setError(result.error);
        return;
      }
      const req = result.requirements;
      if (!req) {
        setForm(emptyPayload);
        setMinGpaText("");
      } else {
        const payload: RequirementsPayload = {
          min_gpa: req.min_gpa ?? null,
          required_subjects: req.required_subjects ?? [],
          required_scores: req.required_scores ?? [],
          required_documents: req.required_documents ?? [],
          custom_questions: req.custom_questions ?? [],
          scoring_rubric: req.scoring_rubric ?? [],
          deadline_round_1: req.deadline_round_1 ?? null,
          deadline_round_2: req.deadline_round_2 ?? null,
          deadline_round_4: req.deadline_round_4 ?? null,
        };
        setForm(payload);
        setMinGpaText(payload.min_gpa != null ? String(payload.min_gpa) : "");
      }
      setError("");
      setFeedback("");
    })();
  }, [selectedId]);

  const filteredFaculties = selectedUniId
    ? faculties.filter((f) => f.university_id === selectedUniId)
    : [];
  const filteredPrograms = selectedFacId
    ? programs.filter((p) => p.faculty_id === selectedFacId)
    : [];

  const selectedProgram = programs.find((p) => p.id === selectedId);
  const selectedFaculty = selectedProgram
    ? faculties.find((f) => f.id === selectedProgram.faculty_id)
    : null;
  const selectedUniversity = selectedFaculty
    ? universities.find((u) => u.id === selectedFaculty.university_id)
    : null;

  function hasDoc(type: string) {
    return form.required_documents.some((d) => d.type === type);
  }

  function toggleDoc(type: string) {
    const exists = hasDoc(type);
    setForm({
      ...form,
      required_documents: exists
        ? form.required_documents.filter((d) => d.type !== type)
        : [...form.required_documents, { type, required: true }],
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setError("");
    setFeedback("");
    setSaving(true);

    const payload: RequirementsPayload = {
      ...form,
      min_gpa: minGpaText.trim() === "" ? null : Number(minGpaText),
    };

    const result = await saveRequirements(selectedId, payload);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setFeedback(t("requirements_saved", locale));
    setTimeout(() => setFeedback(""), 5000);
  }

  if (loading) {
    return <div className="p-8"><p className="text-[#666]">{t("loading", locale)}</p></div>;
  }

  if (programs.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("requirements", locale)}</h1>
        <p className="mt-2 text-base text-[#666]">{t("manage_requirements", locale)}</p>
        <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-8 text-center">
          <p className="text-base text-[#999]">{t("no_programs_available", locale)}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("requirements", locale)}</h1>
        <p className="mt-2 text-base text-[#666]">{t("manage_requirements", locale)}</p>
      </div>

      {/* University → Faculty → Program cascade */}
      <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-5">
        <div className={`grid gap-3 ${universities.length > 1 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {universities.length > 1 ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#666]">{t("university", locale)}</label>
              <select
                value={selectedUniId}
                onChange={(e) => { setSelectedUniId(e.target.value); setSelectedFacId(""); setSelectedId(""); }}
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
              >
                <option value="">{t("select_university", locale)}</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {locale === "th" && u.name_th ? u.name_th : u.name}
                  </option>
                ))}
              </select>
            </div>
          ) : universities.length === 1 ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#666]">{t("university", locale)}</label>
              <div className="rounded-lg border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-base text-[#1a1a1a]">
                {locale === "th" && universities[0].name_th ? universities[0].name_th : universities[0].name}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#666]">{t("faculty", locale)}</label>
            <select
              value={selectedFacId}
              onChange={(e) => { setSelectedFacId(e.target.value); setSelectedId(""); }}
              disabled={!selectedUniId}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors disabled:bg-[#fafafa] disabled:text-[#999]"
            >
              <option value="">{t("select_faculty", locale)}</option>
              {filteredFaculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {locale === "th" && f.name_th ? f.name_th : f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#666]">{t("select_program_to_configure", locale)}</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={!selectedFacId}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors disabled:bg-[#fafafa] disabled:text-[#999]"
            >
              <option value="">—</option>
              {filteredPrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {locale === "th" && p.name_th ? p.name_th : p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editor */}
      {selectedId && selectedProgram && (
        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Header */}
          <div className="rounded-xl border border-[#F4C430]/30 bg-[#F4C430]/5 p-5">
            <p className="text-sm text-[#666]">
              {selectedUniversity ? (locale === "th" && selectedUniversity.name_th ? selectedUniversity.name_th : selectedUniversity.name) : ""}
              {selectedUniversity && selectedFaculty ? " · " : ""}
              {selectedFaculty ? (locale === "th" && selectedFaculty.name_th ? selectedFaculty.name_th : selectedFaculty.name) : ""}
            </p>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">
              {locale === "th" && selectedProgram.name_th ? selectedProgram.name_th : selectedProgram.name}
            </h2>
          </div>

          {/* GPA + Deadlines */}
          <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
            <h3 className="text-lg font-bold text-[#1a1a1a]">{t("admission_criteria", locale)}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-base font-medium text-[#1a1a1a]">{t("minimum_gpa", locale)}</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={minGpaText}
                  onChange={(e) => setMinGpaText(e.target.value)}
                  placeholder="2.75"
                  className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                />
                <p className="text-xs text-[#999]">{t("gpa_hint", locale)}</p>
              </div>
            </div>

            <h4 className="mt-6 text-base font-semibold text-[#1a1a1a]">{t("deadlines", locale)}</h4>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              {([["deadline_round_1", "deadline_round_1"], ["deadline_round_2", "deadline_round_2"], ["deadline_round_4", "deadline_round_4"]] as const).map(([key, field]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm text-[#666]">{t(key, locale)}</label>
                  <input
                    type="date"
                    value={form[field] ?? ""}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value || null })}
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Required scores */}
          <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a1a1a]">{t("required_test_scores", locale)}</h3>
              <button type="button"
                onClick={() => setForm({ ...form, required_scores: [...form.required_scores, { type: "TGAT", min: 0 }] })}
                className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#fafafa] transition-colors">
                {t("add_score", locale)}
              </button>
            </div>
            {form.required_scores.length === 0 ? (
              <p className="mt-3 text-sm text-[#999]">—</p>
            ) : (
              <div className="mt-3 space-y-3">
                {form.required_scores.map((s, i) => (
                  <div key={i} className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <label className="block text-sm text-[#666]">{t("score_type", locale)}</label>
                      <select
                        value={s.type}
                        onChange={(e) => {
                          const next = [...form.required_scores];
                          next[i] = { ...next[i], type: e.target.value };
                          setForm({ ...form, required_scores: next });
                        }}
                        className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                      >
                        {SCORE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="block text-sm text-[#666]">{t("minimum_score", locale)}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={s.min}
                        onChange={(e) => {
                          const next = [...form.required_scores];
                          next[i] = { ...next[i], min: Number(e.target.value) };
                          setForm({ ...form, required_scores: next });
                        }}
                        className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                      />
                    </div>
                    <button type="button"
                      onClick={() => setForm({ ...form, required_scores: form.required_scores.filter((_, j) => j !== i) })}
                      className="rounded-lg px-3 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      {t("remove", locale)}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Required documents */}
          <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
            <h3 className="text-lg font-bold text-[#1a1a1a]">{t("required_documents", locale)}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DOC_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-3 rounded-lg border border-[#e0e0e0] px-4 py-3 cursor-pointer hover:bg-[#fafafa] transition-colors">
                  <input
                    type="checkbox"
                    checked={hasDoc(type)}
                    onChange={() => toggleDoc(type)}
                    className="h-4 w-4 accent-[#F4C430]"
                  />
                  <span className="text-base text-[#1a1a1a]">{t(`doc_${type}` as Parameters<typeof t>[0], locale)}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Required subjects */}
          <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a1a1a]">{t("required_subjects", locale)}</h3>
              <button type="button"
                onClick={() => setForm({ ...form, required_subjects: [...form.required_subjects, { name: "", name_th: "" }] })}
                className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#fafafa] transition-colors">
                {t("add_subject", locale)}
              </button>
            </div>
            {form.required_subjects.length === 0 ? (
              <p className="mt-3 text-sm text-[#999]">—</p>
            ) : (
              <div className="mt-3 space-y-3">
                {form.required_subjects.map((s, i) => (
                  <div key={i} className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <label className="block text-sm text-[#666]">{t("subject_name_en", locale)}</label>
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => {
                          const next = [...form.required_subjects];
                          next[i] = { ...next[i], name: e.target.value };
                          setForm({ ...form, required_subjects: next });
                        }}
                        placeholder="Mathematics"
                        className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="block text-sm text-[#666]">{t("subject_name_th", locale)}</label>
                      <input
                        type="text"
                        value={s.name_th ?? ""}
                        onChange={(e) => {
                          const next = [...form.required_subjects];
                          next[i] = { ...next[i], name_th: e.target.value || null };
                          setForm({ ...form, required_subjects: next });
                        }}
                        placeholder="คณิตศาสตร์"
                        className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                      />
                    </div>
                    <button type="button"
                      onClick={() => setForm({ ...form, required_subjects: form.required_subjects.filter((_, j) => j !== i) })}
                      className="rounded-lg px-3 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      {t("remove", locale)}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Custom questions */}
          <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1a1a1a]">{t("custom_questions", locale)}</h3>
                <p className="mt-1 text-sm text-[#999]">{t("custom_questions_hint", locale)}</p>
              </div>
              <button type="button"
                onClick={() => setForm({ ...form, custom_questions: [...form.custom_questions, { question: "", type: "text", required: true }] })}
                className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#fafafa] transition-colors whitespace-nowrap">
                {t("add_question", locale)}
              </button>
            </div>
            {form.custom_questions.length === 0 ? (
              <p className="mt-3 text-sm text-[#999]">—</p>
            ) : (
              <div className="mt-3 space-y-3">
                {form.custom_questions.map((q, i) => (
                  <div key={i} className="space-y-3 rounded-lg border border-[#e8e8e8] p-3">
                    <div className="space-y-2">
                      <label className="block text-sm text-[#666]">{t("question", locale)}</label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => {
                          const next = [...form.custom_questions];
                          next[i] = { ...next[i], question: e.target.value };
                          setForm({ ...form, custom_questions: next });
                        }}
                        placeholder="Why do you want to study this program?"
                        className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex items-end gap-3 flex-wrap">
                      <div className="flex-1 space-y-2 min-w-[160px]">
                        <label className="block text-sm text-[#666]">{t("answer_type", locale)}</label>
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const next = [...form.custom_questions];
                            next[i] = { ...next[i], type: e.target.value };
                            setForm({ ...form, custom_questions: next });
                          }}
                          className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                        >
                          {QUESTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {t(`type_${type}` as Parameters<typeof t>[0], locale)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer py-3">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => {
                            const next = [...form.custom_questions];
                            next[i] = { ...next[i], required: e.target.checked };
                            setForm({ ...form, custom_questions: next });
                          }}
                          className="h-4 w-4 accent-[#F4C430]"
                        />
                        <span className="text-base text-[#1a1a1a]">{t("required_field", locale)}</span>
                      </label>
                      <button type="button"
                        onClick={() => setForm({ ...form, custom_questions: form.custom_questions.filter((_, j) => j !== i) })}
                        className="rounded-lg px-3 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors ml-auto">
                        {t("remove", locale)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Scoring rubric */}
          <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1a1a1a]">{t("scoring_rubric", locale)}</h3>
                <p className="mt-1 text-sm text-[#999]">{t("scoring_rubric_hint", locale)}</p>
              </div>
              <button type="button"
                onClick={() => setForm({ ...form, scoring_rubric: [...form.scoring_rubric, { criterion: "", weight: 0, max_score: 100 }] })}
                className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#fafafa] transition-colors whitespace-nowrap">
                {t("add_criterion", locale)}
              </button>
            </div>
            {form.scoring_rubric.length === 0 ? (
              <p className="mt-3 text-sm text-[#999]">—</p>
            ) : (
              <div className="mt-3 space-y-3">
                {form.scoring_rubric.map((r, i) => (
                  <div key={i} className="flex items-end gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <label className="block text-sm text-[#666]">{t("criterion", locale)}</label>
                      <input
                        type="text"
                        value={r.criterion}
                        onChange={(e) => {
                          const next = [...form.scoring_rubric];
                          next[i] = { ...next[i], criterion: e.target.value };
                          setForm({ ...form, scoring_rubric: next });
                        }}
                        placeholder="Portfolio Quality"
                        className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="w-28 space-y-2">
                      <label className="block text-sm text-[#666]">{t("weight", locale)}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={r.weight}
                        onChange={(e) => {
                          const next = [...form.scoring_rubric];
                          next[i] = { ...next[i], weight: Number(e.target.value) };
                          setForm({ ...form, scoring_rubric: next });
                        }}
                        className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="w-28 space-y-2">
                      <label className="block text-sm text-[#666]">{t("max_score", locale)}</label>
                      <input
                        type="number"
                        min="0"
                        value={r.max_score}
                        onChange={(e) => {
                          const next = [...form.scoring_rubric];
                          next[i] = { ...next[i], max_score: Number(e.target.value) };
                          setForm({ ...form, scoring_rubric: next });
                        }}
                        className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                      />
                    </div>
                    <button type="button"
                      onClick={() => setForm({ ...form, scoring_rubric: form.scoring_rubric.filter((_, j) => j !== i) })}
                      className="rounded-lg px-3 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      {t("remove", locale)}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Save bar */}
          <div className="sticky bottom-0 bg-white border-t border-[#e8e8e8] -mx-6 px-6 py-4 flex items-center gap-3 flex-wrap">
            <button type="submit" disabled={saving}
              className="rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors">
              {saving ? t("saving", locale) : t("save_requirements", locale)}
            </button>
            {feedback && <p className="text-base text-green-600">{feedback}</p>}
            {error && <p className="text-base text-red-600">{error}</p>}
          </div>
        </form>
      )}
    </div>
  );
}
