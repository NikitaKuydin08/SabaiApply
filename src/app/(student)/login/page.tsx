"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useStudentLocale } from "../i18n/context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { locale, setLocale, t } = useStudentLocale();

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
    <div className="flex min-h-screen items-center justify-center bg-[#FFF9EC] px-4">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white px-10 py-10 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        {/* Language toggle */}
        <div className="mb-6 flex justify-end">
          <LangToggle locale={locale} setLocale={setLocale} />
        </div>

        <div className="mb-10 -my-10 text-center">
          <Link href="/" className="inline-flex items-center text-4xl font-bold tracking-tight text-[#1a1a1a]">
            <img src="/logo-lotus.png" alt="" className="h-[4em] w-auto -mx-18 -my-5" />
            Sabai<span className="text-[#F4C430]">Apply</span>
          </Link>
          <h1 className="-mt-7 text-3xl font-bold text-[#1a1a1a]">{t("login.title")}</h1>
          <p className="mt-2 text-base text-[#666]">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-5 py-4 text-base text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-base font-medium text-[#1a1a1a] mb-2">
              {t("login.email")} <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
              placeholder={t("login.emailPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-medium text-[#1a1a1a] mb-2">
              {t("login.password")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 pr-12 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
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
            className="w-full rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
          >
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <p className="mt-8 text-center text-base text-[#666]">
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
