"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Locale } from "./i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "th",
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("th");

  // Persist language choice
  useEffect(() => {
    const saved = localStorage.getItem("sabaiapply-locale") as Locale | null;
    if (saved === "th" || saved === "en") {
      setLocale(saved);
    }
  }, []);

  function handleSetLocale(newLocale: Locale) {
    setLocale(newLocale);
    localStorage.setItem("sabaiapply-locale", newLocale);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
