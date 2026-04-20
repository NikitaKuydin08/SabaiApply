"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PortfolioItem, PortfolioItemType } from "@/types/database";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import SectionPanel from "./section-panel";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { tReplace } from "@/lib/i18n/translations";

interface Props {
  items: PortfolioItem[];
  studentId: string;
  onClose: () => void;
  inline?: boolean;
  onSaved?: () => void;
}

const ITEM_TYPES: PortfolioItemType[] = [
  "project",
  "activity",
  "competition",
  "camp",
  "course",
  "award",
  "other",
];

const COMPETITION_LEVELS = ["School", "Regional", "National", "International"] as const;

const pillCls = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
    active
      ? "border-[#F4C430] bg-[#FFF3D0] text-[#1a1a1a]"
      : "border-[#e0e0e0] text-[#666] hover:border-[#ccc]"
  }`;

export default function ActivitiesSection({ items, studentId, onClose, inline, onSaved }: Props) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [localItems, setLocalItems] = useState<PortfolioItem[]>(items);
  useEffect(() => { setLocalItems(items); }, [items]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New item form state
  const [newType, setNewType] = useState<PortfolioItemType>("project");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newOrganizer, setNewOrganizer] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newCompLevel, setNewCompLevel] = useState("");
  const [newResult, setNewResult] = useState("");

  function resetForm() {
    setNewType("project");
    setNewTitle("");
    setNewDescription("");
    setNewOrganizer("");
    setNewStartDate("");
    setNewEndDate("");
    setNewCompLevel("");
    setNewResult("");
    setShowAddForm(false);
    setError(null);
  }

  async function handleAdd() {
    if (!newTitle) {
      setError(tReplace("form.validation.required", locale, { field: t("form.title") }));
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = createClient();

    // We need a portfolio_id — get or create a default portfolio
    let portfolioId: string;
    const { data: existingPortfolio } = await supabase
      .from("student_portfolios")
      .select("id")
      .eq("student_id", studentId)
      .eq("is_snapshot", false)
      .limit(1)
      .single();

    if (existingPortfolio) {
      portfolioId = existingPortfolio.id;
    } else {
      const { data: newPortfolio, error: pErr } = await supabase
        .from("student_portfolios")
        .insert({ student_id: studentId, title: "My Portfolio", source: "sabaiapply" })
        .select()
        .single();
      if (pErr || !newPortfolio) {
        setError(t("form.validation.portfolioFail"));
        setSaving(false);
        return;
      }
      portfolioId = newPortfolio.id;
    }

    const insertData = {
      student_id: studentId,
      portfolio_id: portfolioId,
      item_type: newType,
      title: newTitle,
      description: newDescription || null,
      organizer: newOrganizer || null,
      start_date: newStartDate || null,
      end_date: newEndDate || null,
      competition_level: newType === "competition" ? newCompLevel || null : null,
      result: newType === "competition" ? newResult || null : null,
      sort_order: localItems.length,
    };

    const { data, error: err } = await supabase
      .from("portfolio_items")
      .insert(insertData)
      .select()
      .single();

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    setLocalItems((prev) => [...prev, data as PortfolioItem]);
    resetForm();
    setSaving(false);
    router.refresh();
  }

  async function handleDelete(itemId: string) {
    setDeleting(itemId);

    const supabase = createClient();
    const { error: err } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", itemId);

    if (err) {
      setError(err.message);
      setDeleting(null);
      return;
    }

    setLocalItems((prev) => prev.filter((i) => i.id !== itemId));
    setDeleting(null);
    router.refresh();
  }

  const inputCls = "w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20";
  const labelCls = "mb-1.5 block text-sm font-medium text-[#1a1a1a]";

  const ITEM_TYPE_MAP: Record<string, TranslationKey> = {
    "project": "form.item.project",
    "activity": "form.item.activity",
    "competition": "form.item.competition",
    "camp": "form.item.camp",
    "course": "form.item.course",
    "award": "form.item.award",
    "other": "form.item.other",
  };

  const COMP_LEVEL_MAP: Record<string, TranslationKey> = {
    "School": "form.level.school",
    "Regional": "form.level.regional",
    "National": "form.level.national",
    "International": "form.level.international",
  };

  // Group items by type
  const grouped = ITEM_TYPES.map((type) => ({
    value: type,
    label: t(ITEM_TYPE_MAP[type] || type as any),
    items: localItems.filter((i) => i.item_type === type),
  })).filter((g) => g.items.length > 0);

  const formContent = (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Empty state */}
      {localItems.length === 0 && !showAddForm && (
        <div className="rounded-lg border border-dashed border-[#e0e0e0] px-6 py-8 text-center">
          <p className="text-sm text-[#888]">{t("form.noActivities")}</p>
          <p className="mt-1 text-xs text-[#bbb]">{t("form.addActivityNote")}</p>
        </div>
      )}

      {/* Grouped items */}
      {grouped.map((group) => (
        <div key={group.value}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#999]">{group.label}</h3>
          <div className="space-y-2">
            {group.items.map((item) => (
              <div key={item.id} className="rounded-lg border border-[#e0e0e0] bg-white">
                <div
                  className="flex cursor-pointer items-center justify-between px-4 py-3"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">{item.title}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-[#888]">
                      {item.organizer && <span>{item.organizer}</span>}
                      {item.start_date && <span>{item.start_date}</span>}
                      {item.competition_level && (
                        <span className="rounded bg-[#F4C430]/20 px-1.5 py-0.5 text-xs font-medium text-[#1a1a1a]">
                          {t(COMP_LEVEL_MAP[item.competition_level] || item.competition_level as any)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      disabled={deleting === item.id}
                      className="rounded-lg p-1.5 text-[#ccc] transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronDown size={16} className={`text-[#ccc] transition-transform ${expandedId === item.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
                {expandedId === item.id && (
                  <div className="border-t border-[#f0f0f0] px-4 py-3">
                    {item.description && <p className="text-sm text-[#666]">{item.description}</p>}
                    {item.result && <p className="mt-1 text-sm text-[#888]">{t("form.resultAward")}: {item.result}</p>}
                    {item.end_date && <p className="mt-1 text-xs text-[#999]">{t("form.endDate")}: {item.end_date}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add form */}
      {showAddForm ? (
        <div className="rounded-lg border border-[#F4C430]/40 bg-[#FFFBF0] p-4">
          <h3 className="mb-4 text-sm font-semibold text-[#1a1a1a]">{t("form.addNewItem")}</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t("form.type")} <span className="text-red-500">*</span></label>
              <div className="flex gap-2 flex-wrap">
                {ITEM_TYPES.map((t_val) => (
                  <button key={t_val} type="button" onClick={() => setNewType(t_val)} className={pillCls(newType === t_val)}>
                    {t(ITEM_TYPE_MAP[t_val] || t_val as any)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>{t("form.title")} <span className="text-red-500">*</span></label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={t("form.ph.title")} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>{t("form.description")}</label>
              <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} placeholder={t("form.ph.description")} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>{t("form.organizer")}</label>
              <input type="text" value={newOrganizer} onChange={(e) => setNewOrganizer(e.target.value)} placeholder={t("form.ph.organizer")} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t("form.startDate")}</label>
                <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t("form.endDate")}</label>
                <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} className={inputCls} />
              </div>
            </div>

            {newType === "competition" && (
              <>
                <div>
                  <label className={labelCls}>{t("form.compLevel")}</label>
                  <div className="flex gap-2 flex-wrap">
                    {COMPETITION_LEVELS.map((l) => (
                      <button key={l} type="button" onClick={() => setNewCompLevel(l)} className={pillCls(newCompLevel === l)}>
                        {t(COMP_LEVEL_MAP[l] || l as any)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t("form.resultAward")}</label>
                  <input type="text" value={newResult} onChange={(e) => setNewResult(e.target.value)} placeholder={t("form.ph.resultAward")} className={inputCls} />
                </div>
              </>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="rounded-lg bg-[#F4C430] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50"
              >
                {saving ? t("form.saving") : t("form.addScore")}
              </button>
              <button
                onClick={resetForm}
                className="rounded-lg border border-[#e0e0e0] px-5 py-2.5 text-sm font-medium text-[#666] transition-colors hover:bg-[#f5f5f5]"
              >
                {t("form.cancel")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e0e0e0] px-4 py-3 text-sm font-medium text-[#666] transition-colors hover:border-[#F4C430] hover:text-[#1a1a1a]"
        >
          <Plus size={16} />
          {t("form.addActivity")}
        </button>
      )}
    </div>
  );

  if (inline) return (
    <div>
      {formContent}
      {onSaved && (
        <div className="mt-6 flex justify-end border-t border-[#f0f0f0] pt-5">
          <button
            onClick={onSaved}
            className="rounded-lg bg-[#F4C430] px-6 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]"
          >
            Finish
          </button>
        </div>
      )}
    </div>
  );

  return (
    <SectionPanel title={t("form.activities")} onClose={onClose}>
      {formContent}
    </SectionPanel>
  );
}
