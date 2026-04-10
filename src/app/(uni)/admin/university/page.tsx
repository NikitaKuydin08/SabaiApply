"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { searchUniversities, type ThaiUniversity } from "@/lib/thai-universities";
import { useLocale } from "@/lib/locale-context";
import { t, tReplace } from "@/lib/i18n";
import type { University, Faculty } from "@/types/database";

export default function UniversitySetupPage() {
  const { locale } = useLocale();
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  // University search
  const [uniQuery, setUniQuery] = useState("");
  const [uniResults, setUniResults] = useState<ThaiUniversity[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pickedUni, setPickedUni] = useState<ThaiUniversity | null>(null);
  const [uniWebsite, setUniWebsite] = useState("");
  const [uniError, setUniError] = useState("");
  const [uniSaving, setUniSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Faculty form
  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [facName, setFacName] = useState("");
  const [facNameTh, setFacNameTh] = useState("");
  const [facError, setFacError] = useState("");
  const [facSaving, setFacSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadData() {
    const supabase = createClient();

    const { data: uniData } = await supabase
      .from("universities")
      .select("*")
      .order("name")
      .limit(1);

    if (uniData && uniData.length > 0) {
      setSelectedUni(uniData[0]);
      setUniQuery(uniData[0].name);
      setUniWebsite(uniData[0].website ?? "");

      const { data: facData } = await supabase
        .from("faculties")
        .select("*")
        .eq("university_id", uniData[0].id)
        .order("name");

      if (facData) setFaculties(facData);
    }

    setLoading(false);
  }

  async function loadFaculties(universityId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("faculties")
      .select("*")
      .eq("university_id", universityId)
      .order("name");

    if (data) setFaculties(data);
  }

  function handleUniSearch(query: string) {
    setUniQuery(query);
    setPickedUni(null);
    if (query.length > 0) {
      setUniResults(searchUniversities(query));
      setShowDropdown(true);
    } else {
      setUniResults([]);
      setShowDropdown(false);
    }
  }

  function handlePickUni(uni: ThaiUniversity) {
    setPickedUni(uni);
    setUniQuery(locale === "th" ? uni.name_th : uni.name);
    setShowDropdown(false);
  }

  function getTypeLabel(type: ThaiUniversity["type"]) {
    if (locale === "th") {
      return type === "autonomous" ? "มหาวิทยาลัยในกำกับ" :
             type === "public" ? "มหาวิทยาลัยรัฐ" :
             type === "rajabhat" ? "ราชภัฏ" :
             type === "rajamangala" ? "ราชมงคล" :
             type === "institute" ? "สถาบัน" :
             "เอกชน";
    }
    return type === "autonomous" ? "Public (Autonomous)" :
           type === "public" ? "Public" :
           type === "rajabhat" ? "Rajabhat" :
           type === "rajamangala" ? "Rajamangala" :
           type === "institute" ? "Institute" :
           "Private";
  }

  function getTypeColor(type: ThaiUniversity["type"]) {
    return type === "autonomous" ? "bg-blue-50 text-blue-600" :
           type === "public" ? "bg-blue-50 text-blue-600" :
           type === "rajabhat" ? "bg-green-50 text-green-600" :
           type === "rajamangala" ? "bg-purple-50 text-purple-600" :
           type === "institute" ? "bg-gray-100 text-gray-600" :
           "bg-amber-50 text-amber-600";
  }

  async function handleSaveUniversity(e: React.FormEvent) {
    e.preventDefault();
    setUniError("");
    setUniSaving(true);

    if (!pickedUni && !selectedUni) {
      setUniError(t("select_uni", locale));
      setUniSaving(false);
      return;
    }

    const supabase = createClient();

    const name = pickedUni?.name ?? selectedUni?.name ?? uniQuery;
    const name_th = pickedUni?.name_th ?? selectedUni?.name_th ?? null;

    if (selectedUni) {
      const { error } = await supabase
        .from("universities")
        .update({ name, name_th, website: uniWebsite || null })
        .eq("id", selectedUni.id);

      if (error) { setUniError(error.message); setUniSaving(false); return; }
      setSelectedUni({ ...selectedUni, name, name_th, website: uniWebsite });
    } else {
      const { data, error } = await supabase
        .from("universities")
        .insert({ name, name_th, website: uniWebsite || null })
        .select()
        .single();

      if (error) { setUniError(error.message); setUniSaving(false); return; }
      setSelectedUni(data);
    }

    setUniSaving(false);
  }

  async function handleSaveFaculty(e: React.FormEvent) {
    e.preventDefault();
    setFacError("");
    setFacSaving(true);

    if (!selectedUni) return;

    const supabase = createClient();

    if (editingFaculty) {
      const { error } = await supabase
        .from("faculties")
        .update({ name: facName, name_th: facNameTh || null })
        .eq("id", editingFaculty.id);

      if (error) { setFacError(error.message); setFacSaving(false); return; }
    } else {
      const { data: faculty, error } = await supabase
        .from("faculties")
        .insert({ university_id: selectedUni.id, name: facName, name_th: facNameTh || null })
        .select()
        .single();

      if (error) { setFacError(error.message); setFacSaving(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (user && faculty) {
        await supabase.from("faculty_admins").upsert({
          user_id: user.id, faculty_id: faculty.id, is_primary: true,
        });
      }
    }

    setFacName(""); setFacNameTh("");
    setEditingFaculty(null); setShowFacultyForm(false); setFacSaving(false);
    await loadFaculties(selectedUni.id);
  }

  async function handleDeleteFaculty(faculty: Faculty) {
    const msg = tReplace("delete_faculty_confirm", locale, { name: faculty.name });
    if (!confirm(msg)) return;

    const supabase = createClient();
    const { error } = await supabase.from("faculties").delete().eq("id", faculty.id);
    if (error) { alert(error.message); return; }
    if (selectedUni) await loadFaculties(selectedUni.id);
  }

  function startEditFaculty(faculty: Faculty) {
    setEditingFaculty(faculty);
    setFacName(faculty.name);
    setFacNameTh(faculty.name_th ?? "");
    setShowFacultyForm(true);
  }

  function startAddFaculty() {
    setEditingFaculty(null);
    setFacName(""); setFacNameTh("");
    setShowFacultyForm(true);
  }

  if (loading) {
    return <div className="p-8"><p className="text-[#666]">{t("loading", locale)}</p></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("university_setup", locale)}</h1>
      <p className="mt-2 text-base text-[#666]">{t("configure_uni", locale)}</p>

      {/* University Profile */}
      <div className="mt-6 max-w-2xl rounded-xl border border-[#e8e8e8] bg-white p-6">
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">{t("university_profile", locale)}</h2>
        <form onSubmit={handleSaveUniversity} className="space-y-4">
          {/* Searchable University Dropdown */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label htmlFor="uniSearch" className="block text-base font-medium text-[#1a1a1a]">
              {t("university_name", locale)}
            </label>
            <input
              id="uniSearch"
              placeholder={t("search_uni", locale)}
              value={uniQuery}
              onChange={(e) => handleUniSearch(e.target.value)}
              onFocus={() => {
                if (uniQuery.length > 0) {
                  setUniResults(searchUniversities(uniQuery));
                  setShowDropdown(true);
                }
              }}
              autoComplete="off"
              required
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
            {pickedUni && (
              <p className="text-sm text-[#666]">
                {locale === "th" ? pickedUni.name : pickedUni.name_th}
              </p>
            )}

            {/* Dropdown — Thai name on top */}
            {showDropdown && uniResults.length > 0 && (
              <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[#e0e0e0] bg-white shadow-lg">
                {uniResults.map((uni) => (
                  <button
                    key={uni.name}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-[#F4C430]/10 transition-colors border-b border-[#efefef] last:border-0"
                    onClick={() => handlePickUni(uni)}
                  >
                    <p className="text-base font-medium text-[#1a1a1a]">{uni.name_th}</p>
                    <p className="text-sm text-[#666]">{uni.name}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${getTypeColor(uni.type)}`}>
                      {getTypeLabel(uni.type)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {showDropdown && uniQuery.length > 0 && uniResults.length === 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-lg">
                <p className="text-sm text-[#999]">
                  {locale === "th" ? "ไม่พบมหาวิทยาลัย คุณยังสามารถบันทึกชื่อนี้ได้" : "No university found. You can still save with this name."}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="uniWebsite" className="block text-base font-medium text-[#1a1a1a]">
              {t("website", locale)}
            </label>
            <input
              id="uniWebsite"
              type="url"
              placeholder="https://www.university.ac.th"
              value={uniWebsite}
              onChange={(e) => setUniWebsite(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
          </div>

          {uniError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{uniError}</p>}

          <button type="submit" disabled={uniSaving} className="rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors">
            {uniSaving ? t("saving", locale) : selectedUni ? t("update_university", locale) : t("save_university", locale)}
          </button>
        </form>
      </div>

      {/* Faculties */}
      {selectedUni && (
        <div className="mt-6 max-w-2xl rounded-xl border border-[#e8e8e8] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1a1a1a]">{t("faculties", locale)}</h2>
            <button onClick={startAddFaculty} className="rounded-lg bg-[#F4C430] px-4 py-2 text-base font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] transition-colors">
              {t("add_faculty", locale)}
            </button>
          </div>

          {/* Faculty Form */}
          {showFacultyForm && (
            <form onSubmit={handleSaveFaculty} className="mb-6 space-y-4 rounded-lg border border-[#e0e0e0] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="facName" className="block text-base font-medium text-[#1a1a1a]">{t("faculty_name_en", locale)}</label>
                  <input id="facName" placeholder="Faculty of Engineering" value={facName} onChange={(e) => setFacName(e.target.value)} required
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="facNameTh" className="block text-base font-medium text-[#1a1a1a]">{t("faculty_name_th", locale)}</label>
                  <input id="facNameTh" placeholder="คณะวิศวกรรมศาสตร์" value={facNameTh} onChange={(e) => setFacNameTh(e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors" />
                </div>
              </div>

              {facError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{facError}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={facSaving} className="rounded-lg bg-[#F4C430] px-4 py-2 text-base font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors">
                  {facSaving ? t("saving", locale) : editingFaculty ? t("update_faculty", locale) : t("add_faculty_btn", locale)}
                </button>
                <button type="button" onClick={() => { setShowFacultyForm(false); setEditingFaculty(null); }}
                  className="rounded-lg px-4 py-2 text-base text-[#666] hover:bg-[#fafafa] transition-colors">
                  {t("cancel", locale)}
                </button>
              </div>
            </form>
          )}

          {/* Faculty List */}
          {faculties.length === 0 ? (
            <p className="text-base text-[#999]">{t("no_faculties", locale)}</p>
          ) : (
            <div className="space-y-2">
              {faculties.map((faculty) => (
                <div key={faculty.id} className="flex items-center justify-between rounded-lg border border-[#efefef] px-4 py-4">
                  <div>
                    <p className="text-base font-medium text-[#1a1a1a]">
                      {locale === "th" && faculty.name_th ? faculty.name_th : faculty.name}
                    </p>
                    <p className="text-sm text-[#666]">
                      {locale === "th" ? faculty.name : faculty.name_th}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditFaculty(faculty)}
                      className="rounded-lg px-3 py-2 text-sm text-[#666] hover:bg-[#fafafa] hover:text-[#1a1a1a] transition-colors">
                      {t("edit", locale)}
                    </button>
                    <button onClick={() => handleDeleteFaculty(faculty)}
                      className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      {t("delete", locale)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
