"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Locale, TranslationKey } from "./translations";
import { t as translate } from "./translations";

interface StudentLocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const StudentLocaleContext = createContext<StudentLocaleContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function StudentLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("sabaiapply-student-locale") as Locale | null;
    if (saved === "en" || saved === "th") {
      setLocale(saved);
    }
  }, []);

  function handleSetLocale(newLocale: Locale) {
    setLocale(newLocale);
    localStorage.setItem("sabaiapply-student-locale", newLocale);
  }

  function t(key: TranslationKey): string {
    return translate(key, locale);
  }

  return (
    <StudentLocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </StudentLocaleContext.Provider>
  );
}

export function useStudentLocale() {
  return useContext(StudentLocaleContext);
}
