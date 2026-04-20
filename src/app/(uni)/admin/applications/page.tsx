"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { getApplications } from "./actions";
import type { ScreeningResult } from "./screening";

interface AppRow {
  id: string;
  status: string;
  round: string;
  submitted_at: string;
  total_score: number | null;
  student_id: string;
  student_name: string;
  student_name_th: string | null;
  school_name: string | null;
  gpa: number | null;
  program_id: string;
  program_name: string;
  program_name_th: string | null;
  faculty_id: string;
  screen: ScreeningResult;
}

const SCREEN_COLORS: Record<ScreeningResult["level"], string> = {
  green: "bg-green-50 text-green-700 border-green-200",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  red: "bg-red-50 text-red-700 border-red-200",
  unknown: "bg-[#fafafa] text-[#666] border-[#e0e0e0]",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-[#fafafa] text-[#666] border-[#e0e0e0]",
  under_review: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shortlisted: "bg-blue-50 text-blue-700 border-blue-200",
  interview_scheduled: "bg-purple-50 text-purple-700 border-purple-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  waitlisted: "bg-orange-50 text-orange-700 border-orange-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  withdrawn: "bg-[#fafafa] text-[#999] border-[#e0e0e0]",
};

export default function ApplicationsPage() {
  const { locale } = useLocale();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");
  const [screenFilter, setScreenFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const result = await getApplications();
      setApps((result.applications as AppRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = apps.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (roundFilter !== "all" && a.round !== roundFilter) return false;
    if (screenFilter !== "all" && a.screen.level !== screenFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.student_name.toLowerCase().includes(q) ||
      (a.student_name_th ?? "").includes(search) ||
      a.program_name.toLowerCase().includes(q) ||
      (a.program_name_th ?? "").includes(search)
    );
  });

  if (loading) {
    return <div className="p-8"><p className="text-[#666]">{t("loading", locale)}</p></div>;
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("applications", locale)}</h1>
        <p className="mt-2 text-base text-[#666]">{t("manage_applications", locale)} ({apps.length})</p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <input
          placeholder={t("search_applications", locale)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
        >
          <option value="all">{t("all_statuses", locale)}</option>
          {["submitted","under_review","shortlisted","interview_scheduled","accepted","waitlisted","rejected","confirmed","withdrawn"].map((s) => (
            <option key={s} value={s}>{t(`status_${s}` as Parameters<typeof t>[0], locale)}</option>
          ))}
        </select>
        <select
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value)}
          className="rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
        >
          <option value="all">{t("all_rounds", locale)}</option>
          <option value="1">{t("round_1", locale)}</option>
          <option value="2">{t("round_2", locale)}</option>
          <option value="4">{t("round_4", locale)}</option>
        </select>
        <select
          value={screenFilter}
          onChange={(e) => setScreenFilter(e.target.value)}
          className="rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
        >
          <option value="all">{t("all_screen_levels", locale)}</option>
          <option value="green">{t("screen_green", locale)}</option>
          <option value="yellow">{t("screen_yellow", locale)}</option>
          <option value="red">{t("screen_red", locale)}</option>
          <option value="unknown">{t("screen_unknown", locale)}</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#e8e8e8] bg-white">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-base text-[#999]">{apps.length === 0 ? t("no_applications_yet", locale) : "—"}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#fafafa] border-b border-[#e8e8e8]">
              <tr>
                <th className="px-5 py-3 text-left text-sm font-semibold text-[#666]">{t("applicant", locale)}</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-[#666]">{t("program", locale)}</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-[#666]">{t("round", locale)}</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-[#666]">{t("screening", locale)}</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-[#666]">{t("status", locale)}</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-[#666]">{t("submitted_at", locale)}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/admin/applications/${a.id}`} className="block">
                      <p className="text-base font-medium text-[#1a1a1a]">
                        {locale === "th" && a.student_name_th ? a.student_name_th : a.student_name}
                      </p>
                      {a.school_name && <p className="text-sm text-[#999]">{a.school_name}{a.gpa != null ? ` · GPA ${a.gpa.toFixed(2)}` : ""}</p>}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/applications/${a.id}`} className="block">
                      <p className="text-base text-[#1a1a1a]">
                        {locale === "th" && a.program_name_th ? a.program_name_th : a.program_name}
                      </p>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-base text-[#666]">{a.round}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${SCREEN_COLORS[a.screen.level]}`}>
                      {t(`screen_${a.screen.level}` as Parameters<typeof t>[0], locale)}
                    </span>
                    {a.screen.issues.length > 0 && (
                      <p className="mt-1 text-xs text-[#999]">{a.screen.issues.length} issue{a.screen.issues.length === 1 ? "" : "s"}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[a.status] ?? ""}`}>
                      {t(`status_${a.status}` as Parameters<typeof t>[0], locale)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#666]">
                    {new Date(a.submitted_at).toLocaleDateString(locale === "th" ? "th-TH" : "en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
