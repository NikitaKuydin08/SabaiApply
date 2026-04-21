"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllUniversities, createUniversity, deleteUniversity } from "../actions";
import { searchUniversities } from "@/lib/thai-universities";
import type { ThaiUniversity } from "@/lib/thai-universities";
import { useLocale } from "@/lib/i18n/context";
import { tReplace } from "@/lib/i18n/translations";

interface UniRow {
  id: string;
  name: string;
  name_th: string | null;
  website: string | null;
  created_at: string;
}

export default function SuperUniversitiesPage() {
  const { t, locale } = useLocale();
  const [universities, setUniversities] = useState<UniRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [uniQuery, setUniQuery] = useState("");
  const [uniResults, setUniResults] = useState<ThaiUniversity[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pickedUni, setPickedUni] = useState<ThaiUniversity | null>(null);
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getAllUniversities();
    setUniversities(data as UniRow[]);
    setLoading(false);
  }

  function handleUniSearch(query: string) {
    setUniQuery(query);
    setPickedUni(null);
    if (query.length > 0) {
      setUniResults(searchUniversities(query));
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const result = await createUniversity(
      pickedUni?.name ?? uniQuery,
      pickedUni?.name_th ?? null,
      website || null
    );

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setShowCreate(false);
    setUniQuery("");
    setPickedUni(null);
    setWebsite("");
    setSaving(false);
    await loadData();
  }

  async function handleDelete(e: React.MouseEvent, uni: UniRow) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(tReplace("delete_uni_confirm", locale, { name: uni.name }))) return;

    const result = await deleteUniversity(uni.id);
    if (result.error) { alert(result.error); return; }
    await loadData();
  }

  const filtered = universities.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || (u.name_th ?? "").includes(search);
  });

  if (loading) return <div className="p-8"><p className="text-[#666]">{t("loading")}</p></div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("all_universities")}</h1>
          <p className="mt-2 text-base text-[#666]">{tReplace("manage_universities_subtitle", locale, { count: String(universities.length) })}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] transition-colors">
          {t("create_university_btn")}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="mt-6 max-w-lg rounded-xl border border-[#e8e8e8] bg-white p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">{t("create_university")}</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2 relative">
              <label className="block text-base font-medium text-[#1a1a1a]">{t("university_name")}</label>
              <input
                placeholder={t("search_uni")}
                value={uniQuery}
                onChange={(e) => handleUniSearch(e.target.value)}
                required
                autoComplete="off"
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
              />
              {pickedUni && <p className="text-sm text-[#666]">{pickedUni.name_th}</p>}
              {showDropdown && uniResults.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[#e0e0e0] bg-white shadow-lg">
                  {uniResults.slice(0, 10).map((uni) => (
                    <button key={uni.name} type="button"
                      className="w-full px-4 py-3 text-left hover:bg-[#F4C430]/10 transition-colors border-b border-[#efefef] last:border-0"
                      onClick={() => { setPickedUni(uni); setUniQuery(uni.name); setShowDropdown(false); }}>
                      <p className="text-sm font-medium text-[#1a1a1a]">{uni.name_th}</p>
                      <p className="text-xs text-[#666]">{uni.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-base font-medium text-[#1a1a1a]">{t("website")}</label>
              <input type="url" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors">
                {saving ? t("creating") : t("create")}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg px-5 py-4 text-base text-[#666] hover:bg-[#fafafa] transition-colors">
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mt-6">
        <input placeholder={t("search_uni")} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors" />
      </div>

      {/* List — clickable rows */}
      <div className="mt-4 space-y-2">
        {filtered.map((uni) => (
          <Link key={uni.id} href={`/super-admin/universities/${uni.id}`}>
            <div className="flex items-center justify-between rounded-xl border border-[#e8e8e8] bg-white px-5 py-4 hover:border-[#F4C430]/50 hover:shadow-sm transition-all cursor-pointer mb-2">
              <div>
                <p className="text-base font-medium text-[#1a1a1a]">{uni.name}</p>
                {uni.name_th && <p className="text-sm text-[#666]">{uni.name_th}</p>}
                {uni.website && <p className="text-sm text-[#999]">{uni.website}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#999]">{new Date(uni.created_at).toLocaleDateString()}</span>
                <button onClick={(e) => handleDelete(e, uni)} className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  {t("delete")}
                </button>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-base text-[#999]">{t("no_universities_found")}</p>}
      </div>
    </div>
  );
}
