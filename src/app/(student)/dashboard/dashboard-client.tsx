"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentProfile } from "@/types/database";
import { thaiUniversities, searchUniversities, type ThaiUniversity } from "../data/thai-universities";
import {
  LayoutDashboard,
  Search,
  FileText,
  Building2,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  HelpCircle,
  ArrowLeft,
  Plus,
  X,
  Eye,
  PlusCircle,
} from "lucide-react";
import AccountSettingsModal from "./account-settings-modal";
import { useStudentLocale } from "../i18n/context";
import type { TranslationKey } from "../i18n/translations";

interface Props {
  user: { email: string; id: string };
  profile: StudentProfile | null;
}

type SectionStatus = "completed" | "in_progress" | "not_started";
type View = "dashboard" | "university-search" | "my-universities";

// Re-export for use in sub-components
type University = ThaiUniversity;

const STORAGE_KEY = "sabaiapply-added-universities";

export default function DashboardClient({ user, profile }: Props) {
  const { locale, setLocale, t } = useStudentLocale();
  const [showSettings, setShowSettings] = useState(false);
  const [applicationExpanded, setApplicationExpanded] = useState(true);
  const [universitiesExpanded, setUniversitiesExpanded] = useState(true);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [uniSearch, setUniSearch] = useState("");
  const [addedUniversityIds, setAddedUniversityIds] = useState<Set<string>>(new Set());

  // Load saved universities after hydration to avoid SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const ids = JSON.parse(saved) as string[];
        if (ids.length > 0) setAddedUniversityIds(new Set(ids));
      }
    } catch { /* ignore */ }
  }, []);

  const applicationRef = useRef<HTMLDivElement>(null);
  const universitiesRef = useRef<HTMLDivElement>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t("dash.goodMorning");
    if (hour >= 12 && hour < 17) return t("dash.goodAfternoon");
    if (hour >= 17 && hour < 22) return t("dash.goodEvening");
    return t("dash.goodNight");
  };

  const firstName = profile?.first_name || user.email.split("@")[0];

  const personalFields = [
    profile?.first_name,
    profile?.last_name,
    profile?.dob,
    profile?.nationality,
    profile?.gender,
    profile?.phone,
  ];
  const filledPersonal = personalFields.filter(Boolean).length;
  const personalStatus: SectionStatus =
    filledPersonal === personalFields.length
      ? "completed"
      : filledPersonal > 0
        ? "in_progress"
        : "not_started";

  const sectionKeys: { key: TranslationKey; status: SectionStatus }[] = [
    { key: "app.personal", status: personalStatus },
    { key: "app.family", status: "not_started" },
    { key: "app.education", status: "not_started" },
    { key: "app.testScores", status: "not_started" },
    { key: "app.documents", status: "not_started" },
  ];

  const sections = sectionKeys.map((s) => ({ label: t(s.key), status: s.status }));

  const completedCount = sections.filter((s) => s.status === "completed").length;
  const inProgressCount = sections.filter((s) => s.status === "in_progress").length;
  const progress = Math.round(
    ((completedCount + inProgressCount * 0.5) / sections.length) * 100,
  );

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredUniversities = searchUniversities(uniSearch);

  const addedUniversities = thaiUniversities.filter((u) =>
    addedUniversityIds.has(u.id),
  );

  function toggleUniversity(id: string) {
    setAddedUniversityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  const showMyUniSidebar = currentView === "my-universities";

  return (
    <div className="flex min-h-screen">
      {/* ── Left Sidebar ── */}
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-[#e8e8e8] bg-white">
        <div className="border-b border-[#f0f0f0] px-6 py-5">
          <div className="flex items-center">
            <img src="/logo-lotus.png" alt="" className="mr-2 h-9 w-9 object-contain" />
            <span className="text-4xl font-bold tracking-tight text-[#1a1a1a]">
              Sabai<span className="text-[#F4C430]">Apply</span>
            </span>
          </div>
        </div>

        {showMyUniSidebar ? (
          <>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
              >
                <ArrowLeft size={18} />
                {t("nav.back")}
              </button>

              <h3 className="px-3 pb-2 text-lg font-bold text-[#1a1a1a]">
                {t("nav.myUniversities")}
              </h3>

              <button className="flex w-full items-center gap-3 rounded-lg bg-[#FFF3D0] px-3 py-2.5 text-[15px] font-medium text-[#1a1a1a]">
                <Eye size={19} />
                {t("nav.overview")}
              </button>

              {addedUniversities.length > 0 && (
                <div className="mt-3 max-h-[320px] space-y-0.5 overflow-y-auto">
                  {addedUniversities.map((uni) => (
                    <div key={uni.id} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#444]">
                      <ChevronDown size={14} className="-rotate-90 text-[#ccc]" />
                      <span className="truncate">{uni.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setCurrentView("university-search")}
                className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#F4C430] transition-colors hover:bg-[#f5f5f5]"
              >
                <PlusCircle size={19} />
                {t("nav.addUni")}
              </button>
            </nav>

            <BottomSection onSettings={() => setShowSettings(true)} onSignOut={handleSignOut} user={user} profile={profile} t={t} />
          </>
        ) : (
          <>
            <nav className="flex-1 space-y-1 px-3 py-4">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium transition-colors ${
                  currentView === "dashboard" ? "bg-[#FFF3D0] text-[#1a1a1a]" : "text-[#444] hover:bg-[#f5f5f5]"
                }`}
              >
                <LayoutDashboard size={20} />
                {t("nav.dashboard")}
              </button>

              <div className="px-3 pb-1 pt-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">{t("nav.explore")}</span>
              </div>
              <button
                onClick={() => setCurrentView("university-search")}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium transition-colors ${
                  currentView === "university-search" ? "bg-[#FFF3D0] text-[#1a1a1a]" : "text-[#444] hover:bg-[#f5f5f5]"
                }`}
              >
                <Search size={20} />
                {t("nav.chooseUni")}
                {currentView !== "university-search" && addedUniversityIds.size === 0 && (
                  <span className="absolute right-3 h-2.5 w-2.5 animate-pulse rounded-full bg-[#F4C430]" />
                )}
              </button>

              <div className="px-3 pb-1 pt-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">{t("nav.apply")}</span>
              </div>
              <button
                onClick={() => { setCurrentView("dashboard"); setTimeout(() => scrollTo(applicationRef), 100); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
              >
                <FileText size={20} />
                {t("nav.myApplication")}
              </button>
              <button
                onClick={() => {
                  if (addedUniversities.length > 0) { setCurrentView("my-universities"); }
                  else { setCurrentView("dashboard"); setTimeout(() => scrollTo(universitiesRef), 100); }
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
              >
                <Building2 size={20} />
                {t("nav.myUniversities")}
              </button>
            </nav>

            <BottomSection onSettings={() => setShowSettings(true)} onSignOut={handleSignOut} user={user} profile={profile} t={t} />
          </>
        )}
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto bg-[#FFF9EC]">
        {currentView === "dashboard" && (
          <DashboardView
            greeting={getGreeting()}
            firstName={firstName}
            locale={locale}
            setLocale={setLocale}
            applicationExpanded={applicationExpanded}
            setApplicationExpanded={setApplicationExpanded}
            universitiesExpanded={universitiesExpanded}
            setUniversitiesExpanded={setUniversitiesExpanded}
            applicationRef={applicationRef}
            universitiesRef={universitiesRef}
            sections={sections}
            progress={progress}
            addedUniversities={addedUniversities}
            onSearchUniversities={() => setCurrentView("university-search")}
            onViewMyUniversities={() => setCurrentView("my-universities")}
            t={t}
          />
        )}
        {currentView === "university-search" && (
          <UniversitySearchView
            locale={locale}
            setLocale={setLocale}
            uniSearch={uniSearch}
            setUniSearch={setUniSearch}
            filteredUniversities={filteredUniversities}
            addedUniversityIds={addedUniversityIds}
            onToggleUniversity={toggleUniversity}
            onBack={() => setCurrentView("dashboard")}
            t={t}
          />
        )}
        {currentView === "my-universities" && (
          <MyUniversitiesOverview
            locale={locale}
            setLocale={setLocale}
            addedUniversities={addedUniversities}
            onAddMore={() => setCurrentView("university-search")}
            t={t}
          />
        )}
      </main>

      {/* ── Right Sidebar ── */}
      <aside className="flex w-[300px] shrink-0 flex-col border-l border-[#e8e8e8] bg-[#F8F9FB]">
        <div className="border-b border-[#e8e8e8] px-5 py-5">
          <div className="mb-4 flex items-center gap-2">
            <HelpCircle size={20} className="text-[#666]" />
            <h2 className="text-lg font-bold text-[#1a1a1a]">{t("help.title")}</h2>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={t("help.searchPlaceholder")}
              className="w-full rounded-lg border border-[#e0e0e0] bg-white py-2.5 pl-4 pr-10 text-[15px] outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" />
          </div>
          <p className="mt-2 text-sm text-[#999]">{t("help.searchHint")}</p>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <FAQItem question={t("help.faq1q")} answer={t("help.faq1a")} t={t} />
          <FAQItem question={t("help.faq2q")} answer={t("help.faq2a")} t={t} />
          <FAQItem question={t("help.faq3q")} answer={t("help.faq3a")} t={t} />
          <FAQItem question={t("help.faq4q")} answer={t("help.faq4a")} t={t} />
        </div>
        <div className="border-t border-[#e8e8e8] px-5 py-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#333]">
            <MessageCircle size={18} />
            {t("help.chat")}
          </button>
        </div>
      </aside>

      {showSettings && <AccountSettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

/* ── Shared t function type ── */
type TFn = (key: TranslationKey) => string;

/* ══════════════════════════════════════════════ */

function BottomSection({ onSettings, onSignOut, user, profile, t }: {
  onSettings: () => void; onSignOut: () => void;
  user: { email: string; id: string }; profile: StudentProfile | null; t: TFn;
}) {
  return (
    <>
      <div className="space-y-1 border-t border-[#f0f0f0] px-3 py-3">
        <button onClick={onSettings} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]">
          <Settings size={20} />{t("nav.settings")}
        </button>
        <button onClick={onSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]">
          <LogOut size={20} />{t("nav.signOut")}
        </button>
      </div>
      <div className="border-t border-[#f0f0f0] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4C430] text-sm font-bold text-[#1a1a1a]">
            {(profile?.first_name?.[0] || user.email[0]).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-[#1a1a1a]">
              {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : user.email.split("@")[0]}
            </p>
            <p className="truncate text-sm text-[#888]">{user.email}</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════ */

function DashboardView({ greeting, firstName, locale, setLocale, applicationExpanded, setApplicationExpanded, universitiesExpanded, setUniversitiesExpanded, applicationRef, universitiesRef, sections, progress, addedUniversities, onSearchUniversities, onViewMyUniversities, t }: {
  greeting: string; firstName: string; locale: string; setLocale: (l: "en" | "th") => void;
  applicationExpanded: boolean; setApplicationExpanded: (v: boolean) => void;
  universitiesExpanded: boolean; setUniversitiesExpanded: (v: boolean) => void;
  applicationRef: React.RefObject<HTMLDivElement | null>; universitiesRef: React.RefObject<HTMLDivElement | null>;
  sections: { label: string; status: SectionStatus }[]; progress: number;
  addedUniversities: University[]; onSearchUniversities: () => void; onViewMyUniversities: () => void; t: TFn;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-8 pb-1 pt-5">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("dash.title")}</h1>
          <p className="mt-1 text-lg text-[#666]">{greeting}, {firstName}!</p>
        </div>
        <LangToggle locale={locale} setLocale={setLocale} />
      </div>

      <div className="space-y-4 px-8 pb-6 pt-4">
        <div ref={applicationRef} className="rounded-xl border border-[#e8e8e8] bg-white">
          <button onClick={() => setApplicationExpanded(!applicationExpanded)} className="flex w-full items-center justify-between px-6 py-3.5 text-left">
            <h2 className="text-xl font-bold text-[#1a1a1a]">{t("app.title")}</h2>
            {applicationExpanded ? <ChevronUp size={22} className="text-[#666]" /> : <ChevronDown size={22} className="text-[#666]" />}
          </button>
          {applicationExpanded && (
            <div className="px-6 pb-5">
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[15px] text-[#666]">{t("app.progress")}</span>
                  <span className="text-[15px] font-semibold text-[#1a1a1a]">{progress}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                  <div className="h-full rounded-full bg-[#F4C430] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="space-y-0">
                {sections.map((section) => (
                  <button key={section.label} className="group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-[#FFFBF0]">
                    <div className="flex items-center gap-4">
                      <StatusDot status={section.status} />
                      <span className="text-base font-medium text-[#1a1a1a]">{section.label}</span>
                    </div>
                    <ChevronDown size={18} className="-rotate-90 text-[#ccc] group-hover:text-[#999]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={universitiesRef} className="rounded-xl border border-[#e8e8e8] bg-white">
          <button onClick={() => setUniversitiesExpanded(!universitiesExpanded)} className="flex w-full items-center justify-between px-6 py-3.5 text-left">
            <h2 className="text-xl font-bold text-[#1a1a1a]">
              {t("uni.title")}
              {addedUniversities.length > 0 && <span className="ml-2 text-base font-normal text-[#999]">({addedUniversities.length})</span>}
            </h2>
            {universitiesExpanded ? <ChevronUp size={22} className="text-[#666]" /> : <ChevronDown size={22} className="text-[#666]" />}
          </button>
          {universitiesExpanded && (
            <div className="px-6 pb-6">
              {addedUniversities.length === 0 ? (
                <div className="flex flex-col items-center text-center">
                  <div className="my-3 text-[#ccc]">
                    <svg width="110" height="70" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25 65 Q35 25 70 45 Q105 65 115 35" stroke="#ddd" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                      <path d="M100 30 L115 35 L110 20" stroke="#F4C430" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="20" y="62" width="100" height="2" rx="1" fill="#eee" />
                    </svg>
                  </div>
                  <p className="mb-4 text-base text-[#666]">{t("uni.empty")}</p>
                  <button onClick={onSearchUniversities} className="inline-flex items-center gap-2 rounded-lg border-2 border-[#1a1a1a] px-6 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]">
                    <Search size={18} />{t("uni.searchBtn")}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="divide-y divide-[#f0f0f0]">
                    {addedUniversities.slice(0, 3).map((uni) => (
                      <div key={uni.id} className="flex items-center gap-3 py-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F4C430]/20 text-sm font-bold text-[#1a1a1a]">{uni.name[0]}</div>
                        <div>
                          <p className="text-[15px] font-medium text-[#1a1a1a]">{uni.name}</p>
                          <p className="text-xs text-[#888]">{uni.name_th}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {addedUniversities.length > 3 && <p className="mt-1 text-sm text-[#999]">+{addedUniversities.length - 3} {t("uni.more")}</p>}
                  <div className="mt-4 flex items-center gap-3">
                    <button onClick={onSearchUniversities} className="inline-flex items-center gap-2 rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#444] transition-colors hover:bg-[#f5f5f5]">
                      <Plus size={15} />{t("uni.addMore")}
                    </button>
                    <button onClick={onViewMyUniversities} className="inline-flex items-center gap-2 rounded-lg bg-[#F4C430] px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]">
                      {t("uni.viewAll")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════ */

function UniversitySearchView({ locale, setLocale, uniSearch, setUniSearch, filteredUniversities, addedUniversityIds, onToggleUniversity, onBack, t }: {
  locale: string; setLocale: (l: "en" | "th") => void;
  uniSearch: string; setUniSearch: (v: string) => void;
  filteredUniversities: University[]; addedUniversityIds: Set<string>;
  onToggleUniversity: (id: string) => void; onBack: () => void; t: TFn;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterDistance, setFilterDistance] = useState("");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-8 pb-2 pt-5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="rounded-lg p-2 text-[#666] transition-colors hover:bg-white hover:text-[#1a1a1a]">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("search.title")}</h1>
        </div>
        <LangToggle locale={locale} setLocale={setLocale} />
      </div>

      <div className="px-8 pt-3">
        <label className="mb-2 block text-base font-medium text-[#1a1a1a]">{t("search.label")}</label>
        <div className="relative">
          <input type="text" value={uniSearch} onChange={(e) => setUniSearch(e.target.value)} placeholder={t("search.placeholder")}
            className="w-full rounded-lg border border-[#e0e0e0] bg-white px-5 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20" />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]" />
        </div>
        <button onClick={() => setShowFilters(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-sm font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]">
          <SlidersIcon />{t("search.moreFilters")}
        </button>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[15px] text-[#666]">
            <span className="font-semibold text-[#1a1a1a]">{filteredUniversities.length}</span>{" "}
            {filteredUniversities.length === 1 ? t("search.result") : t("search.results")}
          </p>
          <p className="text-sm text-[#999]">{t("search.sortBy")}</p>
        </div>
      </div>

      <div className="mt-3 px-8 pb-6">
        <div className="max-h-[calc(100vh-320px)] divide-y divide-[#f0f0f0] overflow-y-auto rounded-xl border border-[#e8e8e8] bg-white">
          {filteredUniversities.map((uni) => {
            const isAdded = addedUniversityIds.has(uni.id);
            return (
              <div key={uni.id} className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#FFFBF0]">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F4C430]/20 text-base font-bold text-[#1a1a1a]">{uni.name[0]}</div>
                  <div>
                    <p className="text-base font-semibold text-[#1a1a1a]">{uni.name}</p>
                    <p className="text-sm text-[#888]">{uni.name_th}</p>
                  </div>
                </div>
                {isAdded ? (
                  <button onClick={() => onToggleUniversity(uni.id)} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-sm font-semibold text-[#666] transition-colors hover:bg-[#f5f5f5]">
                    <X size={15} />{t("search.remove")}
                  </button>
                ) : (
                  <button onClick={() => onToggleUniversity(uni.id)} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F4C430] px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]">
                    <Plus size={16} />{t("search.add")}
                  </button>
                )}
              </div>
            );
          })}
          {filteredUniversities.length === 0 && (
            <div className="px-5 py-10 text-center"><p className="text-base text-[#666]">{t("search.noResults")}</p></div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="relative mx-4 w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
              <h2 className="text-lg font-bold text-[#1a1a1a]">{t("search.filtersTitle")}</h2>
              <button onClick={() => setShowFilters(false)} className="rounded-lg p-1 text-[#666] transition-colors hover:bg-[#f5f5f5]"><X size={20} /></button>
            </div>
            <div className="space-y-5 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("search.city")}</label>
                <input type="text" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} placeholder={t("search.cityPlaceholder")}
                  className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-[15px] outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("search.distance")}</label>
                <input type="text" value={filterDistance} onChange={(e) => setFilterDistance(e.target.value)} placeholder={t("search.distancePlaceholder")}
                  className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-[15px] outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#f0f0f0] px-6 py-4">
              <button onClick={() => { setFilterCity(""); setFilterDistance(""); }} className="text-sm font-medium text-[#666] transition-colors hover:text-[#1a1a1a]">{t("search.clearFilters")}</button>
              <button onClick={() => setShowFilters(false)} className="rounded-lg bg-[#F4C430] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]">
                {t("search.show")} {filteredUniversities.length} {filteredUniversities.length === 1 ? t("uni.one") : t("uni.many")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════ */

function MyUniversitiesOverview({ locale, setLocale, addedUniversities, onAddMore, t }: {
  locale: string; setLocale: (l: "en" | "th") => void;
  addedUniversities: University[]; onAddMore: () => void; t: TFn;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-8 pb-1 pt-5">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("uni.title")}</h1>
          <p className="mt-1 text-lg text-[#666]">
            {addedUniversities.length} {addedUniversities.length === 1 ? t("uni.one") : t("uni.many")} {t("uni.onList")}
          </p>
        </div>
        <LangToggle locale={locale} setLocale={setLocale} />
      </div>

      <div className="px-8 pb-6 pt-4">
        {addedUniversities.length === 0 ? (
          <div className="rounded-xl border border-[#e8e8e8] bg-white px-6 py-10 text-center">
            <p className="mb-4 text-base text-[#666]">{t("uni.noUnis")}</p>
            <button onClick={onAddMore} className="inline-flex items-center gap-2 rounded-lg bg-[#F4C430] px-6 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]">
              <Search size={18} />{t("uni.searchBtn")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-4">
                <p className="text-sm text-[#666]">{t("uni.many")}</p>
                <p className="mt-1 text-2xl font-bold text-[#1a1a1a]">{addedUniversities.length}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-4">
                <p className="text-sm text-[#666]">{t("uni.inProgress")}</p>
                <p className="mt-1 text-2xl font-bold text-[#F4C430]">0</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-4">
                <p className="text-sm text-[#666]">{t("uni.submitted")}</p>
                <p className="mt-1 text-2xl font-bold text-green-500">0</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] bg-white">
              <div className="border-b border-[#f0f0f0] px-6 py-3.5">
                <h2 className="text-lg font-bold text-[#1a1a1a]">{t("uni.yourUnis")}</h2>
              </div>
              <div className="max-h-[480px] divide-y divide-[#f0f0f0] overflow-y-auto">
                {addedUniversities.map((uni) => (
                  <div key={uni.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F4C430]/20 text-base font-bold text-[#1a1a1a]">{uni.name[0]}</div>
                      <div>
                        <p className="text-base font-semibold text-[#1a1a1a]">{uni.name}</p>
                        <p className="text-sm text-[#888]">{uni.name_th}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#f0f0f0] px-3 py-1 text-xs font-medium text-[#666]">{t("uni.notStarted")}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={onAddMore} className="inline-flex items-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-5 py-2.5 text-[15px] font-semibold text-[#444] transition-colors hover:bg-[#f5f5f5]">
              <Plus size={17} />{t("uni.addMoreBtn")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   Shared Components
   ══════════════════════════════════════════════ */

function LangToggle({ locale, setLocale }: { locale: string; setLocale: (l: "en" | "th") => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-white p-0.5">
      <button onClick={() => setLocale("en")} className={`rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${locale === "en" ? "bg-[#F4C430] text-[#1a1a1a]" : "text-[#666] hover:text-[#1a1a1a]"}`}>EN</button>
      <button onClick={() => setLocale("th")} className={`rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${locale === "th" ? "bg-[#F4C430] text-[#1a1a1a]" : "text-[#666] hover:text-[#1a1a1a]"}`}>TH</button>
    </div>
  );
}

function StatusDot({ status }: { status: SectionStatus }) {
  if (status === "completed") {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7L5.5 9.5L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (status === "in_progress") return <div className="h-6 w-6 rounded-full border-2 border-[#F4C430] bg-[#FFF3D0]" />;
  return <div className="h-6 w-6 rounded-full border-2 border-[#ddd]" />;
}

function FAQItem({ question, answer, t }: { question: string; answer: string; t: TFn }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <h3 className="text-[15px] font-semibold leading-snug text-[#1a1a1a]">{question}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[#666]">{expanded ? answer : answer.slice(0, 70) + "..."}</p>
      <button onClick={() => setExpanded(!expanded)} className="mt-1 text-sm font-medium text-[#F4C430] hover:text-[#e6b82a]">
        {expanded ? t("help.showLess") : t("help.readMore")}
      </button>
    </div>
  );
}

function SlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}
