import type { TranslationKey } from '../i18n/translations';

export type FAQCategory = "account" | "universities" | "applying" | "documents" | "general";

export interface FAQEntry {
  id: string;
  category: FAQCategory;
  questionKey: TranslationKey;
  answerKey: TranslationKey;
}

export const faqCategories: { key: FAQCategory; labelKey: TranslationKey }[] = [
  { key: "account", labelKey: "faq.category.account" },
  { key: "universities", labelKey: "faq.category.universities" },
  { key: "applying", labelKey: "faq.category.applying" },
  { key: "documents", labelKey: "faq.category.documents" },
  { key: "general", labelKey: "faq.category.general" },
];

export const faqEntries: FAQEntry[] = [
  // ── Account ──
  { id: "acc-1", category: "account", questionKey: "faq.q.acc-1", answerKey: "faq.a.acc-1" },
  { id: "acc-2", category: "account", questionKey: "faq.q.acc-2", answerKey: "faq.a.acc-2" },
  { id: "acc-3", category: "account", questionKey: "faq.q.acc-3", answerKey: "faq.a.acc-3" },
  { id: "acc-4", category: "account", questionKey: "faq.q.acc-4", answerKey: "faq.a.acc-4" },

  // ── Universities ──
  { id: "uni-1", category: "universities", questionKey: "faq.q.uni-1", answerKey: "faq.a.uni-1" },
  { id: "uni-2", category: "universities", questionKey: "faq.q.uni-2", answerKey: "faq.a.uni-2" },
  { id: "uni-3", category: "universities", questionKey: "faq.q.uni-3", answerKey: "faq.a.uni-3" },
  { id: "uni-4", category: "universities", questionKey: "faq.q.uni-4", answerKey: "faq.a.uni-4" },

  // ── Applying ──
  { id: "app-1", category: "applying", questionKey: "faq.q.app-1", answerKey: "faq.a.app-1" },
  { id: "app-2", category: "applying", questionKey: "faq.q.app-2", answerKey: "faq.a.app-2" },
  { id: "app-3", category: "applying", questionKey: "faq.q.app-3", answerKey: "faq.a.app-3" },
  { id: "app-4", category: "applying", questionKey: "faq.q.app-4", answerKey: "faq.a.app-4" },

  // ── Documents ──
  { id: "doc-1", category: "documents", questionKey: "faq.q.doc-1", answerKey: "faq.a.doc-1" },
  { id: "doc-2", category: "documents", questionKey: "faq.q.doc-2", answerKey: "faq.a.doc-2" },
  { id: "doc-3", category: "documents", questionKey: "faq.q.doc-3", answerKey: "faq.a.doc-3" },

  // ── General ──
  { id: "gen-1", category: "general", questionKey: "faq.q.gen-1", answerKey: "faq.a.gen-1" },
  { id: "gen-2", category: "general", questionKey: "faq.q.gen-2", answerKey: "faq.a.gen-2" },
  { id: "gen-3", category: "general", questionKey: "faq.q.gen-3", answerKey: "faq.a.gen-3" },
  { id: "gen-4", category: "general", questionKey: "faq.q.gen-4", answerKey: "faq.a.gen-4" },
];
