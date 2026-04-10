"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const passwordRules = [
  { label: "10-32 characters", test: (p: string) => p.length >= 10 && p.length <= 32 },
  { label: "At least one upper case", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least one lower case", test: (p: string) => /[a-z]/.test(p) },
  { label: "At least one number", test: (p: string) => /\d/.test(p) },
  { label: "At least one special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  { label: "No space characters", test: (p: string) => !/\s/.test(p) },
];

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const allRulesPass = useMemo(() => passwordRules.every((r) => r.test(password)), [password]);
  const passwordsMatch = password === confirmPassword;
  const emailsMatch = email === confirmEmail;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!emailsMatch) {
      setError("Emails do not match.");
      return;
    }

    if (!allRulesPass) {
      setError("Password does not meet all requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
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

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[520px]">
        <div className="mb-10 text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight text-[#1a1a1a]">
            Sabai<span className="text-[#F4C430]">Apply</span>
          </Link>
          <h1 className="mt-8 text-3xl font-bold text-[#1a1a1a]">Create your account</h1>
          <p className="mt-3 text-base text-[#666]">Start your university application journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-5 py-4 text-base text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-base font-medium text-[#1a1a1a] mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="confirmEmail" className="block text-base font-medium text-[#1a1a1a] mb-2">
              Re-type Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmEmail"
              type="email"
              required
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
              placeholder="Re-type your email"
            />
            {confirmEmail && !emailsMatch && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <span>✕</span> Emails must match
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-medium text-[#1a1a1a] mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
            />
            <div className="mt-3 space-y-1.5">
              {passwordRules.map((rule) => {
                const passes = password ? rule.test(password) : false;
                return (
                  <p
                    key={rule.label}
                    className={`text-sm flex items-center gap-1.5 ${
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
            <label htmlFor="confirmPassword" className="block text-base font-medium text-[#1a1a1a] mb-2">
              Re-type Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <span>✕</span> Passwords must match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !allRulesPass || !passwordsMatch || !emailsMatch}
            className="w-full rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-8 text-center text-base text-[#666]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#1a1a1a] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
