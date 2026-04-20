"use client";

import { useLocale } from "@/lib/i18n/context";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center rounded-lg border border-[#e0e0e0] overflow-hidden">
      <button
        onClick={() => setLocale("th")}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
          locale === "th"
            ? "bg-[#F4C430] text-[#1a1a1a]"
            : "bg-white text-[#666] hover:bg-[#fafafa]"
        }`}
      >
        TH
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
          locale === "en"
            ? "bg-[#F4C430] text-[#1a1a1a]"
            : "bg-white text-[#666] hover:bg-[#fafafa]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
