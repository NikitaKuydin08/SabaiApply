"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import {
  getApplication,
  updateApplicationStatus,
  saveApplicationScoring,
  saveApplicationNotes,
  type ScreeningResult,
  type RubricItem,
  type CustomQuestion,
  type ScoreReq,
  type DocReq,
} from "../actions";

interface DocRow { id: string; doc_type: string; file_url: string; file_name: string }
interface ScoreRow { id: string; score_type: string; score_value: number; test_date: string | null }
interface EducationRow { id: string; school_name: string; gpa: number | null; graduation_year: number | null; transcript_url: string | null }
interface PortfolioRow { id: string; title: string; source: string; external_url: string | null; pdf_url: string | null }

interface ProgramInfo {
  id: string; name: string; name_th: string | null; degree_type: string;
  faculty: {
    id: string; name: string; name_th: string | null;
    university: { id: string; name: string; name_th: string | null };
  };
}

interface StudentInfo {
  id: string;
  first_name: string | null; last_name: string | null;
  first_name_th: string | null; last_name_th: string | null;
  phone: string | null; line_id: string | null;
  nationality: string | null; gender: string | null; photo_url: string | null;
  email: string | null;
  education: EducationRow[] | EducationRow | null;
  scores: ScoreRow[];
  documents: DocRow[];
}

interface Requirements {
  min_gpa: number | null;
  required_scores: ScoreReq[];
  required_documents: DocReq[];
  custom_questions: CustomQuestion[];
  scoring_rubric: RubricItem[];
}

interface Application {
  id: string;
  status: string;
  round: string;
  submitted_at: string;
  total_score: number | null;
  custom_answers: Record<string, string> | null;
  notes: string | null;
  scores: Record<string, number> | null;
  portfolio_id: string | null;
  program: ProgramInfo;
  student: StudentInfo;
  portfolio: PortfolioRow[] | PortfolioRow | null;
  requirements: Requirements | null;
  screen: ScreeningResult;
}

const STATUSES = [
  "submitted", "under_review", "shortlisted", "interview_scheduled",
  "accepted", "waitlisted", "rejected", "confirmed", "withdrawn",
];

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { locale } = useLocale();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState("");
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [scoreSaving, setScoreSaving] = useState(false);
  const [scoreFeedback, setScoreFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesFeedback, setNotesFeedback] = useState("");

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    const result = await getApplication(id);
    if (result.error || !result.application) {
      setError(result.error ?? "Not found");
      setLoading(false);
      return;
    }
    const a = result.application as Application;
    setApp(a);
    setRubricScores(a.scores ?? {});
    setNotes(a.notes ?? "");
    setLoading(false);
  }

  async function handleStatus(newStatus: string) {
    if (!app) return;
    setStatusSaving(true);
    const r = await updateApplicationStatus(app.id, newStatus);
    setStatusSaving(false);
    if (r.error) { alert(r.error); return; }
    setStatusFeedback(t("status_updated", locale));
    setTimeout(() => setStatusFeedback(""), 4000);
    router.refresh();
    await load();
  }

  async function handleSaveScores() {
    if (!app?.requirements?.scoring_rubric) return;
    setScoreSaving(true);
    const rubric = app.requirements.scoring_rubric;
    const totalWeight = rubric.reduce((sum, r) => sum + (r.weight || 0), 0);
    let weightedTotal = 0;
    for (const r of rubric) {
      const raw = rubricScores[r.criterion] ?? 0;
      const pct = r.max_score > 0 ? raw / r.max_score : 0;
      weightedTotal += pct * (r.weight || 0);
    }
    const total = totalWeight > 0 ? Number(weightedTotal.toFixed(2)) : null;

    const result = await saveApplicationScoring(app.id, rubricScores, total);
    setScoreSaving(false);
    if (result.error) { alert(result.error); return; }
    setScoreFeedback(t("scores_saved", locale));
    setTimeout(() => setScoreFeedback(""), 4000);
    await load();
  }

  async function handleSaveNotes() {
    if (!app) return;
    setNotesSaving(true);
    const r = await saveApplicationNotes(app.id, notes);
    setNotesSaving(false);
    if (r.error) { alert(r.error); return; }
    setNotesFeedback(t("notes_saved", locale));
    setTimeout(() => setNotesFeedback(""), 4000);
  }

  if (loading) return <div className="p-8"><p className="text-[#666]">{t("loading", locale)}</p></div>;
  if (error || !app) return <div className="p-8"><p className="text-red-600">{error || "Not found"}</p></div>;

  const education = Array.isArray(app.student.education) ? app.student.education[0] : app.student.education;
  const portfolio = Array.isArray(app.portfolio) ? app.portfolio[0] : app.portfolio;
  const studentDisplayName = locale === "th" && (app.student.first_name_th || app.student.last_name_th)
    ? [app.student.first_name_th, app.student.last_name_th].filter(Boolean).join(" ")
    : [app.student.first_name, app.student.last_name].filter(Boolean).join(" ") || "—";
  const programName = locale === "th" && app.program.name_th ? app.program.name_th : app.program.name;
  const facultyName = locale === "th" && app.program.faculty.name_th ? app.program.faculty.name_th : app.program.faculty.name;
  const uniName = locale === "th" && app.program.faculty.university.name_th ? app.program.faculty.university.name_th : app.program.faculty.university.name;

  const screenColor = {
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    unknown: "bg-[#fafafa] text-[#666] border-[#e0e0e0]",
  }[app.screen.level];

  return (
    <div className="space-y-6">
      <Link href="/admin/applications" className="text-base text-[#666] hover:text-[#1a1a1a] transition-colors">
        {t("back_to_applications", locale)}
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a]">{studentDisplayName}</h1>
            <p className="mt-1 text-base text-[#666]">{app.student.email}</p>
            <p className="mt-3 text-base text-[#666]">{uniName} · {facultyName}</p>
            <p className="text-lg font-semibold text-[#1a1a1a]">{programName}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-block rounded-lg border px-3 py-1.5 text-sm font-medium ${screenColor}`}>
              {t(`screen_${app.screen.level}` as Parameters<typeof t>[0], locale)}
            </span>
            <p className="text-sm text-[#999]">{t("round", locale)} {app.round}</p>
            <p className="text-sm text-[#999]">
              {new Date(app.submitted_at).toLocaleDateString(locale === "th" ? "th-TH" : "en-US")}
            </p>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <h3 className="text-lg font-bold text-[#1a1a1a]">{t("change_status", locale)}</h3>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <select
            value={app.status}
            onChange={(e) => handleStatus(e.target.value)}
            disabled={statusSaving}
            className="rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t(`status_${s}` as Parameters<typeof t>[0], locale)}</option>
            ))}
          </select>
          {statusFeedback && <span className="text-sm text-green-600">{statusFeedback}</span>}
        </div>
      </div>

      {/* Profile + education + scores grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
          <h3 className="text-lg font-bold text-[#1a1a1a]">{t("profile_info", locale)}</h3>
          <dl className="mt-3 space-y-2">
            <Field label={t("phone", locale)} value={app.student.phone} />
            <Field label={t("line_id", locale)} value={app.student.line_id} />
            <Field label="Nationality" value={app.student.nationality} />
            <Field label="Gender" value={app.student.gender} />
          </dl>
        </section>

        <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
          <h3 className="text-lg font-bold text-[#1a1a1a]">{t("school", locale)}</h3>
          <dl className="mt-3 space-y-2">
            <Field label={t("school", locale)} value={education?.school_name ?? null} />
            <Field label={t("gpa", locale)} value={education?.gpa != null ? education.gpa.toFixed(2) : null} />
            <Field label={t("graduation_year", locale)} value={education?.graduation_year != null ? String(education.graduation_year) : null} />
          </dl>
        </section>
      </div>

      {/* Test scores */}
      <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <h3 className="text-lg font-bold text-[#1a1a1a]">{t("test_scores", locale)}</h3>
        {app.student.scores.length === 0 ? (
          <p className="mt-3 text-sm text-[#999]">—</p>
        ) : (
          <div className="mt-3 flex gap-2 flex-wrap">
            {app.student.scores.map((s) => (
              <span key={s.id} className="inline-block rounded-lg border border-[#e0e0e0] bg-[#fafafa] px-3 py-1.5 text-sm text-[#1a1a1a]">
                {s.score_type}: <b>{s.score_value}</b>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Documents */}
      <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <h3 className="text-lg font-bold text-[#1a1a1a]">{t("documents", locale)}</h3>
        {app.student.documents.length === 0 ? (
          <p className="mt-3 text-sm text-[#999]">{t("no_documents", locale)}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {app.student.documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-lg border border-[#e8e8e8] px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">{t(`doc_${d.doc_type}` as Parameters<typeof t>[0], locale)}</p>
                  <p className="text-xs text-[#999]">{d.file_name}</p>
                </div>
                {d.file_url ? (
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#F4C430] hover:underline">
                    {t("view", locale)}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Portfolio */}
      <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <h3 className="text-lg font-bold text-[#1a1a1a]">{t("portfolio", locale)}</h3>
        {!portfolio ? (
          <p className="mt-3 text-sm text-[#999]">{t("no_portfolio", locale)}</p>
        ) : (
          <div className="mt-3">
            <p className="text-base text-[#1a1a1a]">{portfolio.title}</p>
            <p className="text-xs text-[#999]">source: {portfolio.source}</p>
            <div className="mt-2 flex gap-3 flex-wrap">
              {portfolio.external_url && (
                <a href={portfolio.external_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#F4C430] hover:underline">
                  {t("view", locale)}
                </a>
              )}
              {portfolio.pdf_url && (
                <a href={portfolio.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#F4C430] hover:underline">
                  PDF
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Custom answers */}
      <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <h3 className="text-lg font-bold text-[#1a1a1a]">{t("answers_to_questions", locale)}</h3>
        {!app.requirements?.custom_questions?.length ? (
          <p className="mt-3 text-sm text-[#999]">{t("no_custom_answers", locale)}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {app.requirements.custom_questions.map((q, i) => (
              <li key={i} className="rounded-lg border border-[#e8e8e8] p-3">
                <p className="text-sm font-medium text-[#1a1a1a]">{q.question}</p>
                <p className="mt-2 text-sm text-[#666] whitespace-pre-wrap">
                  {app.custom_answers?.[q.question] ?? app.custom_answers?.[`q_${i}`] ?? "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Requirements check */}
      <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <h3 className="text-lg font-bold text-[#1a1a1a]">{t("requirements_check", locale)}</h3>
        {!app.requirements ? (
          <p className="mt-3 text-sm text-[#999]">{t("no_requirements_configured", locale)}</p>
        ) : app.screen.issues.length === 0 ? (
          <p className="mt-3 text-base text-green-700">✓ {t("no_issues", locale)}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {app.screen.issues.map((issue, i) => (
              <li key={i} className={`rounded-lg border px-4 py-2.5 text-sm ${issue.severity === "fail" ? "bg-red-50 text-red-700 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                {issue.severity === "fail" ? "✗" : "!"} {issue.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Scoring */}
      <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <h3 className="text-lg font-bold text-[#1a1a1a]">{t("scoring", locale)}</h3>
        {!app.requirements?.scoring_rubric?.length ? (
          <p className="mt-3 text-sm text-[#999]">{t("no_rubric_configured", locale)}</p>
        ) : (
          <>
            <div className="mt-3 space-y-3">
              {app.requirements.scoring_rubric.map((r, i) => (
                <div key={i} className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <p className="text-base text-[#1a1a1a]">{r.criterion || "—"}</p>
                    <p className="text-xs text-[#999]">{t("weight", locale)}: {r.weight}% · {t("max_score", locale)}: {r.max_score}</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={r.max_score}
                    step="0.01"
                    value={rubricScores[r.criterion] ?? ""}
                    onChange={(e) => setRubricScores({ ...rubricScores, [r.criterion]: Number(e.target.value) })}
                    placeholder={String(r.max_score)}
                    className="w-32 rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <button onClick={handleSaveScores} disabled={scoreSaving}
                className="rounded-lg bg-[#F4C430] px-5 py-3 text-base font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors">
                {scoreSaving ? t("saving", locale) : t("save_scores", locale)}
              </button>
              {app.total_score != null && (
                <p className="text-sm text-[#666]">
                  {t("weighted_total", locale)}: <b className="text-[#1a1a1a]">{app.total_score.toFixed(2)}</b>
                </p>
              )}
              {scoreFeedback && <span className="text-sm text-green-600">{scoreFeedback}</span>}
            </div>
          </>
        )}
      </section>

      {/* Internal notes */}
      <section className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <h3 className="text-lg font-bold text-[#1a1a1a]">{t("internal_notes", locale)}</h3>
        <p className="mt-1 text-sm text-[#999]">{t("notes_hint", locale)}</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-3 w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
        />
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <button onClick={handleSaveNotes} disabled={notesSaving}
            className="rounded-lg bg-[#F4C430] px-5 py-3 text-base font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors">
            {notesSaving ? t("saving", locale) : t("save_notes", locale)}
          </button>
          {notesFeedback && <span className="text-sm text-green-600">{notesFeedback}</span>}
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="w-32 shrink-0 text-[#999]">{label}</dt>
      <dd className="text-[#1a1a1a]">{value || "—"}</dd>
    </div>
  );
}
