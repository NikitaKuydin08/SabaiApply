"use client";

import { useState, useMemo } from "react";
import { X, Mail, Lock, Trash2, Bell, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n/context";

interface Props {
  onClose: () => void;
}

type Screen = "menu" | "email" | "password" | "prefs" | "delete";

export default function AccountSettingsModal({ onClose }: Props) {
  const { t } = useLocale();
  const [screen, setScreen] = useState<Screen>("menu");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <div className="flex items-center gap-2">
            {screen !== "menu" && (
              <button onClick={() => setScreen("menu")} className="p-1 text-[#666] hover:text-[#1a1a1a]">
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-bold text-[#1a1a1a]">{t("settings.title")}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:bg-[#f5f5f5]">
            <X size={20} className="text-[#666]" />
          </button>
        </div>

        {/* Content */}
        {screen === "menu" && (
          <div className="py-2">
            <MenuItem icon={<Mail size={18} />} label={t("settings.changeEmail")} onClick={() => setScreen("email")} />
            <MenuItem icon={<Lock size={18} />} label={t("settings.changePassword")} onClick={() => setScreen("password")} />
            <MenuItem icon={<Bell size={18} />} label={t("settings.commPrefs")} onClick={() => setScreen("prefs")} />
            <div className="mx-6 my-1 border-t border-[#f0f0f0]" />
            <MenuItem icon={<Trash2 size={18} />} label={t("settings.deleteAccount")} onClick={() => setScreen("delete")} danger />
          </div>
        )}
        {screen === "email" && <ChangeEmailScreen t={t} onDone={() => setScreen("menu")} />}
        {screen === "password" && <ChangePasswordScreen t={t} onDone={() => setScreen("menu")} />}
        {screen === "prefs" && <CommPrefsScreen t={t} />}
        {screen === "delete" && <DeleteAccountScreen t={t} />}
      </div>
    </div>
  );
}

/* ── Menu Item ── */

function MenuItem({ icon, label, onClick, danger = false }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-6 py-3 text-left text-sm font-medium transition-colors ${
        danger ? "text-red-600 hover:bg-red-50" : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
      }`}
    >
      <span className={danger ? "text-red-500" : "text-[#666]"}>{icon}</span>
      {label}
    </button>
  );
}

/* ── Change Email ── */

function ChangeEmailScreen({ t, onDone }: { t: (k: any) => string; onDone: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailsMatch = newEmail === confirmEmail;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!emailsMatch) {
      setError(t("settings.emailsNoMatch"));
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setError("Could not get current user."); setLoading(false); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ email: newEmail });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="px-6 py-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Mail size={20} className="text-green-600" />
        </div>
        <p className="text-sm text-[#666]">{t("settings.emailSent")}</p>
        <button onClick={onDone} className="mt-4 rounded-lg bg-[#F4C430] px-5 py-2 text-sm font-semibold text-[#1a1a1a] hover:bg-[#e6b82a]">
          {t("settings.back")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("settings.currentPassword")} <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 pr-11 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666]">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("settings.newEmail")} <span className="text-red-500">*</span></label>
        <input
          type="email"
          required
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder={t("settings.newEmailPlaceholder")}
          className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("settings.confirmNewEmail")} <span className="text-red-500">*</span></label>
        <input
          type="email"
          required
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={t("settings.confirmNewEmailPlaceholder")}
          className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
        />
        {confirmEmail && !emailsMatch && (
          <p className="mt-1.5 text-xs text-red-500">{t("settings.emailsNoMatch")}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !newEmail || !confirmEmail || !emailsMatch || !currentPassword}
        className="w-full rounded-lg bg-[#F4C430] px-4 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50"
      >
        {loading ? t("settings.updating") : t("settings.updateEmail")}
      </button>
    </form>
  );
}

/* ── Change Password ── */

function ChangePasswordScreen({ t, onDone }: { t: (k: any) => string; onDone: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRules = useMemo(() => [
    { label: t("pw.length"), test: (p: string) => p.length >= 10 && p.length <= 32 },
    { label: t("pw.uppercase"), test: (p: string) => /[A-Z]/.test(p) },
    { label: t("pw.lowercase"), test: (p: string) => /[a-z]/.test(p) },
    { label: t("pw.number"), test: (p: string) => /\d/.test(p) },
    { label: t("pw.special"), test: (p: string) => /[^A-Za-z0-9]/.test(p) },
    { label: t("pw.noSpaces"), test: (p: string) => !/\s/.test(p) },
  ], [t]);

  const allRulesPass = useMemo(() => passwordRules.every((r) => r.test(newPassword)), [newPassword, passwordRules]);
  const passwordsMatch = newPassword === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!allRulesPass) {
      setError(t("signup.errorPasswordNotMet"));
      return;
    }

    if (!passwordsMatch) {
      setError(t("settings.passwordsNoMatch"));
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setError("Could not get current user."); setLoading(false); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="px-6 py-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Lock size={20} className="text-green-600" />
        </div>
        <p className="text-sm text-[#666]">{t("settings.passwordUpdated")}</p>
        <button onClick={onDone} className="mt-4 rounded-lg bg-[#F4C430] px-5 py-2 text-sm font-semibold text-[#1a1a1a] hover:bg-[#e6b82a]">
          {t("settings.back")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("settings.currentPassword")} <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 pr-11 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
          />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666]">
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("settings.newPassword")} <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 pr-11 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
          />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666]">
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="mt-2 space-y-1">
          {passwordRules.map((rule) => {
            const passes = newPassword ? rule.test(newPassword) : false;
            return (
              <p key={rule.label} className={`text-xs flex items-center gap-1.5 ${!newPassword ? "text-[#999]" : passes ? "text-green-600" : "text-red-500"}`}>
                <span>{!newPassword ? "○" : passes ? "✓" : "✕"}</span>
                {rule.label}
              </p>
            );
          })}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">{t("settings.confirmNewPassword")} <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 pr-11 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666]">
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="mt-1.5 text-xs text-red-500">{t("settings.passwordsNoMatch")}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !currentPassword || !allRulesPass || !passwordsMatch || !confirmPassword}
        className="w-full rounded-lg bg-[#F4C430] px-4 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50"
      >
        {loading ? t("settings.updating") : t("settings.updatePassword")}
      </button>
    </form>
  );
}

/* ── Communication Preferences ── */

function CommPrefsScreen({ t }: { t: (k: any) => string }) {
  const [appUpdates, setAppUpdates] = useState(true);
  const [deadlines, setDeadlines] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // In the future, save to Supabase user metadata
    localStorage.setItem("sabaiapply-comm-prefs", JSON.stringify({ appUpdates, deadlines, newsletter }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="px-6 py-5">
      <p className="mb-4 text-sm font-medium text-[#1a1a1a]">{t("settings.emailNotifications")}</p>
      <div className="space-y-3">
        <ToggleRow label={t("settings.applicationUpdates")} checked={appUpdates} onChange={setAppUpdates} />
        <ToggleRow label={t("settings.deadlineReminders")} checked={deadlines} onChange={setDeadlines} />
        <ToggleRow label={t("settings.newsletterUpdates")} checked={newsletter} onChange={setNewsletter} />
      </div>
      <button
        onClick={handleSave}
        className="mt-5 w-full rounded-lg bg-[#F4C430] px-4 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]"
      >
        {saved ? t("settings.prefsSaved") : t("settings.savePrefs")}
      </button>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg px-1 py-1">
      <span className="text-sm text-[#444]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-[#F4C430]" : "bg-[#ddd]"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

/* ── Delete Account ── */

function DeleteAccountScreen({ t }: { t: (k: any) => string }) {
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmed && password.length > 0;

  async function handleDelete() {
    if (!canDelete) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Verify password before deletion
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setError("Could not get current user."); setLoading(false); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Sign out — actual deletion requires server-side admin API
    await supabase.auth.signOut();
    localStorage.removeItem("sabaiapply-added-universities");
    localStorage.removeItem("sabaiapply-comm-prefs");
    localStorage.removeItem("sabaiapply-student-locale");
    window.location.href = "/login";
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
      <div className="mb-4 space-y-3 text-sm text-[#444]">
        <p><span className="font-semibold text-[#1a1a1a]">{t("settings.deleteWarning1")}</span></p>
        <p>{t("settings.deleteWarning2")}</p>
        <p>{t("settings.deleteWarning3")}</p>
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {/* Checkbox confirmation */}
      <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-lg border border-[#e0e0e0] px-4 py-3">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#F4C430]"
        />
        <span className="text-sm text-[#444]">{t("settings.deleteCheckbox")}</span>
      </label>

      {/* Password */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">
          {t("settings.deletePassword")} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 pr-11 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666]">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={!canDelete || loading}
        className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40"
      >
        {loading ? t("settings.updating") : t("settings.deleteContinue")}
      </button>
    </div>
  );
}
