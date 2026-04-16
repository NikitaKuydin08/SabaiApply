"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/admin/reset-password` }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
        <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white p-8 text-center">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Check Your Email</h1>
          <p className="text-base text-[#666] mt-3">
            We sent a password reset link to <strong>{email}</strong>.
            Click the link to set a new password.
          </p>
          <Link href="/admin/login">
            <button className="mt-6 w-full rounded-lg border border-[#e0e0e0] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#fafafa] transition-colors">
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#e8e8e8] bg-white p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Forgot Password</h1>
          <p className="text-base text-[#666] mt-2">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-base font-medium text-[#1a1a1a]">
              Email
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

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-5 text-center text-base">
          <Link href="/admin/login" className="text-[#F4C430] font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
