"use client";

import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { LanguageToggle } from "@/components/language-toggle";

export default function LandingClient() {
  return (
    <LocaleProvider defaultLocale="en" storageKey="sabaiapply-landing-locale">
      <LandingContent />
    </LocaleProvider>
  );
}

function LandingContent() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-[#FFF9EC]">
      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-4 py-3 md:px-8 md:py-5">
        <div className="flex items-center">
          <img src="/logo-lotus.png" alt="" className="mr-1.5 h-7 w-7 object-contain md:mr-2 md:h-9 md:w-9" />
          <span className="text-lg font-bold tracking-tight text-[#1a1a1a] md:text-2xl">
            Sabai<span className="text-[#F4C430]">Apply</span>
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-5">
          <a
            href="/admin/login"
            className="hidden text-sm text-[#999] transition-colors hover:text-[#666] sm:inline"
          >
            {t("landing.nav.adminPortal")}
          </a>
          <a
            href="/login"
            className="text-sm font-medium text-[#1a1a1a] hover:underline"
          >
            {t("landing.nav.login")}
          </a>
          <a
            href="/signup"
            className="rounded-lg bg-[#F4C430] px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] md:px-5 md:py-2.5"
          >
            {t("landing.nav.signup")}
          </a>
          <LanguageToggle />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[440px] overflow-hidden py-14 md:h-[85vh] md:min-h-[500px] md:py-0">
        <img
          src="/hero-students.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-90 blur-[5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/30 md:from-black/65 md:via-black/45 md:to-black/25" />

        <div className="relative z-10 flex h-full items-center px-5 md:px-8">
          <div className="mx-auto w-full max-w-[1100px]">
            <div className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm md:mb-5 md:px-4 md:py-1.5 md:text-sm">
              {t("landing.hero.badge")}
            </div>
            <h1 className="mb-4 max-w-[600px] text-3xl font-extrabold leading-[1.1] tracking-tight text-white md:mb-5 md:text-5xl">
              {t("landing.hero.headlineA")}<br />
              <span className="text-[#F4C430]">{t("landing.hero.headlineB")}</span>
            </h1>
            <p className="mb-6 max-w-[460px] text-base leading-relaxed text-white/80 md:mb-8 md:text-lg">
              {t("landing.hero.subtitle")}
            </p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a
                href="/signup"
                className="rounded-lg bg-[#F4C430] px-6 py-3 text-center text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] md:px-7 md:py-3.5"
              >
                {t("landing.hero.ctaStart")}
              </a>
              <a
                href="/login"
                className="rounded-lg border-2 border-white px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-white/10 md:px-7 md:py-3.5"
              >
                {t("landing.hero.ctaLogin")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white px-5 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-[#999]">
            {t("landing.how.eyebrow")}
          </p>
          <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-[#1a1a1a] md:mb-14 md:text-3xl">
            {t("landing.how.title")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <StepCard number="1" titleKey="landing.how.step1.title" descKey="landing.how.step1.desc" />
            <StepCard number="2" titleKey="landing.how.step2.title" descKey="landing.how.step2.desc" />
            <StepCard number="3" titleKey="landing.how.step3.title" descKey="landing.how.step3.desc" />
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="px-5 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-[#999]">
            {t("landing.who.eyebrow")}
          </p>
          <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-[#1a1a1a] md:mb-14 md:text-3xl">
            {t("landing.who.title")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <AudienceCard emoji="&#x1F1F9;&#x1F1ED;" titleKey="landing.who.thai.title" descKey="landing.who.thai.desc" />
            <AudienceCard emoji="&#x1F30D;" titleKey="landing.who.intl.title" descKey="landing.who.intl.desc" />
            <AudienceCard emoji="&#x1F3EB;" titleKey="landing.who.uni.title" descKey="landing.who.uni.desc" />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-[900px] px-5 pb-12 md:px-8 md:pb-20">
        <div className="rounded-2xl bg-[#E8A317] px-6 py-10 text-center md:px-12 md:py-14">
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-[#1a1a1a] md:text-3xl">
            {t("landing.cta.headlineA")}<br />
            <span className="text-white">{t("landing.cta.headlineB")}</span>
          </h2>
          <p className="mb-6 text-sm text-[#4a3a08] md:mb-8 md:text-base">{t("landing.cta.subtitle")}</p>
          <a
            href="/signup"
            className="inline-block rounded-lg bg-[#1a1a1a] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#333] md:px-8 md:py-3.5"
          >
            {t("landing.cta.button")}
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e8e8e8] bg-white px-5 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo-lotus.png" alt="" className="h-8 w-8 object-contain md:h-10 md:w-10" />
              <span className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">
                Sabai<span className="text-[#F4C430]">Apply</span>
              </span>
            </div>

            <div className="flex items-center gap-5 md:gap-6">
              <button className="text-sm text-[#888] transition-colors hover:text-[#444]">
                {t("landing.footer.privacy")}
              </button>
              <button className="text-sm text-[#888] transition-colors hover:text-[#444]">
                {t("landing.footer.terms")}
              </button>
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#333]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {t("landing.footer.chat")}
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-[#bbb] md:text-sm">
            {t("landing.footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, titleKey, descKey }: { number: string; titleKey: TranslationKey; descKey: TranslationKey }) {
  const { t } = useLocale();
  return (
    <div className="w-full flex-1 rounded-2xl border border-[#e8e8e8] bg-[#FFF9EC] p-6 text-left md:max-w-[260px] md:p-8">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#F4C430] text-sm font-extrabold text-[#1a1a1a] md:mb-4 md:h-10 md:w-10">
        {number}
      </div>
      <h3 className="mb-1.5 text-base font-bold text-[#1a1a1a] md:mb-2">{t(titleKey)}</h3>
      <p className="text-sm leading-relaxed text-[#666]">{t(descKey)}</p>
    </div>
  );
}

function AudienceCard({ emoji, titleKey, descKey }: { emoji: string; titleKey: TranslationKey; descKey: TranslationKey }) {
  const { t } = useLocale();
  return (
    <div className="w-full flex-1 rounded-2xl border border-[#e8e8e8] bg-white p-5 text-left shadow-sm md:max-w-[260px] md:p-7">
      <div className="mb-2.5 text-2xl md:mb-3 md:text-3xl" dangerouslySetInnerHTML={{ __html: emoji }} />
      <h3 className="mb-1.5 text-base font-bold text-[#1a1a1a]">{t(titleKey)}</h3>
      <p className="text-sm leading-relaxed text-[#777]">{t(descKey)}</p>
    </div>
  );
}
