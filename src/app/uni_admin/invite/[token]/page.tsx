"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Invite } from "@/types/database";

export default function AcceptInvitePage() {
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

      // Sign out any currently logged-in user so this page is clean
      await supabase.auth.signOut();

      const { data, error: fetchError } = await supabase
        .from("invites")
        .select("*")
        .eq("token", token)
        .single();

      if (fetchError || !data) {
        setInvalidReason("This invite link is invalid.");
        setLoading(false);
        return;
      }

      if (data.accepted_at) {
        setInvalidReason("This invite has already been used.");
        setLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setInvalidReason("This invite has expired. Please ask your admin to send a new one.");
        setLoading(false);
        return;
      }

      setInvite(data);
      setLoading(false);
    }

    init();
  }, [token]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setSubmitting(false);
      return;
    }

    if (!invite) return;

    const supabase = createClient();

    // Create the auth user
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
      // Update profile with full name
      await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", authData.user.id);

      // Link to faculty
      if (invite.faculty_id) {
        await supabase.from("faculty_admins").insert({
          user_id: authData.user.id,
          faculty_id: invite.faculty_id,
          is_primary: false,
        });
      }

      // Mark invite as accepted
      await supabase
        .from("invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);
    }

    // Sign out — user must verify email then login themselves
    await supabase.auth.signOut();
    setSuccess(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <p className="text-[#666]">Loading invite...</p>
      </div>
    );
  }

  if (invalidReason) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
        <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white p-8 text-center">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Invalid Invite</h1>
          <p className="text-base text-[#666] mt-3">{invalidReason}</p>
          <a href="/admin/login">
            <button className="mt-6 w-full rounded-lg border border-[#e0e0e0] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#fafafa] transition-colors">
              Go to Login
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
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Account Created!</h1>
          <p className="text-base text-[#666] mt-3">
            Please check your email at <strong>{invite?.email}</strong> to verify your account, then sign in.
          </p>
          <a href="/admin/login">
            <button className="mt-6 w-full rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] transition-colors">
              Go to Login
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">SabaiApply</h1>
          <p className="text-base text-[#666] mt-2">Set up your account</p>
        </div>

        <form onSubmit={handleAccept} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-base font-medium text-[#1a1a1a]">Email</label>
            <input
              type="email"
              value={invite?.email ?? ""}
              disabled
              className="w-full rounded-lg border border-[#e0e0e0] bg-[#fafafa] px-4 py-3.5 text-base text-[#666]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-base font-medium text-[#1a1a1a]">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Dr. Somchai Jaidee"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-base font-medium text-[#1a1a1a]">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
            <p className="text-sm text-[#999]">Minimum 6 characters</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-base font-medium text-[#1a1a1a]">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
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
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
