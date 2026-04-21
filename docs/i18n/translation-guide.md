# SabaiApply Internationalization (i18n) Guide

This guide explains how translations are managed within the SabaiApply application, for both the admin and the student portals.

## 📂 File Structure

The internationalization layer lives primarily within `src/lib/i18n/`. It is structured into multiple, modular JSON files to ensure maintainability:

```text
src/lib/i18n/
├── context.tsx         # The React Context Provider that passes the `locale` and `t()` down.
├── translations.ts     # The central registry where all JSON files are imported and typed.
└── locales/            # Individual JSON files grouping translations by domain/feature.
    ├── admin.json
    ├── app.json
    ├── dash.json
    ├── faq.json
    ├── form.json
    └── ...
```

## 🛠 Adding New Translations

### 1. Add to an existing JSON file (or create a new one)

Locate the appropriate domain inside the `locales` folder. Each key should follow a dot-notation convention (`[domain].[feature]`) and must define strings for all supported languages (`en` and `th`).

```json
// src/lib/i18n/locales/feature.json
{
  "feature.title": {
    "en": "My Feature",
    "th": "ฟีเจอร์ของฉัน"
  },
  "feature.description": {
    "en": "Detailed description here.",
    "th": "คำอธิบายโดยละเอียดที่นี่"
  }
}
```

### 2. Register new JSON files

If you've created a entirely new file (e.g., `feature.json`), you must register it in `translations.ts` to include it in the global autocomplete definitions:

```typescript
// src/lib/i18n/translations.ts
import feature from './locales/feature.json';

const translations = {
  // ... existing files
  ...feature,
} as const;
```

---

## 👩‍💻 Using Translations in React Components

In any client or server component within the tree of `LocaleProvider`, simply access the `t()` function. You can retrieve it by destructuring `useLocale()`.

```tsx
'use client';
import { useLocale } from "@/lib/i18n/context";

export function WelcomeBanner() {
  const { t, locale } = useLocale();

  return (
    <div>
      {/* Typescript will auto-complete and type-check the key here! */}
      <h1>{t("dash.welcome")}</h1> 
      <p>Current language: {locale}</p>
    </div>
  );
}
```

If you are inside a context that doesn't have `useLocale` (e.g. passing down to a localized pure function), pass the `t()` function as a prop:

```tsx
function ActionButton({ t }: { t: TFn }) {
  return <button>{t("form.submit")}</button>;
}
```

---

## 📊 Using Translations in Data Models or Configurations

Often, you'll have files separating data and logic (like `faq.ts`, navigation links, predefined categories) which should not contain hardcoded English or Thai text. 

Instead of hardcoding, provide type-safe translation keys inside the data models, and use the `t()` method when actually rendering or processing those values within React components.

**Data Model Definition:**
```typescript
// src/app/.../data/categories.ts
import type { TranslationKey } from '@/lib/i18n/translations';

export interface Category {
  id: string;
  labelKey: TranslationKey; // Type-safe constraint!
}

export const myCategories: Category[] = [
  { id: "personal", labelKey: "app.personal" },
  { id: "education", labelKey: "app.education" }
];
```

**React Implementaton:**
```tsx
// src/app/.../Dashboard.tsx
import { myCategories } from '../data/categories';
import { useLocale } from '@/lib/i18n/context';

export function CategoryList() {
  const { t } = useLocale();

  return (
    <ul>
      {myCategories.map(cat => (
        <li key={cat.id}>{t(cat.labelKey)}</li>
      ))}
    </ul>
  );
}
```

### Note on Dynamic Text (Search, API parsing)
If you need to perform actions like searching through text (such as an FAQ lookup), filter over the *rendered translation output*, not the static configurations:

```typescript
const searchResults = faqEntries.filter(entry => {
    // Only search using user's active locale
    const questionText = t(entry.questionKey).toLowerCase(); 
    return questionText.includes(searchQuery);
});
```
