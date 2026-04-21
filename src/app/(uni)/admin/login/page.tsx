"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/password-input";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import { LanguageToggle } from "@/components/language-toggle";

export default function AdminLoginPage() {
  return (
    <LocaleProvider defaultLocale="en" storageKey="sabaiapply-admin-locale">
      <AdminLoginContent />
    </LocaleProvider>
  );
}

function AdminLoginContent() {
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError(t("login_failed"));
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role === "student") {
      await supabase.auth.signOut();
      setError(t("no_admin_access"));
      setLoading(false);
      return;
    }

    if (profile.role === "super_admin") {
      router.push("/super-admin/dashboard");
    } else {
      router.push("/admin/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white p-8">
        <div className="mb-4 flex justify-end">
          <LanguageToggle />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">SabaiApply</h1>
          <p className="text-base text-[#666] mt-2">{t("faculty_admin_portal")}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-base font-medium text-[#1a1a1a]">
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@university.ac.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-base font-medium text-[#1a1a1a]">
              {t("password")}
            </label>
            <PasswordInput
              id="password"
              placeholder={t("enter_password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
          >
            {loading ? t("signing_in") : t("sign_in")}
          </button>
        </form>

        <p className="mt-5 text-center text-base">
          <Link href="/admin/forgot-password" className="text-[#F4C430] font-medium hover:underline">
            {t("forgot_password")}
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-[#999]">
          {t("admin_access_invite_only")}
        </p>
      </div>
    </div>
  );
}
