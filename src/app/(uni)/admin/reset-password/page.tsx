"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/password-input";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import { LanguageToggle } from "@/components/language-toggle";

export default function ResetPasswordPage() {
  return (
    <LocaleProvider defaultLocale="en" storageKey="sabaiapply-admin-locale">
      <ResetPasswordContent />
    </LocaleProvider>
  );
}

function ResetPasswordContent() {
  const { t } = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError(t("passwords_not_match"));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("password_too_short"));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white p-8">
        <div className="mb-4 flex justify-end">
          <LanguageToggle />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("set_new_password")}</h1>
          <p className="text-base text-[#666] mt-2">{t("set_new_password_desc")}</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-base font-medium text-[#1a1a1a]">
              {t("new_password")}
            </label>
            <PasswordInput
              id="password"
              placeholder={t("min_6_chars")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-base font-medium text-[#1a1a1a]">
              {t("confirm_new_password")}
            </label>
            <PasswordInput
              id="confirmPassword"
              placeholder={t("confirm_new_password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
          >
            {loading ? t("updating") : t("update_password")}
          </button>
        </form>
      </div>
    </div>
  );
}
