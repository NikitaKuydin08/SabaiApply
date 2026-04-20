"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  Info,
  Trash2,
} from "lucide-react";
import type { University } from "./dashboard-client";
import { getUniMeta } from "./uni-meta";

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

interface Props {
  university: University;
  activeSection: UniAppSection;
  setActiveSection: (s: UniAppSection) => void;
  draft: UniDraft;
  onDraftChange: (d: UniDraft) => void;
  commonAppSections: CommonAppSectionState[];
  locale: "en" | "th";
  onRemove: () => void;
  onJumpToCommonAppSection: (action: CommonAppSectionState["action"]) => void;
}

export default function UniversityAppView({
  university,
  activeSection,
  setActiveSection,
  draft,
  onDraftChange,
  commonAppSections,
  locale,
  onRemove,
  onJumpToCommonAppSection,
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
          onJumpToCommonAppSection={onJumpToCommonAppSection}
          onJumpToUniSection={setActiveSection}
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
  onJumpToCommonAppSection,
  onJumpToUniSection,
}: {
  university: University;
  locale: "en" | "th";
  commonAppSections: CommonAppSectionState[];
  sectionStatus: Record<UniAppSection, UniAppStatus>;
  onJumpToCommonAppSection: (action: CommonAppSectionState["action"]) => void;
  onJumpToUniSection: (s: UniAppSection) => void;
}) {
  const title = locale === "th" && university.name_th ? university.name_th : university.name;

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
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-base leading-relaxed text-green-700">
          {locale === "th"
            ? "ทุกส่วนของใบสมัครเสร็จสมบูรณ์ ฟังก์ชันการตรวจและส่งใบสมัครกำลังจะเปิดใช้งานเร็วๆ นี้"
            : "All required components are complete. The review-and-submit flow will be enabled shortly."}
        </div>
      )}
    </div>
  );
}
