"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  Info,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type { University } from "./dashboard-client";
import type { StudentProfile, StudentFamily, StudentEducation, StudentScore, StudentDocument, PortfolioItem } from "@/types/database";
import { getUniMeta } from "./uni-meta";
import { submitApplication } from "./actions";

// Brand icons (lucide removed these to avoid trademark issues — using inline SVG).
function Facebook({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.6c0-.9.2-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H8v3h2.5V21h3z" />
    </svg>
  );
}
function Instagram({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Twitter({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function Youtube({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 7.5s-.2-1.6-.8-2.3c-.8-.9-1.7-.9-2.2-1C17 4 12 4 12 4s-5 0-8 .2c-.5.1-1.4.1-2.2 1C1.2 5.9 1 7.5 1 7.5S.8 9.4.8 11.3v1.4c0 1.9.2 3.8.2 3.8s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.8.2 7.8.2s5 0 8-.2c.5-.1 1.4-.1 2.2-1 .6-.7.8-2.3.8-2.3s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8zM9.75 15.02V8.48L15.5 11.75z" />
    </svg>
  );
}

/**
 * Common-App-style per-university application view.
 *
 * Renders ONLY the middle content + a small status helper for the parent
 * sidebar. The parent (dashboard-client) owns the overall 3-column layout
 * (icon sidebar, section sidebar, yellow middle, help sidebar).
 *
 * Per-university draft state is persisted to localStorage under
 * "sabaiapply-uni-app-<uniId>". No backend writes yet.
 */

export type UniAppSection =
  | "info"
  | "general"
  | "academics"
  | "other"
  | "review";

export interface UniDraft {
  preferredRound?: string;
  admissionPlan?: string;
  facultyId?: string;
  programId?: string;
  essay?: string;
  submittedAt?: string;
  signatureName?: string;
}

export type UniAppStatus = "completed" | "in_progress" | "not_started";

export interface CommonAppSectionState {
  key: string;
  label: string;
  status: UniAppStatus;
  action: "personal" | "family" | "education" | "testScores" | "documents" | "activities";
}

const DRAFT_KEY_PREFIX = "sabaiapply-uni-app-";

export function draftKey(uniId: string) {
  return `${DRAFT_KEY_PREFIX}${uniId}`;
}

export function useUniDraft(uniId: string) {
  const [draft, setDraft] = useState<UniDraft>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey(uniId));
      if (saved) setDraft(JSON.parse(saved) as UniDraft);
      else setDraft({});
    } catch { setDraft({}); }
  }, [uniId]);

  function save(next: UniDraft) {
    setDraft(next);
    try {
      localStorage.setItem(draftKey(uniId), JSON.stringify(next));
    } catch { /* ignore */ }
  }

  return [draft, save] as const;
}

export type UniOverallStatus = "not_started" | "in_progress" | "completed" | "submitted";

/** Roll draft section statuses up into a single overall status for the uni. */
export function getUniOverallStatus(draft: UniDraft): UniOverallStatus {
  if (draft.submittedAt) return "submitted";
  const s = getUniSectionStatuses(draft);
  const sections: UniAppSection[] = ["general", "academics", "other"];
  const allCompleted = sections.every((k) => s[k] === "completed");
  if (allCompleted) return "completed";
  const anyStarted = sections.some((k) => s[k] !== "not_started");
  return anyStarted ? "in_progress" : "not_started";
}

/** Read the draft for a given university id from localStorage (client-only). */
export function readUniDraft(uniId: string): UniDraft {
  try {
    const raw = localStorage.getItem(draftKey(uniId));
    return raw ? (JSON.parse(raw) as UniDraft) : {};
  } catch {
    return {};
  }
}

export function getUniSectionStatuses(draft: UniDraft): Record<UniAppSection, UniAppStatus> {
  return {
    info: "completed",
    general: draft.preferredRound && draft.admissionPlan
      ? "completed"
      : (draft.preferredRound || draft.admissionPlan ? "in_progress" : "not_started"),
    academics: draft.facultyId && draft.programId
      ? "completed"
      : (draft.facultyId ? "in_progress" : "not_started"),
    other: draft.essay && draft.essay.length > 50
      ? "completed"
      : (draft.essay ? "in_progress" : "not_started"),
    review: "not_started",
  };
}

/* ══════════════════════════════════════════════ */

export interface StudentData {
  email: string;
  profile: StudentProfile | null;
  family: StudentFamily | null;
  education: StudentEducation | null;
  scores: StudentScore[];
  documents: StudentDocument[];
  portfolioItems: PortfolioItem[];
}

interface Props {
  university: University;
  activeSection: UniAppSection;
  setActiveSection: (s: UniAppSection) => void;
  draft: UniDraft;
  onDraftChange: (d: UniDraft) => void;
  commonAppSections: CommonAppSectionState[];
  locale: "en" | "th";
  studentData: StudentData;
  onRemove: () => void;
  onJumpToCommonAppSection: (action: CommonAppSectionState["action"]) => void;
  onSubmitApplication: () => void;
}

export default function UniversityAppView({
  university,
  activeSection,
  setActiveSection,
  draft,
  onDraftChange,
  commonAppSections,
  locale,
  studentData,
  onRemove,
  onJumpToCommonAppSection,
  onSubmitApplication,
}: Props) {
  const sectionStatus = useMemo(() => getUniSectionStatuses(draft), [draft]);

  return (
    <div className="mx-auto max-w-3xl">
      {activeSection === "info" && (
        <UniversityInfoPage university={university} locale={locale} onRemove={onRemove} />
      )}
      {activeSection === "general" && (
        <GeneralPage locale={locale} draft={draft} onChange={onDraftChange} />
      )}
      {activeSection === "academics" && (
        <AcademicsPage university={university} locale={locale} draft={draft} onChange={onDraftChange} />
      )}
      {activeSection === "other" && (
        <OtherPage locale={locale} draft={draft} onChange={onDraftChange} />
      )}
      {activeSection === "review" && (
        <ReviewAndSubmitPage
          university={university}
          locale={locale}
          commonAppSections={commonAppSections}
          sectionStatus={sectionStatus}
          draft={draft}
          onDraftChange={onDraftChange}
          studentData={studentData}
          onJumpToCommonAppSection={onJumpToCommonAppSection}
          onJumpToUniSection={setActiveSection}
          onSubmitApplication={onSubmitApplication}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Status ring — exported so parent sidebar uses the same visual
   ══════════════════════════════════════════════ */

export function UniStatusRing({ status }: { status: UniAppStatus }) {
  if (status === "completed") {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M3 7L5.5 9.5L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (status === "in_progress") return <div className="h-5 w-5 shrink-0 rounded-full border-2 border-[#F4C430] bg-[#FFF3D0]" />;
  return <div className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-[#bbb]" />;
}

/* ══════════════════════════════════════════════
   Middle content pages
   ══════════════════════════════════════════════ */

function UniversityInfoPage({ university, locale, onRemove }: {
  university: University;
  locale: "en" | "th";
  onRemove: () => void;
}) {
  const title = locale === "th" && university.name_th ? university.name_th : university.name;
  const meta = getUniMeta(university.name);
  const [appInfoOpen, setAppInfoOpen] = useState(false);
  const [writingOpen, setWritingOpen] = useState(false);
  const [specificOpen, setSpecificOpen] = useState(false);

  const linkCls = "inline-flex items-center gap-1 text-[15px] font-medium text-[#F4C430] underline underline-offset-2 hover:text-[#e6b82a]";
  const socialLinkCls = "flex h-10 w-10 items-center justify-center rounded-full border border-[#e0e0e0] text-[#666] transition-colors hover:border-[#F4C430] hover:text-[#1a1a1a]";
  const socialDisabledCls = "flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-[#f0f0f0] text-[#ccc]";

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[#888]">
            {locale === "th" ? "สมัครเข้าที่ " : "Apply to "}{title}
          </p>
          <h1 className="mt-0.5 text-[32px] font-bold leading-tight text-[#1a1a1a]">{title}</h1>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#FFF3D0] text-2xl font-bold text-[#1a1a1a]">
          {university.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={university.logo_url} alt="" className="h-full w-full object-contain rounded-xl" />
          ) : (
            <span>{title[0]}</span>
          )}
        </div>
      </div>

      {/* ── Contact block ── */}
      {(meta.admissionsEmail || meta.admissionsPhone || meta.address) && (
        <div className="space-y-0.5 text-[15px] text-[#444]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {meta.admissionsEmail && (
              <a href={`mailto:${meta.admissionsEmail}`} className={linkCls}>
                {meta.admissionsEmail}
              </a>
            )}
            {meta.admissionsEmail && meta.admissionsPhone && <span className="text-[#bbb]">·</span>}
            {meta.admissionsPhone && (
              <span className="flex items-center gap-1.5">
                <span className="text-[#888]">{locale === "th" ? "โทร" : "Phone"}</span>
                <a href={`tel:${meta.admissionsPhone.replace(/\s/g, "")}`} className={linkCls}>
                  {meta.admissionsPhone}
                </a>
              </span>
            )}
          </div>
          {meta.address && <p className="italic text-[#666]">{meta.address}</p>}
        </div>
      )}

      {/* ── Two-column: deadlines + links ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-bold text-[#1a1a1a]">
            {locale === "th" ? "กำหนดเวลารับสมัคร" : "Application deadlines"}
          </h2>
          <p className="text-sm text-[#888]">
            {locale === "th"
              ? "กำลังจะแจ้งให้ทราบเร็วๆ นี้ — ดูที่เว็บไซต์"
              : "To be announced — see website."}
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-[#1a1a1a]">
            {locale === "th" ? "ลิงก์" : "Links"}
          </h2>
          <ul className="ml-5 list-disc space-y-1 text-sm marker:text-[#ccc]">
            {university.website ? (
              <li>
                <a href={university.website} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  {locale === "th" ? "เว็บไซต์มหาวิทยาลัย" : "University website"} <ExternalLink size={12} />
                </a>
              </li>
            ) : (
              <li className="text-[#999]">
                {locale === "th" ? "เว็บไซต์ — ไม่มีข้อมูล" : "Website — not provided"}
              </li>
            )}
            {meta.aboutUrl && (
              <li>
                <a href={meta.aboutUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  {locale === "th" ? "เกี่ยวกับมหาวิทยาลัย" : "About the university"} <ExternalLink size={12} />
                </a>
              </li>
            )}
            {meta.admissionsUrl ? (
              <li>
                <a href={meta.admissionsUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  {locale === "th" ? "สำนักทะเบียน" : "Admissions office"} <ExternalLink size={12} />
                </a>
              </li>
            ) : (
              <li className="text-[#999]">
                {locale === "th" ? "สำนักทะเบียน — ไม่มีข้อมูล" : "Admissions office — not provided"}
              </li>
            )}
            {meta.campusMapUrl && (
              <li>
                <a href={meta.campusMapUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  {locale === "th" ? "แผนที่ภายในมหาวิทยาลัย" : "Campus map"} <ExternalLink size={12} />
                </a>
              </li>
            )}
            {meta.financialAidUrl ? (
              <li>
                <a href={meta.financialAidUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  {locale === "th" ? "ทุนการศึกษา" : "Financial aid"} <ExternalLink size={12} />
                </a>
              </li>
            ) : (
              <li className="text-[#999]">
                {locale === "th" ? "ทุนการศึกษา — ไม่มีข้อมูล" : "Financial aid — not provided"}
              </li>
            )}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {meta.facebookUrl ? (
              <a href={meta.facebookUrl} target="_blank" rel="noopener noreferrer" className={socialLinkCls} title="Facebook" aria-label="Facebook"><Facebook size={16} /></a>
            ) : (
              <span className={socialDisabledCls} title="Facebook — not provided" aria-label="Facebook (not provided)"><Facebook size={16} /></span>
            )}
            {meta.instagramUrl ? (
              <a href={meta.instagramUrl} target="_blank" rel="noopener noreferrer" className={socialLinkCls} title="Instagram" aria-label="Instagram"><Instagram size={16} /></a>
            ) : (
              <span className={socialDisabledCls} title="Instagram — not provided" aria-label="Instagram (not provided)"><Instagram size={16} /></span>
            )}
            {meta.twitterUrl ? (
              <a href={meta.twitterUrl} target="_blank" rel="noopener noreferrer" className={socialLinkCls} title="Twitter" aria-label="Twitter"><Twitter size={16} /></a>
            ) : (
              <span className={socialDisabledCls} title="Twitter — not provided" aria-label="Twitter (not provided)"><Twitter size={16} /></span>
            )}
            {meta.youtubeUrl ? (
              <a href={meta.youtubeUrl} target="_blank" rel="noopener noreferrer" className={socialLinkCls} title="YouTube" aria-label="YouTube"><Youtube size={16} /></a>
            ) : (
              <span className={socialDisabledCls} title="YouTube — not provided" aria-label="YouTube (not provided)"><Youtube size={16} /></span>
            )}
          </div>
        </div>
      </div>

      {/* ── Three collapsible sections ── */}
      <CollapsibleSection
        title={locale === "th" ? "ข้อมูลการสมัคร" : "Application information"}
        open={appInfoOpen}
        onToggle={() => setAppInfoOpen(!appInfoOpen)}
      >
        <div className="space-y-4 pt-3">
          <InfoBlock title={locale === "th" ? "ค่าสมัคร" : "Application Fees"}>
            <ul className="ml-5 list-disc space-y-1 text-sm text-[#444] marker:text-[#ccc]">
              <li>{locale === "th" ? "นักศึกษาต่างชาติ ปี 1 — ไม่มีข้อมูล" : "First Year International Fee — TBD"}</li>
              <li>{locale === "th" ? "นักศึกษาไทย ปี 1 — ไม่มีข้อมูล" : "First Year Domestic Fee — TBD"}</li>
            </ul>
          </InfoBlock>
          <InfoBlock title={locale === "th" ? "นโยบายการสอบมาตรฐาน" : "Standardized test policy"} help>
            <ul className="ml-5 list-disc space-y-1 text-sm text-[#444] marker:text-[#ccc]">
              <li>{locale === "th" ? "ยืดหยุ่น" : "Flexible"}</li>
              <li>{locale === "th" ? "ดูที่เว็บไซต์" : "See website"}</li>
            </ul>
          </InfoBlock>
          <InfoBlock title={locale === "th" ? "ผลคะแนนภาษาอังกฤษที่ยอมรับ" : "Accepted English proficiency tests"}>
            <p className="text-sm text-[#444]">{locale === "th" ? "ดูที่เว็บไซต์" : "See website"}</p>
          </InfoBlock>
          <InfoBlock title={locale === "th" ? "รายวิชาและผลการเรียน" : "Courses & Grades"}>
            <p className="text-sm text-[#444]">{locale === "th" ? "ไม่ได้ใช้" : "Not Used"}</p>
          </InfoBlock>
          <InfoBlock title={locale === "th" ? "หนังสือแนะนำ" : "Recommendations"}>
            <ul className="ml-5 list-disc space-y-1 text-sm text-[#444] marker:text-[#ccc]">
              <li>{locale === "th" ? "รายงานจากโรงเรียน (ตามที่กำหนด)" : "School Report (as required)"}</li>
              <li>{locale === "th" ? "หนังสือแนะนำจากที่ปรึกษา (ตามที่กำหนด)" : "Counselor Recommendation (as required)"}</li>
              <li>{locale === "th" ? "รายงานผลปลายภาค (ตามที่กำหนด)" : "Final Report (as required)"}</li>
            </ul>
          </InfoBlock>
          <InfoBlock title={locale === "th" ? "ข้อมูลเพิ่มเติม" : "Additional information"}>
            <p className="text-sm leading-relaxed text-[#444]">
              {locale === "th"
                ? `${title} พิจารณาใบสมัครตามคุณสมบัติรายบุคคล โปรดอ้างอิงข้อมูลจากเว็บไซต์ของมหาวิทยาลัย`
                : `${title} operates an inclusive admissions policy. Please refer to the university website for authoritative information.`}
            </p>
          </InfoBlock>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={locale === "th" ? "ข้อกำหนดการเขียน" : "Writing requirements"}
        open={writingOpen}
        onToggle={() => setWritingOpen(!writingOpen)}
      >
        <div className="space-y-4 pt-3">
          <InfoBlock title={locale === "th" ? "เรียงความส่วนตัว (Common App)" : "Common App personal essay"}>
            <p className="text-sm text-[#444]">{locale === "th" ? "ไม่มีข้อมูล" : "Not provided"}</p>
          </InfoBlock>
          <InfoBlock title={locale === "th" ? "คำถามเฉพาะของมหาวิทยาลัย" : "College Questions"}>
            <p className="text-sm text-[#444]">{locale === "th" ? "ไม่มีข้อมูล" : "Not provided"}</p>
          </InfoBlock>
          <InfoBlock title={locale === "th" ? "เรียงความเสริม" : "Writing Supplement"}>
            <p className="text-sm text-[#444]">
              {locale === "th"
                ? "มหาวิทยาลัยนี้ยังไม่ได้ระบุข้อกำหนดเรียงความเสริม"
                : "This university does not use a writing supplement for any additional writing requirements."}
            </p>
          </InfoBlock>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={locale === "th" ? "การใช้ข้อมูลเฉพาะ" : "Use of specific information"}
        open={specificOpen}
        onToggle={() => setSpecificOpen(!specificOpen)}
      >
        <p className="pt-3 text-sm leading-relaxed text-[#444]">
          {locale === "th"
            ? "ยังไม่มีข้อมูลจากทางมหาวิทยาลัยในส่วนนี้ หากไม่มีการระบุข้อความ จะไม่แสดงไอคอนหรือลิงก์ \"คำอธิบายด้านวินัยหรือประวัติทางอาญา\" ในหน้าสมัคร"
            : "This area does not have any default text. If no text is provided, no 'Criminal & Disciplinary Explanation' icon or link will be shown on the application pages."}
        </p>
      </CollapsibleSection>

      {/* ── Remove ── */}
      <div className="flex items-center justify-between gap-4 border-t border-[#e8e8e8] pt-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1a1a1a]">
            {locale === "th" ? "ลบออกจากรายการของฉัน" : "Remove from my universities"}
          </h3>
          <p className="mt-0.5 text-xs text-[#888]">
            {locale === "th"
              ? "ข้อมูลใบสมัครที่ยังไม่ได้ส่งจะถูกลบออก"
              : "Any unsubmitted application data will be cleared."}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-sm font-semibold text-[#666] transition-colors hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
        >
          <Trash2 size={14} />
          {locale === "th" ? "ลบ" : "Remove"}
        </button>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, open, onToggle, children }: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[#e8e8e8] pt-3">
      <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <h2 className="text-base font-bold text-[#1a1a1a]">{title}</h2>
        {open
          ? <ChevronUp size={18} className="text-[#666]" />
          : <ChevronDown size={18} className="text-[#666]" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function InfoBlock({ title, help, children }: { title: string; help?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a]">
        {title}
        {help && <HelpCircle size={13} className="text-[#999]" />}
      </h3>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════ */

function GeneralPage({ locale, draft, onChange }: {
  locale: "en" | "th";
  draft: UniDraft;
  onChange: (d: UniDraft) => void;
}) {
  const rounds = ["1", "2", "4"];
  const plans = ["regular", "international", "quota"];
  const planLabel = (p: string) => {
    if (locale === "th") {
      return p === "regular" ? "รอบปกติ" : p === "international" ? "หลักสูตรนานาชาติ" : "โควตา";
    }
    return p === "regular" ? "Regular" : p === "international" ? "International" : "Quota";
  };
  const roundLabel = (r: string) => {
    if (locale === "th") {
      return r === "1" ? "รอบ 1 (Portfolio)" : r === "2" ? "รอบ 2 (Quota)" : "รอบ 4 (Admission)";
    }
    return r === "1" ? "Round 1 (Portfolio)" : r === "2" ? "Round 2 (Quota)" : "Round 4 (Admission)";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">
        {locale === "th" ? "ข้อมูลทั่วไป" : "General"}
      </h1>

      <div className="rounded-xl border border-[#e8e8e8] bg-white p-6 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
            {locale === "th" ? "รอบที่ต้องการสมัคร" : "Preferred admission round"} <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {rounds.map((r) => (
              <PillButton
                key={r}
                active={draft.preferredRound === r}
                onClick={() => onChange({ ...draft, preferredRound: r })}
                label={roundLabel(r)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
            {locale === "th" ? "แผนการเข้าศึกษา" : "Preferred admission plan"} <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {plans.map((p) => (
              <PillButton
                key={p}
                active={draft.admissionPlan === p}
                onClick={() => onChange({ ...draft, admissionPlan: p })}
                label={planLabel(p)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PillButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-[#F4C430] bg-[#FFF3D0] text-[#1a1a1a]"
          : "border-[#e0e0e0] text-[#666] hover:border-[#ccc]"
      }`}
    >
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════ */

function AcademicsPage({ university, locale, draft, onChange }: {
  university: University;
  locale: "en" | "th";
  draft: UniDraft;
  onChange: (d: UniDraft) => void;
}) {
  const faculties = university.faculties ?? [];
  const selectedFaculty = faculties.find((f) => f.id === draft.facultyId);
  const programs = selectedFaculty?.programs ?? [];

  const facLabel = (f: { name: string; name_th: string }) =>
    locale === "th" && f.name_th ? f.name_th : f.name;
  const progLabel = (p: { name: string; name_th: string }) =>
    locale === "th" && p.name_th ? p.name_th : p.name;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">
        {locale === "th" ? "สาขาวิชา" : "Academics"}
      </h1>

      {faculties.length === 0 ? (
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <div className="flex items-start gap-3 text-sm text-[#666]">
            <Info size={18} className="mt-0.5 shrink-0 text-[#999]" />
            <p>
              {locale === "th"
                ? "มหาวิทยาลัยนี้ยังไม่มีข้อมูลคณะและหลักสูตรในระบบ"
                : "This university doesn't have any faculty or program data in the system yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-[#e8e8e8] bg-white p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
              {locale === "th" ? "เลือกคณะ" : "Select faculty"} <span className="text-red-500">*</span>
            </label>
            <select
              value={draft.facultyId ?? ""}
              onChange={(e) => onChange({ ...draft, facultyId: e.target.value || undefined, programId: undefined })}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
            >
              <option value="">{locale === "th" ? "— เลือก —" : "— Select —"}</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{facLabel(f)}</option>
              ))}
            </select>
          </div>

          {selectedFaculty && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                {locale === "th" ? "เลือกหลักสูตร" : "Select program"} <span className="text-red-500">*</span>
              </label>
              {programs.length === 0 ? (
                <p className="text-sm text-[#888]">
                  {locale === "th" ? "คณะนี้ยังไม่มีหลักสูตร" : "No programs listed for this faculty yet."}
                </p>
              ) : (
                <select
                  value={draft.programId ?? ""}
                  onChange={(e) => onChange({ ...draft, programId: e.target.value || undefined })}
                  className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
                >
                  <option value="">{locale === "th" ? "— เลือก —" : "— Select —"}</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{progLabel(p)}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════ */

function OtherPage({ locale, draft, onChange }: {
  locale: "en" | "th";
  draft: UniDraft;
  onChange: (d: UniDraft) => void;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">
        {locale === "th" ? "ข้อมูลเพิ่มเติม" : "Other requirements"}
      </h1>

      <div className="rounded-xl border border-[#e8e8e8] bg-white p-6 space-y-3">
        <label className="block text-sm font-medium text-[#1a1a1a]">
          {locale === "th"
            ? "เหตุผลที่ต้องการเข้าศึกษาที่มหาวิทยาลัยนี้"
            : "Why do you want to study at this university?"} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={draft.essay ?? ""}
          onChange={(e) => onChange({ ...draft, essay: e.target.value })}
          rows={10}
          placeholder={locale === "th"
            ? "อย่างน้อย 50 ตัวอักษร..."
            : "At least 50 characters..."}
          className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
        />
        <p className="text-xs text-[#999]">
          {(draft.essay ?? "").length} {locale === "th" ? "ตัวอักษร" : "characters"}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */

function ReviewAndSubmitPage({
  university,
  locale,
  commonAppSections,
  sectionStatus,
  draft,
  onDraftChange,
  studentData,
  onJumpToCommonAppSection,
  onJumpToUniSection,
  onSubmitApplication,
}: {
  university: University;
  locale: "en" | "th";
  commonAppSections: CommonAppSectionState[];
  sectionStatus: Record<UniAppSection, UniAppStatus>;
  draft: UniDraft;
  onDraftChange: (d: UniDraft) => void;
  studentData: StudentData;
  onJumpToCommonAppSection: (action: CommonAppSectionState["action"]) => void;
  onJumpToUniSection: (s: UniAppSection) => void;
  onSubmitApplication: () => void;
}) {
  const title = locale === "th" && university.name_th ? university.name_th : university.name;
  const [showModal, setShowModal] = useState(false);

  const incompleteCommon = commonAppSections.filter((s) => s.status !== "completed");
  const incompleteUni: Array<{ key: UniAppSection; label: string }> = [];
  if (sectionStatus.general !== "completed") {
    incompleteUni.push({ key: "general", label: locale === "th" ? "ข้อมูลทั่วไป (เฉพาะมหาวิทยาลัย)" : "General (university-specific)" });
  }
  if (sectionStatus.academics !== "completed") {
    incompleteUni.push({ key: "academics", label: locale === "th" ? "สาขาวิชา" : "Academics" });
  }
  if (sectionStatus.other !== "completed") {
    incompleteUni.push({ key: "other", label: locale === "th" ? "ข้อมูลเพิ่มเติม" : "Other requirements" });
  }

  const allComplete = incompleteCommon.length === 0 && incompleteUni.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-base text-[#888]">
          {locale === "th" ? "สมัครเข้าที่ " : "Apply to "}{title}
        </p>
        <h1 className="mt-1 text-4xl font-bold leading-tight text-[#1a1a1a]">
          {locale === "th" ? "ตรวจและส่งใบสมัคร" : "Review and submit application"}
        </h1>
        <div className="mt-3 inline-flex items-center gap-2.5 text-base">
          <UniStatusRing status={allComplete ? "completed" : "in_progress"} />
          <span className="text-[#666]">
            {allComplete
              ? (locale === "th" ? "พร้อมส่ง" : "Ready to submit")
              : (locale === "th" ? "กำลังดำเนินการ" : "In progress")}
          </span>
        </div>
      </div>

      {!allComplete && (
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-8">
          <p className="mb-5 text-[15px] leading-relaxed text-[#444]">
            {locale === "th"
              ? "ในการเริ่มกระบวนการส่ง คุณต้องดำเนินการต่อไปนี้ให้ครบถ้วน:"
              : "In order to begin the submission process, you must complete the following items:"}
          </p>
          <ul className="ml-5 list-disc space-y-3 marker:text-[#ccc]">
            {incompleteCommon.map((s) => (
              <li key={s.key}>
                <button
                  onClick={() => onJumpToCommonAppSection(s.action)}
                  className="text-[15px] font-medium text-[#F4C430] underline underline-offset-2 hover:text-[#e6b82a]"
                >
                  {s.label}
                </button>
              </li>
            ))}
            {incompleteUni.map((s) => (
              <li key={s.key}>
                <button
                  onClick={() => onJumpToUniSection(s.key)}
                  className="text-[15px] font-medium text-[#F4C430] underline underline-offset-2 hover:text-[#e6b82a]"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-[#999]">
            {locale === "th"
              ? "เมื่อทุกส่วนครบถ้วนแล้ว ปุ่มตรวจและส่งใบสมัครจะปรากฎบนหน้านี้"
              : "Once all required components are completed, you will see the option to Review and Submit your application on this screen."}
          </p>
        </div>
      )}

      {allComplete && (
        <div className="space-y-6">
          <p className="text-[15px] leading-relaxed text-[#444]">
            {locale === "th"
              ? `คุณพร้อมที่จะตรวจและส่งใบสมัครไปยัง ${title} แล้ว! กระบวนการส่งประกอบด้วยขั้นตอนต่อไปนี้:`
              : `You are ready to review and submit your application to ${title}! The submission process includes the following steps:`}
          </p>

          <StepBlock
            title={locale === "th" ? "ขั้นตอนที่ 1: ตรวจสอบใบสมัคร" : "Step 1: Review your application"}
          >
            <p>{locale === "th" ? "ดูตัวอย่าง PDF ของใบสมัคร" : "Review a PDF preview of your application."}</p>
            {draft.essay && (
              <p>{locale === "th" ? `${title} ต้องการเรียงความส่วนตัวของคุณ` : `${title} requires your personal essay.`}</p>
            )}
          </StepBlock>

          <StepBlock
            title={locale === "th" ? "ขั้นตอนที่ 2: ชำระค่าสมัคร (ถ้ามี)" : "Step 2: Pay the application fee (if applicable)"}
          >
            <p>
              {locale === "th"
                ? "หากมหาวิทยาลัยเรียกเก็บค่าสมัครและคุณไม่มีการยกเว้นค่าสมัคร คุณจะต้องชำระค่าสมัครก่อนการส่งใบสมัคร"
                : "If this university charges a fee and you do not have a fee waiver, you will need to pay the application fee before submitting your application."}
            </p>
            <p>
              {locale === "th"
                ? "ขั้นตอนการชำระเงินจะนำคุณไปยังบริการชำระเงินภายนอกที่ปลอดภัย เมื่อชำระเงินเสร็จแล้ว คุณต้องกลับมาที่ SabaiApply เพื่อดำเนินการส่งใบสมัคร"
                : "Application payment will take you to a secure, third-party payment service. Once you have paid the application fee, you must return to SabaiApply to complete your submission."}
            </p>
          </StepBlock>

          <div className="flex items-start gap-3 rounded-xl border border-[#F4C430] bg-[#FFF9EC] p-4">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[#b88a12]" />
            <p className="text-[15px] leading-relaxed text-[#8a6d17]">
              {locale === "th"
                ? "ใบสมัครของคุณจะยังไม่ถูกส่งจนกว่าคุณจะเสร็จสิ้นขั้นตอนลายเซ็นและการยืนยัน"
                : "Your application will not be submitted until you complete your signature and affirmations."}
            </p>
          </div>

          <StepBlock
            title={locale === "th" ? "ขั้นตอนที่ 3: ส่งใบสมัคร" : "Step 3: Submit your application"}
          >
            <p>
              {locale === "th"
                ? "ลงลายเซ็นและยืนยันเพื่อส่งใบสมัคร"
                : "Complete your signature and affirmations to submit your application."}
            </p>
          </StepBlock>

          <div className="pt-2">
            <button
              onClick={() => setShowModal(true)}
              className="rounded-full bg-[#F4C430] px-8 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]"
            >
              {locale === "th" ? "ตรวจและส่งใบสมัคร" : "Review and Submit"}
            </button>
          </div>

          {showModal && (
            <ReviewSubmitModal
              university={university}
              locale={locale}
              draft={draft}
              studentData={studentData}
              onDraftChange={onDraftChange}
              onClose={() => setShowModal(false)}
              onSubmit={() => {
                setShowModal(false);
                onSubmitApplication();
              }}
            />
          )}
          {/* NOTE: onSubmit receives { applicationId, submittedAt } — kept as a
              void-closure here because the parent (dashboard-client) only needs
              to flip local status; future work can thread the applicationId
              through if we need to reference it in the UI. */}
        </div>
      )}
    </div>
  );
}

function StepBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-[15px] font-bold text-[#1a1a1a]">{title}</h3>
      <div className="space-y-2 text-[15px] leading-relaxed text-[#444]">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Review & Submit modal (Final Review → Payment → Signature)
   ══════════════════════════════════════════════ */

type ReviewStage = "review" | "payment" | "signature";

function ReviewSubmitModal({
  university,
  locale,
  draft,
  studentData,
  onDraftChange,
  onClose,
  onSubmit,
}: {
  university: University;
  locale: "en" | "th";
  draft: UniDraft;
  studentData: StudentData;
  onDraftChange: (d: UniDraft) => void;
  onClose: () => void;
  onSubmit: (info: { applicationId: string; submittedAt: string }) => void;
}) {
  const [stage, setStage] = useState<ReviewStage>("review");
  const [signatureName, setSignatureName] = useState(draft.signatureName ?? "");
  const [affirmed, setAffirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // When the student clicks Continue and the stage advances,
  // scroll the modal body back to the top so they see the new step.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [stage]);

  const stages: { key: ReviewStage; label: string }[] = [
    { key: "review", label: locale === "th" ? "ตรวจสอบขั้นสุดท้าย" : "Final Review" },
    { key: "payment", label: locale === "th" ? "ชำระเงิน" : "Payment" },
    { key: "signature", label: locale === "th" ? "ลายเซ็นและส่ง" : "Signature & Submission" },
  ];
  const stageIdx = stages.findIndex((s) => s.key === stage);

  function advance() {
    if (stage === "review") setStage("payment");
    else if (stage === "payment") setStage("signature");
  }

  async function handleSubmit() {
    if (!affirmed || !signatureName.trim()) return;
    if (!draft.programId) {
      setSubmitError(locale === "th"
        ? "กรุณาเลือกหลักสูตรในส่วน 'สาขาวิชา'"
        : "Please select a program in the Academics section before submitting.");
      return;
    }
    if (!draft.preferredRound) {
      setSubmitError(locale === "th"
        ? "กรุณาเลือกรอบการสมัครในส่วน 'ข้อมูลทั่วไป'"
        : "Please select an admission round in the General section before submitting.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    const result = await submitApplication({
      programId: draft.programId,
      round: draft.preferredRound as "1" | "2" | "4",
      essay: draft.essay,
      signatureName: signatureName.trim(),
      customAnswers: {
        admission_plan: draft.admissionPlan ?? null,
        faculty_id: draft.facultyId ?? null,
      },
    });

    if (result.error || !result.applicationId || !result.submittedAt) {
      setSubmitError(result.error ?? (locale === "th" ? "ส่งไม่สำเร็จ" : "Submission failed"));
      setSubmitting(false);
      return;
    }

    onDraftChange({
      ...draft,
      signatureName: signatureName.trim(),
      submittedAt: result.submittedAt,
    });
    onSubmit({ applicationId: result.applicationId, submittedAt: result.submittedAt });
  }

  const continueDisabled =
    stage === "signature" && (!affirmed || !signatureName.trim() || submitting);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center border-b border-[#e8e8e8] px-6 py-4">
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0e0e0] text-[#666] transition-colors hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
          aria-label={locale === "th" ? "ปิด" : "Close"}
        >
          <X size={18} />
        </button>
        <h2 className="flex-1 text-center text-xl font-bold text-[#1a1a1a]">
          {locale === "th" ? "ตรวจและส่งใบสมัคร" : "Review and submit"}
        </h2>
        <div className="w-10" />
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-6 border-b border-[#e8e8e8] px-6 py-5">
        {stages.map((s, i) => {
          const active = i === stageIdx;
          const done = i < stageIdx;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                active
                  ? "bg-[#F4C430] text-[#1a1a1a]"
                  : done
                    ? "bg-[#FFF3D0] text-[#b88a12]"
                    : "bg-[#f0f0f0] text-[#999]"
              }`}>
                {active && <Pencil size={14} />}
                {done && <Check size={14} />}
                {!active && !done && (i + 1)}
              </div>
              <span className={`text-[15px] font-medium ${active ? "text-[#1a1a1a]" : "text-[#888]"}`}>
                {s.label}
              </span>
              {i < stages.length - 1 && <div className="h-px w-16 bg-[#e0e0e0]" />}
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto bg-[#FFF9EC] px-6 py-8">
        <div className="mx-auto max-w-4xl">
          {stage === "review" && (
            <FinalReviewStage university={university} locale={locale} draft={draft} studentData={studentData} />
          )}
          {stage === "payment" && (
            <PaymentStage university={university} locale={locale} />
          )}
          {stage === "signature" && (
            <SignatureStage
              locale={locale}
              signatureName={signatureName}
              setSignatureName={setSignatureName}
              affirmed={affirmed}
              setAffirmed={setAffirmed}
              submitError={submitError}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e8] px-6 py-4">
        <button
          onClick={onClose}
          className="rounded-full border border-[#e0e0e0] bg-white px-6 py-2.5 text-[15px] font-semibold text-[#666] transition-colors hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
        >
          {locale === "th" ? "ยกเลิก" : "Cancel"}
        </button>
        <button
          onClick={stage === "signature" ? handleSubmit : advance}
          disabled={continueDisabled}
          className="rounded-full bg-[#F4C430] px-6 py-2.5 text-[15px] font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50"
        >
          {submitting
            ? (locale === "th" ? "กำลังส่ง..." : "Submitting...")
            : stage === "signature"
              ? (locale === "th" ? "ส่งใบสมัคร" : "Submit application")
              : (locale === "th" ? "ถัดไป" : "Continue")}
        </button>
      </div>
    </div>
  );
}

/* ── Stage 1: Final Review ── */

function FinalReviewStage({ university, locale, draft, studentData }: {
  university: University;
  locale: "en" | "th";
  draft: UniDraft;
  studentData: StudentData;
}) {
  const title = locale === "th" && university.name_th ? university.name_th : university.name;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-[15px] leading-relaxed text-blue-900">
        <Info size={18} className="mt-0.5 shrink-0 text-blue-500" />
        <p>
          {locale === "th"
            ? `ตรวจสอบใบสมัครของคุณก่อนส่ง หากจำเป็นต้องแก้ไข กดปุ่มยกเลิกแล้วกลับไปแก้ไขส่วนที่เกี่ยวข้อง`
            : `Please review your complete application before continuing. If you need to make changes, click Cancel and return to the relevant section.`}
        </p>
      </div>

      {/* PDF-like preview */}
      <div className="rounded-xl border border-[#e0e0e0] bg-white shadow-sm">
        <ApplicationPreview
          university={university}
          title={title}
          locale={locale}
          draft={draft}
          studentData={studentData}
        />
      </div>
    </div>
  );
}

function ApplicationPreview({ university, title, locale, draft, studentData }: {
  university: University;
  title: string;
  locale: "en" | "th";
  draft: UniDraft;
  studentData: StudentData;
}) {
  const { profile, family, education, scores, documents, portfolioItems, email } = studentData;
  const fullName = profile ? `${profile.last_name ?? ""}, ${profile.first_name ?? ""}`.replace(/^,\s*|,\s*$/g, "") : "—";
  const selectedFaculty = university.faculties.find((f) => f.id === draft.facultyId);
  const selectedProgram = selectedFaculty?.programs.find((p) => p.id === draft.programId);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between border-b-2 border-[#2E7CD6] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#FFF3D0] text-xl font-bold text-[#1a1a1a]">
            {university.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={university.logo_url} alt="" className="h-full w-full object-contain rounded-lg" />
            ) : (
              <span>{title[0]}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">SabaiApply</p>
            <p className="text-xs text-[#888]">{locale === "th" ? "ใบสมัครมหาวิทยาลัย" : "University Application"}</p>
          </div>
        </div>
        <div className="text-right text-xs text-[#666]">
          <p className="font-semibold text-[#1a1a1a]">{fullName}</p>
          <p>{title}</p>
          <p>{today}</p>
        </div>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <SubSection title={locale === "th" ? "ข้อมูลส่วนตัว" : "Personal information"}>
          <Row label={locale === "th" ? "ชื่อ" : "Name"} value={fullName || "—"} />
          <Row label={locale === "th" ? "ชื่อ (ไทย)" : "Name (Thai)"} value={profile?.first_name_th && profile?.last_name_th ? `${profile.last_name_th}, ${profile.first_name_th}` : "—"} />
          <Row label={locale === "th" ? "วันเกิด" : "Birthdate"} value={profile?.dob ?? "—"} />
          <Row label={locale === "th" ? "สัญชาติ" : "Nationality"} value={profile?.nationality ?? "—"} />
          <Row label={locale === "th" ? "เพศ" : "Gender"} value={profile?.gender ?? "—"} />
          <Row label={locale === "th" ? "ประเภทบัตร" : "ID type"} value={profile?.id_type ?? "—"} />
          <Row label={locale === "th" ? "เลขบัตร" : "ID number"} value={profile?.id_number ?? "—"} />
        </SubSection>
        <SubSection title={locale === "th" ? "ข้อมูลติดต่อ" : "Contact details"}>
          <Row label="Email" value={email} />
          <Row label={locale === "th" ? "โทรศัพท์" : "Phone"} value={profile?.phone ?? "—"} />
          <Row label="LINE ID" value={profile?.line_id ?? "—"} />
          <Row label={locale === "th" ? "ที่อยู่" : "Address"} value={formatAddress(profile?.address)} multiline />
        </SubSection>
      </Section>

      {/* Family */}
      <Section title={locale === "th" ? "ครอบครัว" : "Family"}>
        {family ? (
          <>
            <SubSection title={locale === "th" ? "บิดา" : "Father"}>
              <Row label={locale === "th" ? "ชื่อ" : "Name"} value={joinName(family.father_prefix, family.father_first_name, family.father_last_name)} />
              <Row label={locale === "th" ? "อาชีพ" : "Occupation"} value={family.father_occupation ?? "—"} />
              <Row label={locale === "th" ? "การศึกษา" : "Education"} value={family.father_education_level ?? "—"} />
              <Row label={locale === "th" ? "โทรศัพท์" : "Phone"} value={family.father_phone ?? "—"} />
            </SubSection>
            <SubSection title={locale === "th" ? "มารดา" : "Mother"}>
              <Row label={locale === "th" ? "ชื่อ" : "Name"} value={joinName(family.mother_prefix, family.mother_first_name, family.mother_last_name)} />
              <Row label={locale === "th" ? "อาชีพ" : "Occupation"} value={family.mother_occupation ?? "—"} />
              <Row label={locale === "th" ? "การศึกษา" : "Education"} value={family.mother_education_level ?? "—"} />
              <Row label={locale === "th" ? "โทรศัพท์" : "Phone"} value={family.mother_phone ?? "—"} />
            </SubSection>
            <SubSection title={locale === "th" ? "ครัวเรือน" : "Household"}>
              <Row label={locale === "th" ? "รายได้ครัวเรือน (บาท/เดือน)" : "Household income (THB/month)"} value={family.household_income ?? "—"} />
              <Row label={locale === "th" ? "จำนวนพี่น้อง" : "Number of siblings"} value={family.number_of_siblings?.toString() ?? "—"} />
            </SubSection>
          </>
        ) : (
          <p className="text-sm text-[#888]">{locale === "th" ? "ไม่มีข้อมูล" : "No data reported."}</p>
        )}
      </Section>

      {/* Education */}
      <Section title={locale === "th" ? "การศึกษา" : "Education"}>
        {education ? (
          <SubSection title={locale === "th" ? "โรงเรียนปัจจุบันหรือล่าสุด" : "Current or most recent secondary school"}>
            <Row label={locale === "th" ? "ชื่อโรงเรียน" : "School name"} value={education.school_name ?? "—"} />
            <Row label={locale === "th" ? "จังหวัด" : "Province"} value={education.school_province ?? "—"} />
            <Row label={locale === "th" ? "ประเภทหลักสูตร" : "Curriculum type"} value={education.curriculum_type ?? "—"} />
            <Row label={locale === "th" ? "แผนการเรียน" : "Study plan"} value={education.study_plan ?? "—"} />
            <Row label="GPA" value={education.gpa?.toString() ?? "—"} />
            <Row label={locale === "th" ? "ปีที่จบการศึกษา" : "Graduation year"} value={education.graduation_year?.toString() ?? "—"} />
            <Row label={locale === "th" ? "ระดับชั้นปัจจุบัน" : "Current grade level"} value={education.current_grade_level ?? "—"} />
          </SubSection>
        ) : (
          <p className="text-sm text-[#888]">{locale === "th" ? "ไม่มีข้อมูลการศึกษา" : "No education data reported."}</p>
        )}
      </Section>

      {/* Testing */}
      <Section title={locale === "th" ? "ผลการสอบ" : "Testing"}>
        {scores.length > 0 ? (
          <ul className="space-y-1 text-sm text-[#1a1a1a]">
            {scores.map((s) => (
              <li key={s.id}>
                <strong>{s.score_type}</strong>{s.sub_type ? ` — ${s.sub_type}` : ""}: {s.score_value}
                {s.test_date ? ` (${s.test_date})` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#888]">{locale === "th" ? "ไม่มีผลการสอบ" : "There are no test scores to report."}</p>
        )}
      </Section>

      {/* Documents */}
      <Section title={locale === "th" ? "เอกสาร" : "Documents"}>
        {documents.length > 0 ? (
          <ul className="space-y-1 text-sm text-[#1a1a1a]">
            {documents.map((d) => (
              <li key={d.id}><strong>{d.doc_type}</strong>: {d.file_name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#888]">{locale === "th" ? "ไม่มีเอกสารที่แนบ" : "No documents attached."}</p>
        )}
      </Section>

      {/* Activities */}
      <Section title={locale === "th" ? "กิจกรรม" : "Activities"}>
        {portfolioItems.length > 0 ? (
          <ul className="space-y-1 text-sm text-[#1a1a1a]">
            {portfolioItems.map((p) => (
              <li key={p.id}><strong>{p.title}</strong>{p.description ? ` — ${p.description}` : ""}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#888]">{locale === "th" ? "ไม่มีกิจกรรม" : "There are no activities to report."}</p>
        )}
      </Section>

      {/* University-specific */}
      <Section title={locale === "th" ? `คำถามของ ${title}` : `${title} questions`}>
        <SubSection title={locale === "th" ? "ข้อมูลทั่วไป" : "General"}>
          <Row label={locale === "th" ? "รอบที่ต้องการ" : "Preferred admission round"} value={draft.preferredRound ? `Round ${draft.preferredRound}` : "—"} />
          <Row label={locale === "th" ? "แผนการเข้าศึกษา" : "Preferred admission plan"} value={draft.admissionPlan ?? "—"} />
        </SubSection>
        <SubSection title={locale === "th" ? "สาขาวิชา" : "Academics"}>
          <Row label={locale === "th" ? "คณะ" : "Faculty"} value={selectedFaculty ? (locale === "th" && selectedFaculty.name_th ? selectedFaculty.name_th : selectedFaculty.name) : "—"} />
          <Row label={locale === "th" ? "หลักสูตร" : "Program"} value={selectedProgram ? (locale === "th" && selectedProgram.name_th ? selectedProgram.name_th : selectedProgram.name) : "—"} />
        </SubSection>
        {draft.essay && (
          <SubSection title={locale === "th" ? "เรียงความ: เหตุผลที่ต้องการเข้าศึกษาที่มหาวิทยาลัยนี้" : "Essay: Why do you want to study at this university?"}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1a1a1a]">{draft.essay}</p>
          </SubSection>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 border-t-2 border-[#2E7CD6] pt-3">
      <h2 className="mb-3 text-xl font-bold text-[#2E7CD6]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-base font-bold text-[#2E7CD6]">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={`flex ${multiline ? "items-start" : "items-center"} gap-6 py-0.5 text-sm`}>
      <div className="w-52 shrink-0 font-semibold text-[#1a1a1a]">{label}</div>
      <div className={`text-[#444] ${multiline ? "whitespace-pre-line" : ""}`}>{value || "—"}</div>
    </div>
  );
}

function joinName(prefix?: string | null, first?: string | null, last?: string | null): string {
  const parts = [prefix, first, last].filter(Boolean);
  return parts.length ? parts.join(" ") : "—";
}

function formatAddress(addr: string | null | undefined): string {
  if (!addr) return "—";
  try {
    const parsed = JSON.parse(addr);
    return [parsed.addressLine, parsed.city, parsed.province, parsed.zipcode, parsed.country].filter(Boolean).join(", ") || "—";
  } catch {
    return addr;
  }
}

/* ── Stage 2: Payment ── */

function PaymentStage({ university, locale }: { university: University; locale: "en" | "th" }) {
  const title = locale === "th" && university.name_th ? university.name_th : university.name;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-[#e0e0e0] bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-[#1a1a1a]">
          {locale === "th" ? "ค่าสมัคร" : "Application fee"}
        </h2>
        <p className="mt-2 text-sm text-[#888]">{title}</p>

        <div className="my-8">
          <p className="text-5xl font-bold text-[#1a1a1a]">฿0</p>
          <p className="mt-2 text-sm text-[#888]">
            {locale === "th" ? "ยังไม่มีการเก็บค่าสมัคร (MVP)" : "No fee configured yet (MVP)"}
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-[#F4C430]/40 bg-[#FFF9EC] p-4 text-left text-sm leading-relaxed text-[#8a6d17]">
          {locale === "th"
            ? "ในระหว่างช่วงเบต้า ยังไม่มีการผูกกับบริการชำระเงิน กดถัดไปเพื่อข้ามขั้นตอนนี้"
            : "During the beta, payment is not yet wired to a provider. Click Continue to skip this step."}
        </div>
      </div>
    </div>
  );
}

/* ── Stage 3: Signature & Submission ── */

function SignatureStage({
  locale,
  signatureName,
  setSignatureName,
  affirmed,
  setAffirmed,
  submitError,
}: {
  locale: "en" | "th";
  signatureName: string;
  setSignatureName: (v: string) => void;
  affirmed: boolean;
  setAffirmed: (v: boolean) => void;
  submitError: string | null;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[15px] leading-relaxed text-red-700">
          {submitError}
        </div>
      )}
      <div className="rounded-xl border border-[#e0e0e0] bg-white p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">
            {locale === "th" ? "ลายเซ็น" : "Signature"}
          </h2>
          <p className="mt-1 text-sm text-[#666]">
            {locale === "th"
              ? "พิมพ์ชื่อ-นามสกุลของคุณเพื่อเซ็นใบสมัครอิเล็กทรอนิกส์"
              : "Type your full legal name to electronically sign this application."}
          </p>
          <input
            type="text"
            value={signatureName}
            onChange={(e) => setSignatureName(e.target.value)}
            placeholder={locale === "th" ? "ชื่อ นามสกุล" : "First name  Last name"}
            className="mt-4 w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-lg font-serif italic outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
          />
        </div>

        <div className="border-t border-[#e8e8e8] pt-6">
          <h2 className="text-xl font-bold text-[#1a1a1a]">
            {locale === "th" ? "การยืนยัน" : "Affirmations"}
          </h2>
          <label className="mt-3 flex items-start gap-3 text-[15px] leading-relaxed text-[#444]">
            <input
              type="checkbox"
              checked={affirmed}
              onChange={(e) => setAffirmed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#F4C430]"
            />
            <span>
              {locale === "th"
                ? "ข้าพเจ้ายืนยันว่าข้อมูลในใบสมัครนี้ถูกต้อง ครบถ้วน และเป็นความจริงตามที่ทราบ ข้าพเจ้าเข้าใจและยอมรับข้อตกลงและเงื่อนไขของ SabaiApply รวมทั้งนโยบายการยื่นใบสมัครของมหาวิทยาลัย"
                : "I affirm that the information in this application is accurate, complete, and true to the best of my knowledge. I have read and agree to the SabaiApply terms and the university's application policies."}
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[#F4C430] bg-[#FFF9EC] p-4">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[#b88a12]" />
        <p className="text-[15px] leading-relaxed text-[#8a6d17]">
          {locale === "th"
            ? "เมื่อส่งใบสมัครแล้ว คุณจะไม่สามารถแก้ไขได้อีก โปรดตรวจสอบให้แน่ใจ"
            : "Once you submit, the application can no longer be edited. Please make sure everything is correct."}
        </p>
      </div>
    </div>
  );
}
