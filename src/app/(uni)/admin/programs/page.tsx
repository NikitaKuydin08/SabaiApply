"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { t, tReplace } from "@/lib/i18n/translations";
import { getProgramsForAdmin, createProgram, updateProgram, deleteProgram } from "./actions";

interface Faculty {
  id: string;
  name: string;
  name_th: string | null;
}

interface Program {
  id: string;
  faculty_id: string;
  name: string;
  name_th: string | null;
  degree_type: string;
  seats_round_1: number;
  seats_round_2: number;
  seats_round_4: number;
  tuition_per_semester: number | null;
  description: string | null;
  is_international: boolean;
}

const emptyProgram = {
  faculty_id: "",
  name: "",
  name_th: "",
  degree_type: "bachelor",
  seats_round_1: 0,
  seats_round_2: 0,
  seats_round_4: 0,
  tuition_per_semester: "",
  description: "",
  is_international: false,
};

export default function ProgramsPage() {
  const { locale } = useLocale();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyProgram>(emptyProgram);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const result = await getProgramsForAdmin();
    setFaculties(result.faculties as Faculty[]);
    setPrograms(result.programs as Program[]);
    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyProgram,
      faculty_id: facultyFilter !== "all" ? facultyFilter : (faculties[0]?.id ?? ""),
    });
    setError("");
    setShowForm(true);
  }

  function openEdit(program: Program) {
    setEditingId(program.id);
    setForm({
      faculty_id: program.faculty_id,
      name: program.name,
      name_th: program.name_th ?? "",
      degree_type: program.degree_type,
      seats_round_1: program.seats_round_1,
      seats_round_2: program.seats_round_2,
      seats_round_4: program.seats_round_4,
      tuition_per_semester: program.tuition_per_semester != null ? String(program.tuition_per_semester) : "",
      description: program.description ?? "",
      is_international: program.is_international,
    });
    setError("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      faculty_id: form.faculty_id,
      name: form.name,
      name_th: form.name_th || null,
      degree_type: form.degree_type,
      seats_round_1: Number(form.seats_round_1) || 0,
      seats_round_2: Number(form.seats_round_2) || 0,
      seats_round_4: Number(form.seats_round_4) || 0,
      tuition_per_semester: form.tuition_per_semester ? Number(form.tuition_per_semester) : null,
      description: form.description || null,
      is_international: form.is_international,
    };

    const result = editingId
      ? await updateProgram(editingId, payload)
      : await createProgram(payload);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setShowForm(false);
    setSaving(false);
    await loadData();
  }

  async function handleDelete(program: Program) {
    const msg = tReplace("delete_program_confirm", locale, { name: program.name });
    if (!confirm(msg)) return;

    const result = await deleteProgram(program.id);
    if (result.error) { alert(result.error); return; }
    await loadData();
  }

  function getFacultyName(id: string) {
    const fac = faculties.find((f) => f.id === id);
    if (!fac) return "—";
    return locale === "th" && fac.name_th ? fac.name_th : fac.name;
  }

  // Filter programs
  const filtered = programs.filter((p) => {
    if (facultyFilter !== "all" && p.faculty_id !== facultyFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.name_th ?? "").includes(search)
    );
  });

  // Group filtered programs by faculty
  const grouped = faculties.map((fac) => ({
    faculty: fac,
    programs: filtered.filter((p) => p.faculty_id === fac.id),
  })).filter((g) => g.programs.length > 0);

  if (loading) {
    return <div className="p-8"><p className="text-[#666]">{t("loading", locale)}</p></div>;
  }

  if (faculties.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("programs", locale)}</h1>
        <p className="mt-2 text-base text-[#666]">{t("manage_programs", locale)}</p>
        <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-8 text-center">
          <p className="text-base text-[#999]">{t("no_faculties_yet", locale)}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("programs", locale)}</h1>
          <p className="mt-2 text-base text-[#666]">{t("manage_programs", locale)} ({programs.length})</p>
        </div>
        <button onClick={openCreate}
          className="rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] transition-colors">
          {t("add_program", locale)}
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <input
          placeholder={t("search_programs", locale)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
        />
        {faculties.length > 1 && (
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
          >
            <option value="all">{t("all_faculties", locale)}</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {locale === "th" && f.name_th ? f.name_th : f.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#e8e8e8] bg-white p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
              {editingId ? t("edit_program", locale) : t("add_new_program", locale)}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Faculty */}
              <div className="space-y-2">
                <label className="block text-base font-medium text-[#1a1a1a]">{t("faculty", locale)}</label>
                <select
                  value={form.faculty_id}
                  onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
                  required
                  disabled={!!editingId}
                  className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors disabled:bg-[#fafafa]"
                >
                  <option value="">{t("select_faculty", locale)}</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {locale === "th" && f.name_th ? f.name_th : f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-base font-medium text-[#1a1a1a]">{t("program_name_en", locale)}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Computer Engineering"
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-base font-medium text-[#1a1a1a]">{t("program_name_th", locale)}</label>
                  <input
                    type="text"
                    value={form.name_th}
                    onChange={(e) => setForm({ ...form, name_th: e.target.value })}
                    placeholder="วิศวกรรมคอมพิวเตอร์"
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-base font-medium text-[#1a1a1a]">{t("degree_type", locale)}</label>
                  <select
                    value={form.degree_type}
                    onChange={(e) => setForm({ ...form, degree_type: e.target.value })}
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                  >
                    <option value="bachelor">{t("bachelor", locale)}</option>
                    <option value="master">{t("master", locale)}</option>
                    <option value="doctor">{t("doctor", locale)}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-base font-medium text-[#1a1a1a]">{t("tuition_per_semester", locale)}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.tuition_per_semester}
                    onChange={(e) => setForm({ ...form, tuition_per_semester: e.target.value })}
                    placeholder="25000"
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="block text-base font-medium text-[#1a1a1a]">{t("seats_round_1", locale)}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.seats_round_1}
                    onChange={(e) => setForm({ ...form, seats_round_1: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-base font-medium text-[#1a1a1a]">{t("seats_round_2", locale)}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.seats_round_2}
                    onChange={(e) => setForm({ ...form, seats_round_2: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-base font-medium text-[#1a1a1a]">{t("seats_round_4", locale)}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.seats_round_4}
                    onChange={(e) => setForm({ ...form, seats_round_4: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-base font-medium text-[#1a1a1a]">
                  {t("description", locale)} <span className="text-sm text-[#999]">({t("optional", locale)})</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_international"
                  type="checkbox"
                  checked={form.is_international}
                  onChange={(e) => setForm({ ...form, is_international: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#F4C430]"
                />
                <label htmlFor="is_international" className="text-base font-medium text-[#1a1a1a]">
                  {t("international_program", locale)}
                </label>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors">
                  {saving ? t("saving", locale) : t("save", locale)}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="rounded-lg px-5 py-4 text-base text-[#666] hover:bg-[#fafafa] transition-colors">
                  {t("cancel", locale)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Programs List — grouped by faculty */}
      <div className="mt-6 space-y-6">
        {grouped.length === 0 ? (
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-8 text-center">
            <p className="text-base text-[#999]">{t("no_programs", locale)}</p>
          </div>
        ) : (
          grouped.map(({ faculty, programs }) => (
            <div key={faculty.id} className="rounded-xl border border-[#e8e8e8] bg-white p-6">
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
                {locale === "th" && faculty.name_th ? faculty.name_th : faculty.name}
                <span className="ml-2 text-base font-normal text-[#999]">({programs.length})</span>
              </h2>
              <div className="space-y-2">
                {programs.map((program) => (
                  <div key={program.id} className="flex items-center justify-between rounded-lg border border-[#efefef] px-4 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-medium text-[#1a1a1a]">
                          {locale === "th" && program.name_th ? program.name_th : program.name}
                        </p>
                        {program.is_international && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
                            {t("international", locale)}
                          </span>
                        )}
                      </div>
                      {((locale === "th" && program.name) || (locale === "en" && program.name_th)) && (
                        <p className="text-sm text-[#666]">
                          {locale === "th" ? program.name : program.name_th}
                        </p>
                      )}
                      <div className="mt-1 flex gap-4 flex-wrap text-sm text-[#999]">
                        <span>{t(program.degree_type as "bachelor" | "master" | "doctor", locale)}</span>
                        {program.seats_round_1 > 0 && <span>R1: {program.seats_round_1} {t("seats", locale)}</span>}
                        {program.seats_round_2 > 0 && <span>R2: {program.seats_round_2} {t("seats", locale)}</span>}
                        {program.seats_round_4 > 0 && <span>R4: {program.seats_round_4} {t("seats", locale)}</span>}
                        {program.tuition_per_semester && <span>฿{program.tuition_per_semester.toLocaleString()}/sem</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button onClick={() => openEdit(program)}
                        className="rounded-lg px-3 py-2 text-sm text-[#666] hover:bg-[#fafafa] hover:text-[#1a1a1a] transition-colors">
                        {t("edit", locale)}
                      </button>
                      <button onClick={() => handleDelete(program)}
                        className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        {t("delete", locale)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
