"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n/context";
import { PasswordInput } from "@/components/password-input";

export default function ProfilePage() {
  const { t } = useLocale();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setRole(profile.role);
      }

      const { data: files } = await supabase.storage
        .from("photos")
        .list(user.id, { limit: 1 });

      if (files && files.length > 0) {
        const { data: urlData } = supabase.storage
          .from("photos")
          .getPublicUrl(`${user.id}/${files[0].name}`);
        setPhotoUrl(urlData.publicUrl);
      }

      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileSuccess(t("profile_saved"));
    }

    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmNewPassword) {
      setPasswordError(t("passwords_not_match"));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t("password_too_short"));
      return;
    }

    setPasswordSaving(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordError(t("current_password_incorrect"));
      setPasswordSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setPasswordError(updateError.message);
    } else {
      setPasswordSuccess(t("password_changed"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }

    setPasswordSaving(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError(t("select_image_file"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError(t("image_too_large"));
      return;
    }

    setUploading(true);
    setProfileError("");

    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    await supabase.storage.from("photos").remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`, `${userId}/avatar.webp`]);

    const { error } = await supabase.storage
      .from("photos")
      .upload(path, file, { upsert: true });

    if (error) {
      setProfileError(error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(path);

    setPhotoUrl(urlData.publicUrl + "?t=" + Date.now());
    setUploading(false);
  }

  function getRoleLabel() {
    if (role === "uni_admin") return t("role_uni_admin");
    if (role === "faculty_admin") return t("role_faculty_admin");
    return role;
  }

  if (loading) {
    return <div className="p-8"><p className="text-[#666]">{t("loading")}</p></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("profile_title")}</h1>
      <p className="mt-2 text-base text-[#666]">{t("profile_subtitle")}</p>

      <div className="mt-6 max-w-2xl space-y-6">

        {/* Profile Info */}
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">{t("personal_info")}</h2>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="flex items-center gap-5">
              <div
                className="relative h-20 w-20 rounded-full bg-[#fafafa] border-2 border-[#e0e0e0] overflow-hidden cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl text-[#999]">
                    {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium">
                    {uploading ? "..." : t("change_photo")}
                  </span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div>
                <p className="text-base font-medium text-[#1a1a1a]">{t("profile_photo")}</p>
                <p className="text-sm text-[#999]">{t("click_to_change_photo")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-base font-medium text-[#1a1a1a]">
                {t("full_name")}
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("full_name_placeholder")}
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium text-[#1a1a1a]">{t("email")}</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-lg border border-[#e0e0e0] bg-[#fafafa] px-4 py-3.5 text-base text-[#666]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium text-[#1a1a1a]">{t("role")}</label>
              <div className="px-4 py-3.5 rounded-lg bg-[#fafafa] border border-[#e0e0e0]">
                <span className="inline-block rounded-full bg-[#F4C430]/10 px-3 py-1 text-sm font-medium text-[#1a1a1a]">
                  {getRoleLabel()}
                </span>
              </div>
            </div>

            {profileError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{profileError}</p>}
            {profileSuccess && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{profileSuccess}</p>}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
            >
              {saving ? t("saving") : t("save")}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">{t("change_password_title")}</h2>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-base font-medium text-[#1a1a1a]">
                {t("current_password")}
              </label>
              <PasswordInput
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t("current_password_placeholder")}
                required
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-base font-medium text-[#1a1a1a]">
                {t("new_password")}
              </label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("min_6_chars")}
                required
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmNewPassword" className="block text-base font-medium text-[#1a1a1a]">
                {t("confirm_new_password")}
              </label>
              <PasswordInput
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder={t("confirm_password")}
                required
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
              />
            </div>

            {passwordError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{passwordSuccess}</p>}

            <button
              type="submit"
              disabled={passwordSaving}
              className="rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
            >
              {passwordSaving ? t("changing_password") : t("change_password_title")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
