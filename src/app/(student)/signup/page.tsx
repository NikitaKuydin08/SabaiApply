"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailExists, setEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { locale, setLocale, t } = useLocale();

  const passwordRules = useMemo(() => [
    { label: t("pw.length"), test: (p: string) => p.length >= 10 && p.length <= 32 },
    { label: t("pw.uppercase"), test: (p: string) => /[A-Z]/.test(p) },
    { label: t("pw.lowercase"), test: (p: string) => /[a-z]/.test(p) },
    { label: t("pw.number"), test: (p: string) => /\d/.test(p) },
    { label: t("pw.special"), test: (p: string) => /[^A-Za-z0-9]/.test(p) },
    { label: t("pw.noSpaces"), test: (p: string) => !/\s/.test(p) },
  ], [t]);

  const allRulesPass = useMemo(() => passwordRules.every((r) => r.test(password)), [password, passwordRules]);
  const passwordsMatch = password === confirmPassword;
  const emailsMatch = email === confirmEmail;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!emailsMatch) {
      setError(t("signup.errorEmailsNoMatch"));
      return;
    }

    if (!allRulesPass) {
      setError(t("signup.errorPasswordNotMet"));
      return;
    }

    if (!passwordsMatch) {
      setError(t("signup.errorPasswordsNoMatch"));
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "student" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If user already exists, Supabase returns empty identities
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError(t("signup.errorEmailExists"));
      setEmailExists(true);
      setLoading(false);
      return;
    }

    window.location.href = `/check-email?email=${encodeURIComponent(email)}`;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF9EC] px-4 py-8 md:py-10">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white px-5 py-7 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:px-10 md:py-10">
        {/* Language toggle */}
        <div className="mb-4 flex justify-end md:mb-6">
          <LangToggle locale={locale} setLocale={setLocale} />
        </div>

        <div className="mb-6 text-center md:mb-8">
          <Link href="/" className="inline-flex items-center text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
            <img src="/logo-lotus.png" alt="" className="mr-1.5 h-8 w-8 object-contain md:mr-2 md:h-10 md:w-10" />
            Sabai<span className="text-[#F4C430]">Apply</span>
          </Link>
          <h1 className="mt-3 text-xl font-bold text-[#1a1a1a] md:mt-4 md:text-3xl">{t("signup.title")}</h1>
          <p className="mt-1.5 text-sm text-[#666] md:mt-2 md:text-base">{t("signup.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 md:px-5 md:py-4 md:text-base">
              {error}
              {emailExists && (
                <Link href="/login" className="ml-1 font-semibold underline hover:text-red-800">
                  {t("signup.goToLogin")}
                </Link>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1a1a1a] md:mb-2 md:text-base">
              {t("signup.email")} <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-[15px] outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 md:py-3.5 md:text-base"
              placeholder={t("signup.emailPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="confirmEmail" className="mb-1.5 block text-sm font-medium text-[#1a1a1a] md:mb-2 md:text-base">
              {t("signup.confirmEmail")} <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmEmail"
              type="email"
              required
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-[15px] outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 md:py-3.5 md:text-base"
              placeholder={t("signup.retypePlaceholder")}
            />
            {confirmEmail && !emailsMatch && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 md:mt-2 md:text-sm">
                <span>✕</span> {t("signup.emailsMustMatch")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1a1a1a] md:mb-2 md:text-base">
              {t("signup.password")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 pr-11 text-[15px] outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 md:py-3.5 md:pr-12 md:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-2.5 space-y-1 md:mt-3 md:space-y-1.5">
              {passwordRules.map((rule) => {
                const passes = password ? rule.test(password) : false;
                return (
                  <p
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs md:text-sm ${
                      !password ? "text-[#999]" : passes ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    <span>{!password ? "○" : passes ? "✓" : "✕"}</span>
                    {rule.label}
                  </p>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[#1a1a1a] md:mb-2 md:text-base">
              {t("signup.confirmPassword")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 pr-11 text-[15px] outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 md:py-3.5 md:pr-12 md:text-base"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666]"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 md:mt-2 md:text-sm">
                <span>✕</span> {t("signup.passwordsMustMatch")}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !allRulesPass || !passwordsMatch || !emailsMatch}
            className="w-full rounded-lg bg-[#F4C430] px-5 py-3.5 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50 md:py-4 md:text-lg"
          >
            {loading ? t("signup.submitting") : t("signup.submit")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#666] md:mt-8 md:text-base">
          {t("signup.hasAccount")}{" "}
          <Link href="/login" className="font-medium text-[#1a1a1a] hover:underline">
            {t("signup.loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}

function LangToggle({ locale, setLocale }: { locale: string; setLocale: (l: "en" | "th") => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-[#e0e0e0] bg-[#fafafa] p-px">
      <button
        onClick={() => setLocale("en")}
        className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
          locale === "en" ? "bg-[#F4C430] text-[#1a1a1a]" : "text-[#666] hover:text-[#1a1a1a]"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("th")}
        className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
          locale === "th" ? "bg-[#F4C430] text-[#1a1a1a]" : "text-[#666] hover:text-[#1a1a1a]"
        }`}
      >
        TH
      </button>
    </div>
  );
}
