"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { StudentScore, ScoreType } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";
import SectionPanel from "./section-panel";
import { useLocale } from "@/lib/i18n/context";
import { tReplace } from "@/lib/i18n/translations";

interface Props {
  scores: StudentScore[];
  studentId: string;
  onClose: () => void;
  inline?: boolean;
  onSaved?: () => void;
}

const SCORE_TYPES: ScoreType[] = [
  "GAT",
  "PAT",
  "TGAT",
  "TPAT",
  "O-NET",
  "SAT",
  "ACT",
  "IELTS",
  "TOEFL",
  "Duolingo",
  "CU-TEP",
  "AAT",
  "ATS",
  "A-Level",
  "IB",
];

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function TestScoresSection({ scores, studentId, onClose, inline, onSaved }: Props) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [localScores, setLocalScores] = useState<StudentScore[]>(scores);
  useEffect(() => { setLocalScores(scores); }, [scores]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New score form state
  const [newScoreType, setNewScoreType] = useState<ScoreType>("GAT");
  const [newSubType, setNewSubType] = useState("");
  const [newScoreValue, setNewScoreValue] = useState("");
  const [newTotalPossible, setNewTotalPossible] = useState("");
  const [newTestDate, setNewTestDate] = useState("");
  const [newCefrLevel, setNewCefrLevel] = useState("");

  const isLanguageTest = newScoreType === "IELTS" || newScoreType === "TOEFL" || newScoreType === "Duolingo" || newScoreType === "CU-TEP";

  function resetForm() {
    setNewScoreType("GAT");
    setNewSubType("");
    setNewScoreValue("");
    setNewTotalPossible("");
    setNewTestDate("");
    setNewCefrLevel("");
    setShowAddForm(false);
    setError(null);
  }

  async function handleAddScore() {
    if (!newScoreValue) {
      setError(tReplace("form.validation.required", locale, { field: t("form.scoreValue") }));
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = createClient();

    const insertData = {
      student_id: studentId,
      score_type: newScoreType,
      sub_type: newSubType || null,
      score_value: parseFloat(newScoreValue),
      total_possible: newTotalPossible ? parseFloat(newTotalPossible) : null,
      test_date: newTestDate || null,
      cefr_level: isLanguageTest && newCefrLevel ? newCefrLevel : null,
    };

    const { data, error: err } = await supabase
      .from("student_scores")
      .insert(insertData)
      .select()
      .single();

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    setLocalScores((prev) => [...prev, data as StudentScore]);
    resetForm();
    setSaving(false);
    router.refresh();
  }

  async function handleDeleteScore(scoreId: string) {
    setDeleting(scoreId);

    const supabase = createClient();
    const { error: err } = await supabase
      .from("student_scores")
      .delete()
      .eq("id", scoreId);

    if (err) {
      setError(err.message);
      setDeleting(null);
      return;
    }

    setLocalScores((prev) => prev.filter((s) => s.id !== scoreId));
    setDeleting(null);
    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20";

  const formContent = (
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* Existing scores */}
        {localScores.length === 0 && !showAddForm && (
          <div className="rounded-lg border border-dashed border-[#e0e0e0] px-6 py-8 text-center">
            <p className="text-sm text-[#888]">{t("form.noScores")}</p>
          </div>
        )}

        {localScores.map((score) => (
          <div
            key={score.id}
            className="flex items-start justify-between rounded-lg border border-[#e0e0e0] bg-white px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#F4C430]/20 px-2 py-0.5 text-xs font-semibold text-[#1a1a1a]">
                  {score.score_type}
                </span>
                {score.sub_type && (
                  <span className="text-sm text-[#666]">{score.sub_type}</span>
                )}
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#1a1a1a]">{score.score_value}</span>
                {score.total_possible && (
                  <span className="text-sm text-[#888]">/ {score.total_possible}</span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-[#888]">
                {score.test_date && <span>{score.test_date}</span>}
                {score.cefr_level && (
                  <span className="rounded bg-[#f0f0f0] px-1.5 py-0.5 font-medium">
                    CEFR: {score.cefr_level}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDeleteScore(score.id)}
              disabled={deleting === score.id}
              className="ml-3 shrink-0 rounded-lg p-2 text-[#ccc] transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* Add score form */}
        {showAddForm ? (
          <div className="rounded-lg border border-[#F4C430]/40 bg-[#FFFBF0] p-4">
            <h3 className="mb-4 text-sm font-semibold text-[#1a1a1a]">{t("form.addNewScore")}</h3>
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("form.scoreType")}</label>
                  <div className="flex gap-2 flex-wrap">
                    {SCORE_TYPES.map((t_val) => (
                      <button
                        key={t_val}
                        type="button"
                        onClick={() => setNewScoreType(t_val)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                          newScoreType === t_val
                            ? "border-[#F4C430] bg-[#FFF3D0] text-[#1a1a1a]"
                            : "border-[#e0e0e0] text-[#666] hover:border-[#ccc]"
                        }`}
                      >
                        {t_val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("form.subType")}</label>
                  <input
                    type="text"
                    value={newSubType}
                    onChange={(e) => setNewSubType(e.target.value)}
                    placeholder={t("form.ph.subType")}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("form.scoreValue")}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newScoreValue}
                    onChange={(e) => setNewScoreValue(e.target.value)}
                    placeholder={t("form.ph.score")}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">
                    {t("form.totalPossible")} <span className="font-normal text-[#888]">{t("form.optional")}</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTotalPossible}
                    onChange={(e) => setNewTotalPossible(e.target.value)}
                    placeholder={t("form.ph.total")}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("form.testDate")}</label>
                <input
                  type="date"
                  value={newTestDate}
                  onChange={(e) => setNewTestDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              {isLanguageTest && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("form.cefrLevel")}</label>
                  <div className="flex gap-2 flex-wrap">
                    {CEFR_LEVELS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setNewCefrLevel(l)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                          newCefrLevel === l
                            ? "border-[#F4C430] bg-[#FFF3D0] text-[#1a1a1a]"
                            : "border-[#e0e0e0] text-[#666] hover:border-[#ccc]"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAddScore}
                  disabled={saving}
                  className="rounded-lg bg-[#F4C430] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50"
                >
                  {saving ? t("form.saving") : t("form.addScore")}
                </button>
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-[#e0e0e0] px-5 py-2.5 text-sm font-medium text-[#666] transition-colors hover:bg-[#f5f5f5]"
                >
                  {t("form.cancel")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e0e0e0] px-4 py-3 text-sm font-medium text-[#666] transition-colors hover:border-[#F4C430] hover:text-[#1a1a1a]"
          >
            <Plus size={16} />
            {t("form.addScore")}
          </button>
        )}
      </div>
  );

  if (inline) return (
    <div>
      {formContent}
      {onSaved && (
        <div className="mt-6 flex justify-end border-t border-[#f0f0f0] pt-5">
          <button
            onClick={onSaved}
            className="rounded-lg bg-[#F4C430] px-6 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );

  return (
    <SectionPanel title={t("app.testScores")} onClose={onClose}>
      {formContent}
    </SectionPanel>
  );
}
