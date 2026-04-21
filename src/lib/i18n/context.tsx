"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Locale, TranslationKey } from "./translations";
import { t as translate } from "./translations";

export interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "th",
  setLocale: () => {},
  t: (key) => key as string,
});

export function LocaleProvider({ 
  children,
  defaultLocale = "th",
  storageKey = "sabaiapply-locale"
}: { 
  children: React.ReactNode;
  defaultLocale?: Locale;
  storageKey?: string;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as Locale | null;
    if (saved === "en" || saved === "th") {
      setLocale(saved);
    }
  }, [storageKey]);

  function handleSetLocale(newLocale: Locale) {
    setLocale(newLocale);
    localStorage.setItem(storageKey, newLocale);
  }

  function t(key: TranslationKey): string {
    return translate(key, locale);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
