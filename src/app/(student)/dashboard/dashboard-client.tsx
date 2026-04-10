"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { StudentProfile } from "@/types/database";
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
} from "lucide-react";
import AccountSettingsModal from "./account-settings-modal";

interface Props {
  user: { email: string; id: string };
  profile: StudentProfile | null;
}

type SectionStatus = "completed" | "in_progress" | "not_started";
type View = "dashboard" | "university-search";

// Placeholder university data for the search view
const SAMPLE_UNIVERSITIES = [
  { id: "1", name: "Chulalongkorn University", location: "Bangkok" },
  { id: "2", name: "Mahidol University", location: "Nakhon Pathom" },
  { id: "3", name: "Thammasat University", location: "Bangkok" },
  { id: "4", name: "Kasetsart University", location: "Bangkok" },
  { id: "5", name: "Chiang Mai University", location: "Chiang Mai" },
  { id: "6", name: "King Mongkut's Institute of Technology Ladkrabang", location: "Bangkok" },
  { id: "7", name: "Silpakorn University", location: "Nakhon Pathom" },
  { id: "8", name: "Khon Kaen University", location: "Khon Kaen" },
];

export default function DashboardClient({ user, profile }: Props) {
  const router = useRouter();
  const [lang, setLang] = useState<"EN" | "TH">("EN");
  const [showSettings, setShowSettings] = useState(false);
  const [applicationExpanded, setApplicationExpanded] = useState(true);
  const [universitiesExpanded, setUniversitiesExpanded] = useState(true);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [uniSearch, setUniSearch] = useState("");

  const applicationRef = useRef<HTMLDivElement>(null);
  const universitiesRef = useRef<HTMLDivElement>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Good night";
  };

  const firstName = profile?.first_name || user.email.split("@")[0];

  // Calculate personal info completion
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

  const sections: { label: string; status: SectionStatus }[] = [
    { label: "Personal Information", status: personalStatus },
    { label: "Family", status: "not_started" },
    { label: "Education", status: "not_started" },
    { label: "Test Scores", status: "not_started" },
    { label: "Documents", status: "not_started" },
  ];

  const completedCount = sections.filter(
    (s) => s.status === "completed",
  ).length;
  const inProgressCount = sections.filter(
    (s) => s.status === "in_progress",
  ).length;
  const progress = Math.round(
    ((completedCount + inProgressCount * 0.5) / sections.length) * 100,
  );

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredUniversities = SAMPLE_UNIVERSITIES.filter(
    (u) =>
      u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
      u.location.toLowerCase().includes(uniSearch.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen">
      {/* ── Left Sidebar ── */}
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-[#e8e8e8] bg-white">
        {/* Logo */}
        <div className="border-b border-[#f0f0f0] px-6 py-5">
          <span className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
            Sabai<span className="text-[#F4C430]">Apply</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {/* Dashboard */}
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium transition-colors ${
              currentView === "dashboard"
                ? "bg-[#FFF3D0] text-[#1a1a1a]"
                : "text-[#444] hover:bg-[#f5f5f5]"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          {/* EXPLORE */}
          <div className="px-3 pb-1 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">
              Explore
            </span>
          </div>
          <button
            onClick={() => setCurrentView("university-search")}
            className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium transition-colors ${
              currentView === "university-search"
                ? "bg-[#FFF3D0] text-[#1a1a1a]"
                : "text-[#444] hover:bg-[#f5f5f5]"
            }`}
          >
            <Search size={20} />
            Choose University
            {currentView !== "university-search" && (
              <span className="absolute right-3 h-2.5 w-2.5 animate-pulse rounded-full bg-[#F4C430]" />
            )}
          </button>

          {/* APPLY */}
          <div className="px-3 pb-1 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">
              Apply
            </span>
          </div>
          <button
            onClick={() => {
              setCurrentView("dashboard");
              setTimeout(() => scrollTo(applicationRef), 100);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
          >
            <FileText size={20} />
            My Application Form
          </button>
          <button
            onClick={() => {
              setCurrentView("dashboard");
              setTimeout(() => scrollTo(universitiesRef), 100);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
          >
            <Building2 size={20} />
            My Universities
          </button>
        </nav>

        {/* Bottom section */}
        <div className="space-y-1 border-t border-[#f0f0f0] px-3 py-3">
          <button
            onClick={() => setShowSettings(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
          >
            <Settings size={20} />
            Settings
          </button>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
          >
            <LogOut size={20} />
            Sign out
          </button>
        </div>

        {/* Profile card */}
        <div className="border-t border-[#f0f0f0] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4C430] text-sm font-bold text-[#1a1a1a]">
              {(profile?.first_name?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-[#1a1a1a]">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : user.email.split("@")[0]}
              </p>
              <p className="truncate text-sm text-[#888]">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto bg-[#FFF9EC]">
        {currentView === "dashboard" ? (
          <DashboardView
            greeting={getGreeting()}
            firstName={firstName}
            lang={lang}
            setLang={setLang}
            applicationExpanded={applicationExpanded}
            setApplicationExpanded={setApplicationExpanded}
            universitiesExpanded={universitiesExpanded}
            setUniversitiesExpanded={setUniversitiesExpanded}
            applicationRef={applicationRef}
            universitiesRef={universitiesRef}
            sections={sections}
            progress={progress}
            onSearchUniversities={() => setCurrentView("university-search")}
          />
        ) : (
          <UniversitySearchView
            lang={lang}
            setLang={setLang}
            uniSearch={uniSearch}
            setUniSearch={setUniSearch}
            filteredUniversities={filteredUniversities}
            onBack={() => setCurrentView("dashboard")}
          />
        )}
      </main>

      {/* ── Right Sidebar ── */}
      <aside className="flex w-[300px] shrink-0 flex-col border-l border-[#e8e8e8] bg-[#F8F9FB]">
        {/* Header + Search */}
        <div className="border-b border-[#e8e8e8] px-5 py-5">
          <div className="mb-4 flex items-center gap-2">
            <HelpCircle size={20} className="text-[#666]" />
            <h2 className="text-lg font-bold text-[#1a1a1a]">
              Help &amp; support
            </h2>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search FAQs"
              className="w-full rounded-lg border border-[#e0e0e0] bg-white py-2.5 pl-4 pr-10 text-[15px] outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
            />
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]"
            />
          </div>
          <p className="mt-2 text-sm text-[#999]">
            Search takes you to the student solution center
          </p>
        </div>

        {/* FAQ Items */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <FAQItem
            question="How can I add a university to my list?"
            answer="To add a university, select Choose University from the sidebar and browse available programs. Click the + button on any university you're interested in."
          />
          <FAQItem
            question="What documents do I need to apply?"
            answer="Most programs require transcripts, ID copy, test scores, and a portfolio. Check each program's specific requirements page for details."
          />
          <FAQItem
            question="Can I edit my application after submitting?"
            answer="You can edit your application until the program's deadline. After that, changes are locked and your submission is final."
          />
          <FAQItem
            question="How many universities can I apply to?"
            answer="You may add and apply to multiple programs across different universities. There is no limit, but check each round's rules for restrictions."
          />
        </div>

        {/* Support Chat Button */}
        <div className="border-t border-[#e8e8e8] px-5 py-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#333]">
            <MessageCircle size={18} />
            24/7 Support Chat
          </button>
        </div>
      </aside>

      {/* Account Settings Modal */}
      {showSettings && (
        <AccountSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Dashboard View (default center content)
   ══════════════════════════════════════════════ */

function DashboardView({
  greeting,
  firstName,
  lang,
  setLang,
  applicationExpanded,
  setApplicationExpanded,
  universitiesExpanded,
  setUniversitiesExpanded,
  applicationRef,
  universitiesRef,
  sections,
  progress,
  onSearchUniversities,
}: {
  greeting: string;
  firstName: string;
  lang: "EN" | "TH";
  setLang: (l: "EN" | "TH") => void;
  applicationExpanded: boolean;
  setApplicationExpanded: (v: boolean) => void;
  universitiesExpanded: boolean;
  setUniversitiesExpanded: (v: boolean) => void;
  applicationRef: React.RefObject<HTMLDivElement | null>;
  universitiesRef: React.RefObject<HTMLDivElement | null>;
  sections: { label: string; status: SectionStatus }[];
  progress: number;
  onSearchUniversities: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-10 pb-2 pt-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Dashboard</h1>
          <p className="mt-1 text-lg text-[#666]">
            {greeting}, {firstName}!
          </p>
        </div>
        <LangToggle lang={lang} setLang={setLang} />
      </div>

      {/* Sections */}
      <div className="space-y-6 px-10 pb-10 pt-6">
        {/* ── My Application ── */}
        <div
          ref={applicationRef}
          className="rounded-xl border border-[#e8e8e8] bg-white"
        >
          <button
            onClick={() => setApplicationExpanded(!applicationExpanded)}
            className="flex w-full items-center justify-between px-7 py-5 text-left"
          >
            <h2 className="text-xl font-bold text-[#1a1a1a]">
              My Application
            </h2>
            {applicationExpanded ? (
              <ChevronUp size={22} className="text-[#666]" />
            ) : (
              <ChevronDown size={22} className="text-[#666]" />
            )}
          </button>

          {applicationExpanded && (
            <div className="px-7 pb-7">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[15px] text-[#666]">
                    Overall progress
                  </span>
                  <span className="text-[15px] font-semibold text-[#1a1a1a]">
                    {progress}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                  <div
                    className="h-full rounded-full bg-[#F4C430] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Section list */}
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.label}
                    className="group flex w-full items-center justify-between rounded-lg px-5 py-4 text-left transition-colors hover:bg-[#FFFBF0]"
                  >
                    <div className="flex items-center gap-4">
                      <StatusDot status={section.status} />
                      <span className="text-base font-medium text-[#1a1a1a]">
                        {section.label}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      className="-rotate-90 text-[#ccc] group-hover:text-[#999]"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── My Universities ── */}
        <div
          ref={universitiesRef}
          className="rounded-xl border border-[#e8e8e8] bg-white"
        >
          <button
            onClick={() => setUniversitiesExpanded(!universitiesExpanded)}
            className="flex w-full items-center justify-between px-7 py-5 text-left"
          >
            <h2 className="text-xl font-bold text-[#1a1a1a]">
              My Universities
            </h2>
            {universitiesExpanded ? (
              <ChevronUp size={22} className="text-[#666]" />
            ) : (
              <ChevronDown size={22} className="text-[#666]" />
            )}
          </button>

          {universitiesExpanded && (
            <div className="flex flex-col items-center px-7 pb-10 text-center">
              {/* Empty state illustration */}
              <div className="my-5 text-[#ccc]">
                <svg
                  width="140"
                  height="90"
                  viewBox="0 0 140 90"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M25 65 Q35 25 70 45 Q105 65 115 35"
                    stroke="#ddd"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M100 30 L115 35 L110 20"
                    stroke="#F4C430"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="20"
                    y="62"
                    width="100"
                    height="2"
                    rx="1"
                    fill="#eee"
                  />
                </svg>
              </div>
              <p className="mb-5 text-base text-[#666]">
                Nothing here yet! Add some universities to your list to get
                started.
              </p>
              <button
                onClick={onSearchUniversities}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-[#1a1a1a] px-6 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
              >
                <Search size={18} />
                Search universities
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   University Search View (replaces center)
   ══════════════════════════════════════════════ */

function UniversitySearchView({
  lang,
  setLang,
  uniSearch,
  setUniSearch,
  filteredUniversities,
  onBack,
}: {
  lang: "EN" | "TH";
  setLang: (l: "EN" | "TH") => void;
  uniSearch: string;
  setUniSearch: (v: string) => void;
  filteredUniversities: { id: string; name: string; location: string }[];
  onBack: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-10 pb-2 pt-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-[#666] transition-colors hover:bg-white hover:text-[#1a1a1a]"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">
            University Search
          </h1>
        </div>
        <LangToggle lang={lang} setLang={setLang} />
      </div>

      {/* Search */}
      <div className="px-10 pt-4">
        <label className="mb-2 block text-base font-medium text-[#1a1a1a]">
          University or City Name
        </label>
        <div className="relative">
          <input
            type="text"
            value={uniSearch}
            onChange={(e) => setUniSearch(e.target.value)}
            placeholder="Search by name or city..."
            className="w-full rounded-lg border border-[#e0e0e0] bg-white px-5 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
          />
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]"
          />
        </div>

        {/* Results count */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[15px] text-[#666]">
            <span className="font-semibold text-[#1a1a1a]">
              {filteredUniversities.length}
            </span>{" "}
            {filteredUniversities.length === 1 ? "result" : "results"}
          </p>
          <p className="text-sm text-[#999]">Sort by: Name</p>
        </div>
      </div>

      {/* Results list */}
      <div className="px-10 pb-10 pt-3">
        <div className="divide-y divide-[#f0f0f0] rounded-xl border border-[#e8e8e8] bg-white">
          {filteredUniversities.map((uni) => (
            <div
              key={uni.id}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#FFFBF0]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F4C430]/20 text-base font-bold text-[#1a1a1a]">
                  {uni.name[0]}
                </div>
                <div>
                  <p className="text-base font-semibold text-[#1a1a1a]">
                    {uni.name}
                  </p>
                  <p className="text-sm text-[#888]">{uni.location}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 rounded-lg bg-[#F4C430] px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]">
                <Plus size={16} />
                Add
              </button>
            </div>
          ))}
          {filteredUniversities.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-base text-[#666]">
                No universities found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   Shared Components
   ══════════════════════════════════════════════ */

function LangToggle({
  lang,
  setLang,
}: {
  lang: "EN" | "TH";
  setLang: (l: "EN" | "TH") => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-white p-0.5">
      <button
        onClick={() => setLang("EN")}
        className={`rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${
          lang === "EN"
            ? "bg-[#F4C430] text-[#1a1a1a]"
            : "text-[#666] hover:text-[#1a1a1a]"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("TH")}
        className={`rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${
          lang === "TH"
            ? "bg-[#F4C430] text-[#1a1a1a]"
            : "text-[#666] hover:text-[#1a1a1a]"
        }`}
      >
        TH
      </button>
    </div>
  );
}

function StatusDot({ status }: { status: SectionStatus }) {
  if (status === "completed") {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 7L5.5 9.5L11 4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="h-6 w-6 rounded-full border-2 border-[#F4C430] bg-[#FFF3D0]" />
    );
  }
  return <div className="h-6 w-6 rounded-full border-2 border-[#ddd]" />;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <h3 className="text-[15px] font-semibold leading-snug text-[#1a1a1a]">
        {question}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[#666]">
        {expanded ? answer : answer.slice(0, 70) + "..."}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1 text-sm font-medium text-[#F4C430] hover:text-[#e6b82a]"
      >
        {expanded ? "Show less" : "Read full answer"}
      </button>
    </div>
  );
}
