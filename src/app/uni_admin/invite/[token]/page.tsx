"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Invite } from "@/types/database";
import { PasswordInput } from "@/components/password-input";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import { LanguageToggle } from "@/components/language-toggle";
import { tReplace } from "@/lib/i18n/translations";

export default function AcceptInvitePage() {
  return (
    <LocaleProvider defaultLocale="en" storageKey="sabaiapply-admin-locale">
      <AcceptInviteContent />
    </LocaleProvider>
  );
}

function AcceptInviteContent() {
  const { t, locale } = useLocale();
  const params = useParams();
  const token = params.token as string;

  const [invite, setInvite] = useState<Invite | null>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invalidReason, setInvalidReason] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = createClient();

      await supabase.auth.signOut();

      const { data, error: fetchError } = await supabase
        .from("invites")
        .select("*")
        .eq("token", token)
        .single();

      if (fetchError || !data) {
        setInvalidReason(t("invite_invalid"));
        setLoading(false);
        return;
      }

      if (data.accepted_at) {
        setInvalidReason(t("invite_already_used"));
        setLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setInvalidReason(t("invite_expired"));
        setLoading(false);
        return;
      }

      setInvite(data);
      setLoading(false);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (password !== confirmPassword) {
      setError(t("passwords_not_match"));
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError(t("password_too_short"));
      setSubmitting(false);
      return;
    }

    if (!invite) return;

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invite.email,
      password,
      options: {
        data: {
          role: invite.role,
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    if (authData.user) {
      let universityId: string | null = invite.university_id ?? null;

      if (!universityId && invite.faculty_id) {
        const { data: faculty } = await supabase
          .from("faculties")
          .select("university_id")
          .eq("id", invite.faculty_id)
          .single();
        if (faculty) universityId = faculty.university_id;
      }

      await supabase
        .from("profiles")
        .update({ full_name: fullName, university_id: universityId })
        .eq("id", authData.user.id);

      if (invite.faculty_id) {
        await supabase.from("faculty_admins").insert({
          user_id: authData.user.id,
          faculty_id: invite.faculty_id,
          is_primary: false,
        });
      }

      await supabase
        .from("invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);
    }

    await supabase.auth.signOut();
    setSuccess(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <p className="text-[#666]">{t("loading_invite")}</p>
      </div>
    );
  }

  if (invalidReason) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
        <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white p-8 text-center">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("invalid_invite")}</h1>
          <p className="text-base text-[#666] mt-3">{invalidReason}</p>
          <a href="/admin/login">
            <button className="mt-6 w-full rounded-lg border border-[#e0e0e0] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#fafafa] transition-colors">
              {t("go_to_login")}
            </button>
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
        <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white p-8 text-center">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("account_created")}</h1>
          <p className="text-base text-[#666] mt-3">
            {tReplace("verify_email_prompt", locale, { email: invite?.email ?? "" })}
          </p>
          <a href="/admin/login">
            <button className="mt-6 w-full rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] transition-colors">
              {t("go_to_login")}
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white p-8">
        <div className="mb-4 flex justify-end">
          <LanguageToggle />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">SabaiApply</h1>
          <p className="text-base text-[#666] mt-2">{t("setup_account")}</p>
        </div>

        <form onSubmit={handleAccept} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-base font-medium text-[#1a1a1a]">{t("email")}</label>
            <input
              type="email"
              value={invite?.email ?? ""}
              disabled
              className="w-full rounded-lg border border-[#e0e0e0] bg-[#fafafa] px-4 py-3.5 text-base text-[#666]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-base font-medium text-[#1a1a1a]">
              {t("full_name")}
            </label>
            <input
              id="fullName"
              type="text"
              placeholder={t("full_name_placeholder")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              placeholder={t("min_6_chars")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
            <p className="text-sm text-[#999]">{t("min_password_hint")}</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-base font-medium text-[#1a1a1a]">
              {t("confirm_password")}
            </label>
            <PasswordInput
              id="confirmPassword"
              placeholder={t("confirm_password_placeholder")}
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
            disabled={submitting}
            className="w-full rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
          >
            {submitting ? t("creating_account") : t("create_account")}
          </button>
        </form>
      </div>
    </div>
  );
}
