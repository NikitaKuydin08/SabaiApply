"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import { Suspense } from "react";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, setLocale, t } = useLocale();
  const isFromSignup = searchParams.get("confirmed") === "pending";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF9EC] px-4 py-8">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white px-5 py-7 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:px-10 md:py-10">
        {/* Language toggle */}
        <div className="mb-4 flex justify-end md:mb-6">
          <LangToggle locale={locale} setLocale={setLocale} />
        </div>

        {isFromSignup && showBanner && (
          <div className="mb-5 flex items-center justify-between rounded-lg bg-[#DBEAFE] px-4 py-3">
            <p className="text-sm font-medium text-[#1E40AF]">
              Confirmation email sent. Please check your inbox.
            </p>
            <button onClick={() => setShowBanner(false)} className="ml-3 shrink-0 p-0.5 text-[#1E40AF]/60 hover:text-[#1E40AF]">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mb-6 text-center md:mb-8">
          <Link href="/" className="inline-flex items-center text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
            <img src="/logo-lotus.png" alt="" className="mr-1.5 h-8 w-8 object-contain md:mr-2 md:h-10 md:w-10" />
            Sabai<span className="text-[#F4C430]">Apply</span>
          </Link>
          <h1 className="mt-3 text-xl font-bold text-[#1a1a1a] md:mt-4 md:text-3xl">{t("login.title")}</h1>
          <p className="mt-1.5 text-sm text-[#666] md:mt-2 md:text-base">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 md:px-5 md:py-4 md:text-base">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1a1a1a] md:mb-2 md:text-base">
              {t("login.email")} <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-[15px] outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 md:py-3.5 md:text-base"
              placeholder={t("login.emailPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1a1a1a] md:mb-2 md:text-base">
              {t("login.password")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 pr-11 text-[15px] outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 md:py-3.5 md:pr-12 md:text-base"
                placeholder={t("login.passwordPlaceholder")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F4C430] px-5 py-3.5 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50 md:py-4 md:text-lg"
          >
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#666] md:mt-8 md:text-base">
          {t("login.noAccount")}{" "}
          <Link href="/signup" className="font-medium text-[#1a1a1a] hover:underline">
            {t("login.signUpLink")}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FFF9EC]">
        <p className="text-[#666]">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
