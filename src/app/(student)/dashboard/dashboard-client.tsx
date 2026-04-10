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
} from "lucide-react";
import AccountSettingsModal from "./account-settings-modal";

interface Props {
  user: { email: string; id: string };
  profile: StudentProfile | null;
}

type SectionStatus = "completed" | "in_progress" | "not_started";

export default function DashboardClient({ user, profile }: Props) {
  const router = useRouter();
  const [lang, setLang] = useState<"EN" | "TH">("EN");
  const [showSettings, setShowSettings] = useState(false);
  const [applicationExpanded, setApplicationExpanded] = useState(true);
  const [universitiesExpanded, setUniversitiesExpanded] = useState(true);

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

  return (
    <div className="flex min-h-screen">
      {/* ── Left Sidebar ── */}
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-[#e8e8e8] bg-white">
        {/* Logo */}
        <div className="border-b border-[#f0f0f0] px-6 py-5">
          <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">
            Sabai<span className="text-[#F4C430]">Apply</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {/* Dashboard */}
          <button className="flex w-full items-center gap-3 rounded-lg bg-[#FFF3D0] px-3 py-2.5 text-sm font-medium text-[#1a1a1a]">
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          {/* EXPLORE */}
          <div className="px-3 pb-1 pt-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">
              Explore
            </span>
          </div>
          <button
            onClick={() => scrollTo(universitiesRef)}
            className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
          >
            <Search size={18} />
            University search
            <span className="absolute right-3 h-2 w-2 animate-pulse rounded-full bg-[#F4C430]" />
          </button>

          {/* APPLY */}
          <div className="px-3 pb-1 pt-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">
              Apply
            </span>
          </div>
          <button
            onClick={() => scrollTo(applicationRef)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
          >
            <FileText size={18} />
            My Application Form
          </button>
          <button
            onClick={() => scrollTo(universitiesRef)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
          >
            <Building2 size={18} />
            My Universities
          </button>
        </nav>

        {/* Bottom section */}
        <div className="space-y-1 border-t border-[#f0f0f0] px-3 py-3">
          <button
            onClick={() => setShowSettings(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
          >
            <Settings size={18} />
            Settings
          </button>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#444] transition-colors hover:bg-[#f5f5f5]"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>

        {/* Profile card */}
        <div className="border-t border-[#f0f0f0] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4C430] text-sm font-bold text-[#1a1a1a]">
              {(profile?.first_name?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#1a1a1a]">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : user.email.split("@")[0]}
              </p>
              <p className="truncate text-xs text-[#888]">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto bg-[#FFF9EC]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            {getGreeting()}, {firstName}!
          </h1>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-white p-0.5">
            <button
              onClick={() => setLang("EN")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                lang === "EN"
                  ? "bg-[#F4C430] text-[#1a1a1a]"
                  : "text-[#666] hover:text-[#1a1a1a]"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("TH")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                lang === "TH"
                  ? "bg-[#F4C430] text-[#1a1a1a]"
                  : "text-[#666] hover:text-[#1a1a1a]"
              }`}
            >
              TH
            </button>
          </div>
        </div>

        {/* Dashboard sections */}
        <div className="space-y-6 px-8 pb-8">
          {/* ── My Application ── */}
          <div
            ref={applicationRef}
            className="rounded-xl border border-[#e8e8e8] bg-white"
          >
            <button
              onClick={() => setApplicationExpanded(!applicationExpanded)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <h2 className="text-lg font-bold text-[#1a1a1a]">
                My Application
              </h2>
              {applicationExpanded ? (
                <ChevronUp size={20} className="text-[#666]" />
              ) : (
                <ChevronDown size={20} className="text-[#666]" />
              )}
            </button>

            {applicationExpanded && (
              <div className="px-6 pb-6">
                {/* Progress Bar */}
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-[#666]">
                      Overall progress
                    </span>
                    <span className="text-sm font-semibold text-[#1a1a1a]">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
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
                      className="group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-[#FFFBF0]"
                    >
                      <div className="flex items-center gap-3">
                        <StatusDot status={section.status} />
                        <span className="text-sm font-medium text-[#1a1a1a]">
                          {section.label}
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
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
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <h2 className="text-lg font-bold text-[#1a1a1a]">
                My Universities
              </h2>
              {universitiesExpanded ? (
                <ChevronUp size={20} className="text-[#666]" />
              ) : (
                <ChevronDown size={20} className="text-[#666]" />
              )}
            </button>

            {universitiesExpanded && (
              <div className="flex flex-col items-center px-6 pb-8 text-center">
                {/* Empty state illustration */}
                <div className="my-4 text-[#ccc]">
                  <svg
                    width="120"
                    height="80"
                    viewBox="0 0 120 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 60 Q30 20 60 40 Q90 60 100 30"
                      stroke="#ddd"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M85 25 L100 30 L95 15"
                      stroke="#F4C430"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="15"
                      y="55"
                      width="90"
                      height="2"
                      rx="1"
                      fill="#eee"
                    />
                  </svg>
                </div>
                <p className="mb-4 text-sm text-[#666]">
                  Nothing here yet! Add some universities to your list to get
                  started.
                </p>
                <button className="inline-flex items-center gap-2 rounded-lg border border-[#1a1a1a] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]">
                  <Search size={16} />
                  Search universities
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Right Sidebar ── */}
      <aside className="flex w-[300px] shrink-0 flex-col border-l border-[#e8e8e8] bg-[#F8F9FB]">
        {/* Header + Search */}
        <div className="border-b border-[#e8e8e8] px-5 py-5">
          <div className="mb-4 flex items-center gap-2">
            <HelpCircle size={18} className="text-[#666]" />
            <h2 className="text-base font-bold text-[#1a1a1a]">
              Help &amp; support
            </h2>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search FAQs"
              className="w-full rounded-lg border border-[#e0e0e0] bg-white py-2 pl-3 pr-9 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
            />
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]"
            />
          </div>
          <p className="mt-1.5 text-xs text-[#999]">
            Search takes you to the student solution center
          </p>
        </div>

        {/* FAQ Items */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <FAQItem
            question="How can I add a university to my list?"
            answer="To add a university, select University search from the sidebar and browse available programs. Click 'Add' on any program you're interested in."
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
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333]">
            <MessageCircle size={16} />
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

/* ── Helper Components ── */

function StatusDot({ status }: { status: SectionStatus }) {
  if (status === "completed") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6L5 8.5L9.5 4"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="h-5 w-5 rounded-full border-2 border-[#F4C430] bg-[#FFF3D0]" />
    );
  }
  return <div className="h-5 w-5 rounded-full border-2 border-[#ddd]" />;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <h3 className="text-sm font-semibold leading-snug text-[#1a1a1a]">
        {question}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-[#666]">
        {expanded ? answer : answer.slice(0, 60) + "..."}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1 text-xs font-medium text-[#F4C430] hover:text-[#e6b82a]"
      >
        {expanded ? "Show less" : "Read full answer"}
      </button>
    </div>
  );
}
