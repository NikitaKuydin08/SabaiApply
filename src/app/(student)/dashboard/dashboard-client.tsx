"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { StudentProfile } from "@/types/database";
import { faqCategories, faqEntries, type FAQCategory } from "../data/faq";

export interface Program {
  id: string;
  name: string;
  name_th: string;
  degree_type: string | null;
  is_international: boolean;
  tuition_per_semester: number | null;
}

export interface Faculty {
  id: string;
  name: string;
  name_th: string;
  programs: Program[];
}

export interface University {
  id: string;
  name: string;
  name_th: string;
  website: string | null;
  logo_url: string | null;
  facultyCount: number;
  programCount: number;
  faculties: Faculty[];
}
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
  Plus,
  X,
  Eye,
  PlusCircle,
  Menu as MenuIcon,
} from "lucide-react";
import AccountSettingsModal from "./account-settings-modal";
import UniversityAppView, {
  UniStatusRing,
  useUniDraft,
  getUniSectionStatuses,
  getUniOverallStatus,
  readUniDraft,
  type UniAppSection,
  type UniOverallStatus,
} from "./university-app-view";
import PersonalInfoSection from "./sections/personal-info-section";
import FamilySection from "./sections/family-section";
import EducationSection from "./sections/education-section";
import TestScoresSection from "./sections/test-scores-section";
import DocumentsSection from "./sections/documents-section";
import ActivitiesSection from "./sections/activities-section";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { StudentFamily, StudentEducation, StudentScore, StudentDocument, PortfolioItem } from "@/types/database";

export interface SubmittedApplicationInfo {
  applicationId: string;
  status: string;
  submittedAt: string;
}

interface Props {
  user: { email: string; id: string };
  profile: StudentProfile | null;
  family: StudentFamily | null;
  education: StudentEducation | null;
  scores: StudentScore[];
  documents: StudentDocument[];
  portfolioItems: PortfolioItem[];
  universities: University[];
  submittedApplications: Record<string, SubmittedApplicationInfo>;
}

type SectionStatus = "completed" | "in_progress" | "not_started";
type AppSection = "personal" | "family" | "education" | "testScores" | "documents" | "activities" | null;
type View = "dashboard" | "university-search" | "my-universities" | "application-form";

const STORAGE_KEY = "sabaiapply-added-universities";

const APP_SECTION_ORDER: Exclude<AppSection, null>[] = [
  "personal",
  "family",
  "education",
  "testScores",
  "documents",
  "activities",
];

export default function DashboardClient({ user, profile, family, education, scores, documents, portfolioItems, universities, submittedApplications }: Props) {
  const { locale, setLocale, t } = useLocale();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [activeSection, setActiveSection] = useState<AppSection>(null);
  const [applicationExpanded, setApplicationExpanded] = useState(true);
  const [universitiesExpanded, setUniversitiesExpanded] = useState(true);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [activeUniId, setActiveUniId] = useState<string | null>(null);
  const [activeUniSection, setActiveUniSection] = useState<UniAppSection>("info");
  const [uniExpanded, setUniExpanded] = useState(true);
  const [uniSearch, setUniSearch] = useState("");
  const [addedUniversityIds, setAddedUniversityIds] = useState<Set<string>>(new Set());
  const [uniStatuses, setUniStatuses] = useState<Record<string, UniOverallStatus>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileHelpOpen, setMobileHelpOpen] = useState(false);

  const [uniDraft, setUniDraft] = useUniDraft(activeUniId ?? "");

  // Auto-add any universities the student has already submitted an
  // application to — keeps "My Universities" in sync when the student
  // opens the dashboard from a different device or after clearing
  // localStorage.
  useEffect(() => {
    const submittedIds = Object.keys(submittedApplications);
    if (submittedIds.length === 0) return;
    setAddedUniversityIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const id of submittedIds) {
        if (!next.has(id)) { next.add(id); changed = true; }
      }
      if (changed) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submittedApplications]);

  // Recompute the overall status for every added uni whenever the set
  // changes OR the active uni's draft changes (so the Overview reflects
  // live edits without requiring a refresh). Server-confirmed submissions
  // from `submittedApplications` always win over the local draft.
  useEffect(() => {
    const next: Record<string, UniOverallStatus> = {};
    for (const id of addedUniversityIds) {
      if (submittedApplications[id]) {
        next[id] = "submitted";
      } else {
        next[id] = getUniOverallStatus(readUniDraft(id));
      }
    }
    setUniStatuses(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addedUniversityIds, activeUniId, uniDraft, submittedApplications]);

  function openUniversity(id: string) {
    // Auto-add to "my universities" so the flow mirrors Common App
    setAddedUniversityIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
    setActiveUniId(id);
    setActiveUniSection("info");
    setUniExpanded(true);
    setCurrentView("my-universities");
  }

  function submitUniversityApplication(id: string) {
    // Draft (signatureName + submittedAt) has already been written by the modal.
    // Recompute the status map so the Overview flips this uni to "submitted".
    setUniStatuses((prev) => ({ ...prev, [id]: getUniOverallStatus(readUniDraft(id)) }));
    // Land the user back on this university's info page so they can see the status.
    setActiveUniSection("info");
  }

  function removeUniversity(id: string) {
    setAddedUniversityIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        localStorage.removeItem(`sabaiapply-uni-app-${id}`);
      } catch { /* ignore */ }
      return next;
    });
    setActiveUniId(null);
    setCurrentView("my-universities");
  }

  // Load saved universities after hydration to avoid SSR mismatch.
  // Filter out stale IDs that no longer match any university in the DB.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const ids = JSON.parse(saved) as string[];
      const validIds = new Set(universities.map((u) => u.id));
      const kept = ids.filter((id) => validIds.has(id));
      if (kept.length > 0) setAddedUniversityIds(new Set(kept));
      if (kept.length !== ids.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
      }
    } catch { /* ignore */ }
  }, [universities]);

  const applicationRef = useRef<HTMLDivElement>(null);
  const universitiesRef = useRef<HTMLDivElement>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);
  const uniScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever the student lands on a new common-app section
  // (triggered by clicking Continue, or navigating from the sidebar).
  // Covers both the inner desktop scroll container AND the window scroll on mobile.
  useEffect(() => {
    if (!activeSection) return;
    if (formScrollRef.current) formScrollRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeSection]);

  // Same for per-university sections (info/general/academics/other/review).
  useEffect(() => {
    if (currentView !== "my-universities" || !activeUniId) return;
    if (uniScrollRef.current) uniScrollRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeUniSection, activeUniId, currentView]);

  function goToNextSection() {
    if (!activeSection) return;
    const idx = APP_SECTION_ORDER.indexOf(activeSection);
    const next = APP_SECTION_ORDER[idx + 1];
    router.refresh();
    if (next) {
      setActiveSection(next);
    } else {
      setCurrentView("dashboard");
      setActiveSection(null);
    }
  }

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
    profile?.id_number,
    profile?.address,
  ];
  const filledPersonal = personalFields.filter(Boolean).length;
  const personalStatus: SectionStatus =
    filledPersonal === personalFields.length
      ? "completed"
      : filledPersonal > 0
        ? "in_progress"
        : "not_started";

  // Calculate status for each section
  const familyStatus: SectionStatus = family
    ? (family.father_first_name && family.mother_first_name ? "completed" : "in_progress")
    : "not_started";

  const educationStatus: SectionStatus = education
    ? (education.school_name && education.gpa ? "completed" : "in_progress")
    : "not_started";

  const scoresStatus: SectionStatus = scores.length > 0 ? "completed" : "not_started";

  const requiredDocs = ["transcript", "id_copy", "photo"];
  const uploadedDocTypes = documents.map((d) => d.doc_type);
  const docsStatus: SectionStatus = requiredDocs.every((t) => uploadedDocTypes.includes(t as any))
    ? "completed"
    : documents.length > 0
      ? "in_progress"
      : "not_started";

  const sectionKeys: { key: TranslationKey; status: SectionStatus; action: AppSection }[] = [
    { key: "app.personal", status: personalStatus, action: "personal" },
    { key: "app.family", status: familyStatus, action: "family" },
    { key: "app.education", status: educationStatus, action: "education" },
    { key: "app.testScores", status: scoresStatus, action: "testScores" },
    { key: "app.documents", status: docsStatus, action: "documents" },
    { key: "app.activities", status: portfolioItems.length > 0 ? "completed" as SectionStatus : "not_started" as SectionStatus, action: "activities" },
  ];

  const sections = sectionKeys.map((s) => ({ label: t(s.key), status: s.status, action: s.action }));

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

  const filteredUniversities = useMemo(() => {
    const q = uniSearch.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter(
      (uni) =>
        uni.name.toLowerCase().includes(q) ||
        uni.name_th.includes(uniSearch.trim()),
    );
  }, [uniSearch, universities]);

  const addedUniversities = universities.filter((u) =>
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
  const showAppFormSidebar = currentView === "application-form";
  const activeUniversity = activeUniId ? universities.find((u) => u.id === activeUniId) ?? null : null;

  // Default to first incomplete section when entering application form
  function enterApplicationForm(section?: AppSection) {
    setCurrentView("application-form");
    if (section) {
      setActiveSection(section);
    } else if (!activeSection) {
      setActiveSection("personal");
    }
  }

  const uniSectionStatuses = useMemo(() => getUniSectionStatuses(uniDraft), [uniDraft]);
  const commonAppSectionsForReview = useMemo(() =>
    sectionKeys
      .filter((s): s is typeof s & { action: Exclude<AppSection, null> } => s.action !== null)
      .map((s) => ({ key: s.action as string, label: t(s.key), status: s.status, action: s.action })),
    [sectionKeys, t],
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ── Mobile Top Bar (Menu · Logo · Help) ── */}
      <MobileTopBar
        onOpenMenu={() => setMobileMenuOpen(true)}
        onOpenHelp={() => setMobileHelpOpen(true)}
        t={t}
      />

      <div className="flex min-h-0 flex-1">
      {/* ── Left Sidebar (desktop only) ── */}
      <aside className="hidden md:flex w-[280px] shrink-0 flex-col overflow-y-auto border-r border-[#e8e8e8] bg-white">
        <div className="border-b border-[#f0f0f0] px-6 py-5">
          <div className="flex items-center">
            <img src="/logo-lotus.png" alt="" className="mr-2 h-9 w-9 object-contain" />
            <span className="text-4xl font-bold tracking-tight text-[#1a1a1a]">
              Sabai<span className="text-[#F4C430]">Apply</span>
            </span>
          </div>
        </div>

        {showAppFormSidebar ? (
          /* ── Application Form Sidebar (Common App style) ── */
          <div className="flex flex-1 flex-col">
            {/* Icon strip + sections side by side */}
            <div className="flex flex-1 overflow-hidden">
              {/* Icon strip */}
              <div className="flex w-14 shrink-0 flex-col items-center border-r border-[#f0f0f0] py-3">
                <button
                  onClick={() => { setCurrentView("dashboard"); setActiveSection(null); }}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#444] transition-colors hover:bg-[#e8e8e8]"
                  title="Dashboard"
                >
                  <LayoutDashboard size={18} />
                </button>
                <button
                  onClick={() => enterApplicationForm()}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF3D0] text-[#1a1a1a]"
                  title={t("nav.myApplication")}
                >
                  <FileText size={18} />
                </button>
                <button
                  onClick={() => setCurrentView("university-search")}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#444] transition-colors hover:bg-[#f5f5f5]"
                  title={t("nav.chooseUni")}
                >
                  <Search size={18} />
                </button>
                <button
                  onClick={() => {
                    if (addedUniversities.length > 0) setCurrentView("my-universities");
                    else { setCurrentView("dashboard"); setTimeout(() => scrollTo(universitiesRef), 100); }
                  }}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#444] transition-colors hover:bg-[#f5f5f5]"
                  title={t("nav.myUniversities")}
                >
                  <Building2 size={18} />
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setShowSettings(true)}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#444] transition-colors hover:bg-[#f5f5f5]"
                  title={t("nav.settings")}
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={handleSignOut}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#444] transition-colors hover:bg-[#f5f5f5]"
                  title={t("nav.signOut")}
                >
                  <LogOut size={18} />
                </button>
              </div>

              {/* Section list */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <h3 className="px-3 pb-3 text-base font-bold text-[#1a1a1a]">
                  {t("app.title")}
                </h3>
                {sections.map((section) => (
                  <button
                    key={section.label}
                    onClick={() => setActiveSection(section.action)}
                    className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] font-medium transition-colors ${
                      activeSection === section.action
                        ? "bg-[#FFF3D0] text-[#1a1a1a]"
                        : "text-[#444] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    <StatusDot status={section.status} />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile card at bottom */}
            <div className="border-t border-[#f0f0f0] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4C430] text-sm font-bold text-[#1a1a1a]">
                  {(profile?.first_name?.[0] || user.email[0]).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1a1a1a]">
                    {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : user.email.split("@")[0]}
                  </p>
                  <p className="truncate text-xs text-[#888]">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        ) : showMyUniSidebar ? (
          /* ── My Universities Sidebar (Common App style, no back arrow) ── */
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 overflow-hidden">
              {/* Icon strip */}
              <div className="flex w-14 shrink-0 flex-col items-center border-r border-[#f0f0f0] py-3">
                <button
                  onClick={() => { setCurrentView("dashboard"); setActiveUniId(null); }}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#444] transition-colors hover:bg-[#f5f5f5]"
                  title="Dashboard"
                >
                  <LayoutDashboard size={18} />
                </button>
                <button
                  onClick={() => enterApplicationForm()}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#444] transition-colors hover:bg-[#f5f5f5]"
                  title={t("nav.myApplication")}
                >
                  <FileText size={18} />
                </button>
                <button
                  onClick={() => setCurrentView("university-search")}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#444] transition-colors hover:bg-[#f5f5f5]"
                  title={t("nav.chooseUni")}
                >
                  <Search size={18} />
                </button>
                <button
                  onClick={() => setActiveUniId(null)}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF3D0] text-[#1a1a1a]"
                  title={t("nav.myUniversities")}
                >
                  <Building2 size={18} />
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setShowSettings(true)}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#444] transition-colors hover:bg-[#f5f5f5]"
                  title={t("nav.settings")}
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={handleSignOut}
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#444] transition-colors hover:bg-[#f5f5f5]"
                  title={t("nav.signOut")}
                >
                  <LogOut size={18} />
                </button>
              </div>

              {/* My Universities section list */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <h3 className="px-3 pb-3 text-base font-bold text-[#1a1a1a]">
                  {t("nav.myUniversities")}
                </h3>
                <button
                  onClick={() => setActiveUniId(null)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
                    !activeUniId ? "bg-[#FFF3D0] text-[#1a1a1a]" : "text-[#444] hover:bg-[#f5f5f5]"
                  }`}
                >
                  <Eye size={17} />
                  {t("nav.overview")}
                </button>

                {addedUniversities.map((uni) => {
                  const isActive = activeUniId === uni.id;
                  const label = locale === "th" && uni.name_th ? uni.name_th : uni.name;
                  return (
                    <div key={uni.id} className="mt-1">
                      <button
                        onClick={() => {
                          if (isActive) {
                            setUniExpanded((v) => !v);
                          } else {
                            openUniversity(uni.id);
                          }
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium transition-colors ${
                          isActive ? "bg-[#f5f5f5] text-[#1a1a1a]" : "text-[#444] hover:bg-[#f5f5f5]"
                        }`}
                      >
                        {isActive && uniExpanded
                          ? <ChevronDown size={14} className="shrink-0 text-[#666]" />
                          : <ChevronDown size={14} className="shrink-0 -rotate-90 text-[#ccc]" />}
                        <span className="truncate">{label}</span>
                      </button>

                      {isActive && uniExpanded && (
                        <div className="ml-3 space-y-0.5 border-l border-[#e8e8e8] pl-2 pt-1">
                          <UniSidebarItem
                            label={t("uni.info")}
                            active={activeUniSection === "info"}
                            onClick={() => setActiveUniSection("info")}
                          />
                          <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-[#999]">
                            {t("uni.application")}
                          </div>
                          <UniSidebarItem
                            label={t("uni.general")}
                            active={activeUniSection === "general"}
                            status={uniSectionStatuses.general}
                            onClick={() => setActiveUniSection("general")}
                          />
                          <UniSidebarItem
                            label={t("uni.academics")}
                            active={activeUniSection === "academics"}
                            status={uniSectionStatuses.academics}
                            onClick={() => setActiveUniSection("academics")}
                          />
                          <UniSidebarItem
                            label={t("uni.otherRequirements")}
                            active={activeUniSection === "other"}
                            status={uniSectionStatuses.other}
                            onClick={() => setActiveUniSection("other")}
                          />
                          <UniSidebarItem
                            label={t("uni.reviewAndSubmit")}
                            active={activeUniSection === "review"}
                            status={uniSectionStatuses.review}
                            onClick={() => setActiveUniSection("review")}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={() => setCurrentView("university-search")}
                  className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#F4C430] transition-colors hover:bg-[#f5f5f5]"
                >
                  <PlusCircle size={17} />
                  {t("nav.addUni")}
                </button>
              </div>
            </div>

            {/* Profile card at bottom */}
            <div className="border-t border-[#f0f0f0] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4C430] text-sm font-bold text-[#1a1a1a]">
                  {(profile?.first_name?.[0] || user.email[0]).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1a1a1a]">
                    {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : user.email.split("@")[0]}
                  </p>
                  <p className="truncate text-xs text-[#888]">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
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
                onClick={() => enterApplicationForm()}
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
            onOpenUniversity={openUniversity}
            onSectionClick={(action: AppSection) => enterApplicationForm(action)}
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
            onOpenUniversity={openUniversity}
            t={t}
          />
        )}
        {currentView === "my-universities" && !activeUniversity && (
          <MyUniversitiesOverview
            locale={locale}
            setLocale={setLocale}
            addedUniversities={addedUniversities}
            uniStatuses={uniStatuses}
            onOpenUniversity={openUniversity}
            onAddMore={() => setCurrentView("university-search")}
            t={t}
          />
        )}
        {currentView === "my-universities" && activeUniversity && (
          <div className="px-4 pb-6 pt-4 md:px-8 md:pb-8 md:pt-5">
            <div className="mb-4 flex items-center justify-end">
              <LangToggle locale={locale} setLocale={setLocale} />
            </div>
            <div ref={uniScrollRef} className="overflow-y-auto rounded-2xl border border-[#e8e8e8] bg-white px-4 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] md:max-h-[calc(100vh-130px)] md:px-10 md:py-10">
              <UniversityAppView
                university={activeUniversity}
                activeSection={activeUniSection}
                setActiveSection={setActiveUniSection}
                draft={uniDraft}
                onDraftChange={setUniDraft}
                commonAppSections={commonAppSectionsForReview}
                locale={locale as "en" | "th"}
                studentData={{
                  email: user.email,
                  profile,
                  family,
                  education,
                  scores,
                  documents,
                  portfolioItems,
                }}
                onRemove={() => removeUniversity(activeUniversity.id)}
                onJumpToCommonAppSection={(action) => { setActiveSection(action); setCurrentView("application-form"); }}
                onSubmitApplication={() => submitUniversityApplication(activeUniversity.id)}
              />
            </div>
          </div>
        )}
        {currentView === "application-form" && (
          <div className="px-4 pb-6 pt-4 md:px-8 md:pb-8 md:pt-5">
            <div className="mb-4 flex items-center justify-between gap-3 md:mb-5">
              <h1 className="text-xl font-bold text-[#1a1a1a] md:text-2xl">
                {sections.find((s) => s.action === activeSection)?.label || t("app.title")}
              </h1>
              <LangToggle locale={locale} setLocale={setLocale} />
            </div>
            <div ref={formScrollRef} className="overflow-y-auto rounded-2xl border border-[#e8e8e8] bg-white px-4 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] md:max-h-[calc(100vh-140px)] md:px-8 md:py-8">
              {activeSection === "personal" && (
                <PersonalInfoSection profile={profile} userId={user.id} onClose={() => { setCurrentView("dashboard"); setActiveSection(null); }} userEmail={user.email} inline onSaved={goToNextSection} />
              )}
              {activeSection === "family" && (
                <FamilySection family={family} studentId={profile?.id ?? ""} onClose={() => { setCurrentView("dashboard"); setActiveSection(null); }} inline onSaved={goToNextSection} />
              )}
              {activeSection === "education" && (
                <EducationSection education={education} studentId={profile?.id ?? ""} onClose={() => { setCurrentView("dashboard"); setActiveSection(null); }} inline onSaved={goToNextSection} />
              )}
              {activeSection === "testScores" && (
                <TestScoresSection scores={scores} studentId={profile?.id ?? ""} onClose={() => { setCurrentView("dashboard"); setActiveSection(null); }} inline onSaved={goToNextSection} />
              )}
              {activeSection === "documents" && (
                <DocumentsSection documents={documents} studentId={profile?.id ?? ""} userId={user.id} onClose={() => { setCurrentView("dashboard"); setActiveSection(null); }} inline onSaved={goToNextSection} />
              )}
              {activeSection === "activities" && (
                <ActivitiesSection items={portfolioItems} studentId={profile?.id ?? ""} onClose={() => { setCurrentView("dashboard"); setActiveSection(null); }} inline onSaved={goToNextSection} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Right Sidebar (desktop only) ── */}
      <HelpSidebar locale={locale} t={t} />
      </div>

      {/* ── Mobile Footer (Privacy · Terms) ── */}
      <MobileFooter t={t} />

      {/* ── Mobile Menu Drawer ── */}
      {mobileMenuOpen && (
        <MobileMenuDrawer
          onClose={() => setMobileMenuOpen(false)}
          t={t}
          user={user}
          profile={profile}
          addedUniversitiesCount={addedUniversities.length}
          onDashboard={() => { setCurrentView("dashboard"); setActiveUniId(null); setActiveSection(null); }}
          onChooseUni={() => setCurrentView("university-search")}
          onMyApplication={() => enterApplicationForm()}
          onMyUniversities={() => {
            if (addedUniversities.length > 0) setCurrentView("my-universities");
            else { setCurrentView("dashboard"); setTimeout(() => scrollTo(universitiesRef), 100); }
          }}
          onSettings={() => setShowSettings(true)}
          onSignOut={handleSignOut}
        />
      )}

      {/* ── Mobile Help Drawer ── */}
      {mobileHelpOpen && (
        <MobileHelpDrawer
          locale={locale}
          t={t}
          onClose={() => setMobileHelpOpen(false)}
        />
      )}

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

function DashboardView({ greeting, firstName, locale, setLocale, applicationExpanded, setApplicationExpanded, universitiesExpanded, setUniversitiesExpanded, applicationRef, universitiesRef, sections, progress, addedUniversities, onSearchUniversities, onViewMyUniversities, onOpenUniversity, onSectionClick, t }: {
  greeting: string; firstName: string; locale: string; setLocale: (l: "en" | "th") => void;
  applicationExpanded: boolean; setApplicationExpanded: (v: boolean) => void;
  universitiesExpanded: boolean; setUniversitiesExpanded: (v: boolean) => void;
  applicationRef: React.RefObject<HTMLDivElement | null>; universitiesRef: React.RefObject<HTMLDivElement | null>;
  sections: { label: string; status: SectionStatus; action: AppSection }[]; progress: number;
  addedUniversities: University[]; onSearchUniversities: () => void; onViewMyUniversities: () => void;
  onOpenUniversity: (id: string) => void;
  onSectionClick: (action: AppSection) => void; t: TFn;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-3 md:px-8 md:pt-5">
        <div>
          <h1 className="text-lg font-bold text-[#1a1a1a] md:text-3xl">{t("dash.title")}</h1>
          <p className="text-sm text-[#666] md:mt-1 md:text-lg">{greeting}, {firstName}!</p>
        </div>
        <LangToggle locale={locale} setLocale={setLocale} />
      </div>

      <div className="space-y-2.5 px-4 pb-3 pt-2 md:space-y-4 md:pb-6 md:pt-4 md:px-8">
        <div ref={applicationRef} className="rounded-xl border border-[#e8e8e8] bg-white">
          <button onClick={() => setApplicationExpanded(!applicationExpanded)} className="flex w-full items-center justify-between px-4 py-2.5 text-left md:px-6 md:py-3.5">
            <h2 className="text-base font-bold text-[#1a1a1a] md:text-xl">{t("app.title")}</h2>
            {applicationExpanded ? <ChevronUp size={18} className="text-[#666] md:hidden" /> : <ChevronDown size={18} className="text-[#666] md:hidden" />}
            {applicationExpanded ? <ChevronUp size={22} className="hidden text-[#666] md:block" /> : <ChevronDown size={22} className="hidden text-[#666] md:block" />}
          </button>
          {applicationExpanded && (
            <div className="px-4 pb-3 md:px-6 md:pb-4">
              <div className="mb-2 md:mb-3">
                <div className="mb-1 flex items-center justify-between md:mb-1.5">
                  <span className="text-xs text-[#666] md:text-sm">{t("app.progress")}</span>
                  <span className="text-xs font-semibold text-[#1a1a1a] md:text-sm">{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f0] md:h-2">
                  <div className="h-full rounded-full bg-[#F4C430] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="space-y-0">
                {sections.map((section) => (
                  <button key={section.label} onClick={() => onSectionClick(section.action)} className="group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#FFFBF0] md:px-3 md:py-2">
                    <div className="flex items-center gap-3 md:gap-4">
                      <StatusDot status={section.status} />
                      <span className="text-sm font-medium text-[#1a1a1a] md:text-base">{section.label}</span>
                    </div>
                    <ChevronDown size={16} className="-rotate-90 text-[#ccc] group-hover:text-[#999] md:size-[18px]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={universitiesRef} className="rounded-xl border border-[#e8e8e8] bg-white">
          <button onClick={() => setUniversitiesExpanded(!universitiesExpanded)} className="flex w-full items-center justify-between px-4 py-2.5 text-left md:px-6 md:py-3.5">
            <h2 className="text-base font-bold text-[#1a1a1a] md:text-xl">
              {t("uni.title")}
              {addedUniversities.length > 0 && <span className="ml-2 text-sm font-normal text-[#999] md:text-base">({addedUniversities.length})</span>}
            </h2>
            {universitiesExpanded ? <ChevronUp size={18} className="text-[#666] md:hidden" /> : <ChevronDown size={18} className="text-[#666] md:hidden" />}
            {universitiesExpanded ? <ChevronUp size={22} className="hidden text-[#666] md:block" /> : <ChevronDown size={22} className="hidden text-[#666] md:block" />}
          </button>
          {universitiesExpanded && (
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              {addedUniversities.length === 0 ? (
                <div className="flex flex-col items-center text-center">
                  <div className="my-1.5 text-[#ccc] md:my-3">
                    <svg width="80" height="52" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:h-[70px] md:w-[110px]">
                      <path d="M25 65 Q35 25 70 45 Q105 65 115 35" stroke="#ddd" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                      <path d="M100 30 L115 35 L110 20" stroke="#F4C430" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="20" y="62" width="100" height="2" rx="1" fill="#eee" />
                    </svg>
                  </div>
                  <p className="mb-2.5 text-sm text-[#666] md:mb-4 md:text-base">{t("uni.empty")}</p>
                  <button onClick={onSearchUniversities} className="inline-flex items-center gap-2 rounded-lg border-2 border-[#1a1a1a] px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5] md:px-6 md:py-3 md:text-base">
                    <Search size={16} />{t("uni.searchBtn")}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="divide-y divide-[#f0f0f0]">
                    {addedUniversities.slice(0, 3).map((uni) => (
                      <button
                        key={uni.id}
                        onClick={() => onOpenUniversity(uni.id)}
                        className="flex w-full items-center gap-3 rounded-md py-2 text-left transition-colors hover:bg-[#FFFBF0]"
                      >
                        <UniLogo uni={uni} size="sm" />
                        <div>
                          <p className="text-[15px] font-medium text-[#1a1a1a]">{uni.name}</p>
                          <p className="text-sm text-[#888]">{uni.name_th}</p>
                        </div>
                      </button>
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

function UniversitySearchView({ locale, setLocale, uniSearch, setUniSearch, filteredUniversities, addedUniversityIds, onToggleUniversity, onOpenUniversity, t }: {
  locale: string; setLocale: (l: "en" | "th") => void;
  uniSearch: string; setUniSearch: (v: string) => void;
  filteredUniversities: University[]; addedUniversityIds: Set<string>;
  onToggleUniversity: (id: string) => void;
  onOpenUniversity: (id: string) => void;
  t: TFn;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterDistance, setFilterDistance] = useState("");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4 md:px-8 md:pt-5">
        <h1 className="truncate text-xl font-bold text-[#1a1a1a] md:text-3xl">{t("search.title")}</h1>
        <LangToggle locale={locale} setLocale={setLocale} />
      </div>

      <div className="px-4 pt-3 md:px-8">
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

      <div className="mt-3 px-4 pb-6 md:px-8">
        <div className="divide-y divide-[#f0f0f0] overflow-y-auto rounded-xl border border-[#e8e8e8] bg-white md:max-h-[calc(100vh-320px)]">
          {filteredUniversities.map((uni) => {
            const isAdded = addedUniversityIds.has(uni.id);
            return (
              <div key={uni.id} className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[#FFFBF0] md:px-5 md:py-4">
                <button
                  onClick={() => onOpenUniversity(uni.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left md:gap-4"
                >
                  <UniLogo uni={uni} />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-[#1a1a1a] md:text-base">{uni.name}</p>
                    <p className="truncate text-sm text-[#888]">{uni.name_th}</p>
                    {uni.programCount > 0 && (
                      <p className="mt-0.5 truncate text-xs text-[#999]">
                        {uni.facultyCount} {uni.facultyCount === 1 ? "faculty" : "faculties"} · {uni.programCount} {uni.programCount === 1 ? "program" : "programs"}
                      </p>
                    )}
                  </div>
                </button>
                {isAdded ? (
                  <button onClick={() => onToggleUniversity(uni.id)} className="flex shrink-0 items-center gap-1 rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-xs font-semibold text-[#666] transition-colors hover:bg-[#f5f5f5] md:gap-1.5 md:px-4 md:text-sm">
                    <X size={15} />{t("search.remove")}
                  </button>
                ) : (
                  <button onClick={() => onToggleUniversity(uni.id)} className="flex shrink-0 items-center gap-1 rounded-lg bg-[#F4C430] px-3 py-2 text-xs font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] md:gap-1.5 md:px-4 md:text-sm">
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

function MyUniversitiesOverview({ locale, setLocale, addedUniversities, uniStatuses, onOpenUniversity, onAddMore, t }: {
  locale: string; setLocale: (l: "en" | "th") => void;
  addedUniversities: University[];
  uniStatuses: Record<string, UniOverallStatus>;
  onOpenUniversity: (id: string) => void;
  onAddMore: () => void; t: TFn;
}) {
  const inProgressCount = addedUniversities.filter((u) => {
    const s = uniStatuses[u.id];
    return s === "in_progress" || s === "completed";
  }).length;
  const submittedCount = addedUniversities.filter((u) => uniStatuses[u.id] === "submitted").length;

  const badgeFor = (s: UniOverallStatus | undefined) => {
    if (s === "submitted") return { label: t("uni.submitted"), cls: "bg-green-50 text-green-700" };
    if (s === "completed") return { label: t("uni.completed"), cls: "bg-[#FFF3D0] text-[#8a6d17]" };
    if (s === "in_progress") return { label: t("uni.inProgress"), cls: "bg-[#FFF3D0] text-[#8a6d17]" };
    return { label: t("uni.notStarted"), cls: "bg-[#f0f0f0] text-[#666]" };
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-4 md:px-8 md:pt-5">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">{t("uni.title")}</h1>
          <p className="mt-1 text-base text-[#666] md:text-lg">
            {addedUniversities.length} {addedUniversities.length === 1 ? t("uni.one") : t("uni.many")} {t("uni.onList")}
          </p>
        </div>
        <LangToggle locale={locale} setLocale={setLocale} />
      </div>

      <div className="px-4 pb-6 pt-4 md:px-8">
        {addedUniversities.length === 0 ? (
          <div className="rounded-xl border border-[#e8e8e8] bg-white px-6 py-10 text-center">
            <p className="mb-4 text-base text-[#666]">{t("uni.noUnis")}</p>
            <button onClick={onAddMore} className="inline-flex items-center gap-2 rounded-lg bg-[#F4C430] px-6 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]">
              <Search size={18} />{t("uni.searchBtn")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="rounded-xl border border-[#e8e8e8] bg-white px-3 py-3 md:px-5 md:py-4">
                <p className="text-xs text-[#666] md:text-sm">{t("uni.many")}</p>
                <p className="mt-1 text-xl font-bold text-[#1a1a1a] md:text-2xl">{addedUniversities.length}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] bg-white px-3 py-3 md:px-5 md:py-4">
                <p className="text-xs text-[#666] md:text-sm">{t("uni.inProgress")}</p>
                <p className="mt-1 text-xl font-bold text-[#F4C430] md:text-2xl">{inProgressCount}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] bg-white px-3 py-3 md:px-5 md:py-4">
                <p className="text-xs text-[#666] md:text-sm">{t("uni.submitted")}</p>
                <p className="mt-1 text-xl font-bold text-green-500 md:text-2xl">{submittedCount}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] bg-white">
              <div className="border-b border-[#f0f0f0] px-6 py-3.5">
                <h2 className="text-lg font-bold text-[#1a1a1a]">{t("uni.yourUnis")}</h2>
              </div>
              <div className="max-h-[480px] divide-y divide-[#f0f0f0] overflow-y-auto">
                {addedUniversities.map((uni) => {
                  const badge = badgeFor(uniStatuses[uni.id]);
                  return (
                    <button
                      key={uni.id}
                      onClick={() => onOpenUniversity(uni.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FFFBF0] md:px-6 md:py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3 md:gap-4">
                        <UniLogo uni={uni} />
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-[#1a1a1a]">{uni.name}</p>
                          <p className="truncate text-sm text-[#888]">{uni.name_th}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium md:px-3 md:text-xs ${badge.cls}`}>{badge.label}</span>
                    </button>
                  );
                })}
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

/* ── Shared Components ── */

function LangToggle({ locale, setLocale }: { locale: string; setLocale: (l: "en" | "th") => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-white p-0.5">
      <button onClick={() => setLocale("en")} className={`rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${locale === "en" ? "bg-[#F4C430] text-[#1a1a1a]" : "text-[#666] hover:text-[#1a1a1a]"}`}>EN</button>
      <button onClick={() => setLocale("th")} className={`rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${locale === "th" ? "bg-[#F4C430] text-[#1a1a1a]" : "text-[#666] hover:text-[#1a1a1a]"}`}>TH</button>
    </div>
  );
}

function UniSidebarItem({ label, active, status, onClick }: {
  label: string;
  active: boolean;
  status?: "completed" | "in_progress" | "not_started";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[14px] font-medium transition-colors ${
        active ? "bg-[#FFF3D0] text-[#1a1a1a]" : "text-[#444] hover:bg-[#f5f5f5]"
      }`}
    >
      {status && <UniStatusRing status={status} />}
      <span className="truncate">{label}</span>
    </button>
  );
}

function UniLogo({ uni, size = "md" }: {
  uni: Pick<University, "name" | "logo_url">;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "sm" ? "h-9 w-9 text-sm" : size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-base";
  return (
    <div className={`${dims} flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F4C430]/20 font-bold text-[#1a1a1a]`}>
      {uni.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={uni.logo_url} alt="" className="h-full w-full object-contain" />
      ) : (
        <span>{uni.name[0]}</span>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: SectionStatus }) {
  if (status === "completed") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 md:h-6 md:w-6">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="md:h-3.5 md:w-3.5">
          <path d="M3 7L5.5 9.5L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (status === "in_progress") return <div className="h-5 w-5 rounded-full border-2 border-[#F4C430] bg-[#FFF3D0] md:h-6 md:w-6" />;
  return <div className="h-5 w-5 rounded-full border-2 border-[#ddd] md:h-6 md:w-6" />;
}

function HelpSidebar({ locale, t }: { locale: string; t: TFn }) {
  return (
    <aside className="hidden md:flex w-[300px] shrink-0 flex-col border-l border-[#e8e8e8] bg-[#F8F9FB]">
      <HelpContent locale={locale} t={t} />
    </aside>
  );
}

function HelpContent({ locale, t, onClose }: { locale: string; t: TFn; onClose?: () => void }) {
  const [faqSearch, setFaqSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FAQCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const filtered = faqEntries.filter((entry) => {
    if (activeCategory !== "all" && entry.category !== activeCategory) return false;
    
    if (!faqSearch.trim()) return true;
    const q = faqSearch.toLowerCase().trim();
    const question = t(entry.questionKey).toLowerCase();
    const answer = t(entry.answerKey).toLowerCase();
    return question.includes(q) || answer.includes(q);
  });

  return (
    <>
      {/* Header + Search */}
      <div className="border-b border-[#e8e8e8] px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-[#666]" />
            <h2 className="text-base font-bold text-[#1a1a1a]">{t("help.title")}</h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="rounded-lg p-1 text-[#666] hover:bg-[#f0f0f0]" aria-label="Close">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder={t("help.searchPlaceholder")}
            className="w-full rounded-lg border border-[#e0e0e0] bg-white py-2 pl-3 pr-9 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
          />
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" />
        </div>
      </div>

      {/* Category tabs */}
      <CategoryTabs locale={locale} activeCategory={activeCategory} setActiveCategory={setActiveCategory} t={t} />

      {/* FAQ list */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#999]">{t("help.noResults")}</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => {
              const question = t(entry.questionKey);
              const answer = t(entry.answerKey);
              const isExpanded = expandedId === entry.id;
              return (
                <div key={entry.id}>
                  <h3 className="text-sm font-semibold leading-snug text-[#1a1a1a]">{question}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#666]">
                    {isExpanded ? answer : answer.slice(0, 70) + "..."}
                  </p>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="mt-0.5 text-xs font-medium text-[#F4C430] hover:text-[#e6b82a]"
                  >
                    {isExpanded ? t("help.showLess") : t("help.readMore")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat button */}
      <div className="border-t border-[#e8e8e8] px-5 py-3">
        <button
          onClick={() => setShowChatModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
        >
          <MessageCircle size={16} />
          {t("help.chat")}
        </button>
      </div>

      {/* Chat Coming Soon Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowChatModal(false)} />
          <div className="relative mx-4 w-full max-w-sm rounded-xl bg-white px-8 py-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F4C430]/20">
              <MessageCircle size={28} className="text-[#F4C430]" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#1a1a1a]">{t("help.chatComingSoon")}</h3>
            <p className="mb-6 text-sm leading-relaxed text-[#666]">{t("help.chatComingSoonDesc")}</p>
            <button
              onClick={() => setShowChatModal(false)}
              className="rounded-lg bg-[#F4C430] px-6 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   Mobile Shell (top bar · menu drawer · help drawer · footer)
   ══════════════════════════════════════════════ */

function MobileTopBar({ onOpenMenu, onOpenHelp, t }: {
  onOpenMenu: () => void; onOpenHelp: () => void; t: TFn;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-[#e8e8e8] bg-white px-3 md:hidden">
      <button
        onClick={onOpenMenu}
        className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-[#444] transition-colors hover:bg-[#f5f5f5]"
        aria-label={t("nav.menu")}
      >
        <MenuIcon size={20} />
        <span className="text-xs font-medium">{t("nav.menu")}</span>
      </button>
      <div className="flex items-center">
        <img src="/logo-lotus.png" alt="" className="mr-1 h-6 w-6 object-contain" />
        <span className="text-lg font-bold tracking-tight text-[#1a1a1a]">
          Sabai<span className="text-[#F4C430]">Apply</span>
        </span>
      </div>
      <button
        onClick={onOpenHelp}
        className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-[#444] transition-colors hover:bg-[#f5f5f5]"
        aria-label={t("nav.help")}
      >
        <HelpCircle size={18} />
        <span className="text-xs font-medium">{t("nav.help")}</span>
      </button>
    </header>
  );
}

function MobileFooter({ t }: { t: TFn }) {
  return (
    <footer className="flex items-center justify-center gap-3 border-t border-[#e8e8e8] bg-white px-4 py-2 text-[11px] text-[#666] md:hidden">
      <a href="#" className="hover:text-[#1a1a1a] hover:underline">{t("footer.privacy")}</a>
      <span className="text-[#ccc]">·</span>
      <a href="#" className="hover:text-[#1a1a1a] hover:underline">{t("footer.terms")}</a>
      <span className="text-[#ccc]">·</span>
      <span className="text-[#999]">© {new Date().getFullYear()}</span>
    </footer>
  );
}

function MobileMenuDrawer({ onClose, t, user, profile, addedUniversitiesCount, onDashboard, onChooseUni, onMyApplication, onMyUniversities, onSettings, onSignOut }: {
  onClose: () => void; t: TFn;
  user: { email: string; id: string }; profile: StudentProfile | null;
  addedUniversitiesCount: number;
  onDashboard: () => void; onChooseUni: () => void;
  onMyApplication: () => void; onMyUniversities: () => void;
  onSettings: () => void; onSignOut: () => void;
}) {
  const navigate = (fn: () => void) => { fn(); onClose(); };
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 flex h-full w-[85%] max-w-[320px] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-4">
          <div className="flex items-center">
            <img src="/logo-lotus.png" alt="" className="mr-2 h-8 w-8 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
              Sabai<span className="text-[#F4C430]">Apply</span>
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#666] hover:bg-[#f5f5f5]" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <button onClick={() => navigate(onDashboard)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]">
            <LayoutDashboard size={20} />{t("nav.dashboard")}
          </button>

          <div className="px-3 pb-1 pt-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">{t("nav.explore")}</span>
          </div>
          <button onClick={() => navigate(onChooseUni)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]">
            <Search size={20} />{t("nav.chooseUni")}
          </button>

          <div className="px-3 pb-1 pt-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">{t("nav.apply")}</span>
          </div>
          <button onClick={() => navigate(onMyApplication)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]">
            <FileText size={20} />{t("nav.myApplication")}
          </button>
          <button onClick={() => navigate(onMyUniversities)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]">
            <Building2 size={20} />{t("nav.myUniversities")}
            {addedUniversitiesCount > 0 && <span className="ml-auto text-sm text-[#999]">({addedUniversitiesCount})</span>}
          </button>
        </nav>

        <div className="space-y-1 border-t border-[#f0f0f0] px-3 py-3">
          <button onClick={() => navigate(onSettings)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]">
            <Settings size={20} />{t("nav.settings")}
          </button>
          <button onClick={() => navigate(onSignOut)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]">
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
      </div>
    </div>
  );
}

function MobileHelpDrawer({ locale, t, onClose }: {
  locale: string; t: TFn; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-[340px] flex-col bg-[#F8F9FB] shadow-xl">
        <HelpContent locale={locale} t={t} onClose={onClose} />
      </div>
    </div>
  );
}

function CategoryTabs({ locale, activeCategory, setActiveCategory, t }: {
  locale: string; activeCategory: FAQCategory | "all"; setActiveCategory: (c: FAQCategory | "all") => void; t: TFn;
}) {
  const [open, setOpen] = useState(false);
  const defaultVisible: FAQCategory[] = ["account", "applying"];

  // If active category is not "all" and not in default visible, swap it in
  const visibleKeys: FAQCategory[] = activeCategory !== "all" && !defaultVisible.includes(activeCategory)
    ? [activeCategory, defaultVisible[0]]
    : [...defaultVisible];

  const hiddenCats = faqCategories.filter((c) => !visibleKeys.includes(c.key));
  const isOtherActive = hiddenCats.some((c) => c.key === activeCategory);

  return (
    <div className="relative flex gap-1 border-b border-[#e8e8e8] px-4 py-2">
      <button
        onClick={() => setActiveCategory("all")}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          activeCategory === "all" ? "bg-[#F4C430] text-[#1a1a1a]" : "text-[#666] hover:bg-[#f0f0f0]"
        }`}
      >
        {t("help.allCategories")}
      </button>
      {faqCategories.filter((c) => visibleKeys.includes(c.key)).map((cat) => (
        <button
          key={cat.key}
          onClick={() => setActiveCategory(cat.key)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === cat.key ? "bg-[#F4C430] text-[#1a1a1a]" : "text-[#666] hover:bg-[#f0f0f0]"
          }`}
        >
          {t(cat.labelKey)}
        </button>
      ))}
      {hiddenCats.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isOtherActive ? "bg-[#F4C430] text-[#1a1a1a]" : "text-[#666] hover:bg-[#f0f0f0]"
            }`}
          >
            {locale === "th" ? "อื่นๆ" : "Others"}
            <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-lg border border-[#e8e8e8] bg-white py-1 shadow-lg">
                {hiddenCats.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => { setActiveCategory(cat.key); setOpen(false); }}
                    className={`flex w-full px-4 py-2 text-left text-xs font-medium transition-colors ${
                      activeCategory === cat.key ? "bg-[#FFF3D0] text-[#1a1a1a]" : "text-[#444] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {t(cat.labelKey)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
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
