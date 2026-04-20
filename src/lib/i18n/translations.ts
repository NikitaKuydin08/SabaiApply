// Unified i18n translations

import admin from './locales/admin.json';
import app from './locales/app.json';
import dash from './locales/dash.json';
import faq from './locales/faq.json';
import form from './locales/form.json';
import help from './locales/help.json';
import login from './locales/login.json';
import nav from './locales/nav.json';
import pw from './locales/pw.json';
import search from './locales/search.json';
import settings from './locales/settings.json';
import signup from './locales/signup.json';
import uni from './locales/uni.json';

export type Locale = "en" | "th";

const translations = {
  ...admin,
  ...app,
  ...dash,
  ...faq,
  ...form,
  ...help,
  ...login,
  ...nav,
  ...pw,
  ...search,
  ...settings,
  ...signup,
  ...uni,
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}

// For template strings like "Delete {{name}}?"
export function tReplace(key: TranslationKey, locale: Locale, replacements: Record<string, string>): string {
  let result = t(key, locale);
  for (const [k, v] of Object.entries(replacements)) {
    result = result.replace(`{{${k}}}`, v);
  }
  return result;
}
