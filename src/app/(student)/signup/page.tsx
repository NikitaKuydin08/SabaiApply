"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "student" },
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
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
            Sabai<span className="text-[#F4C430]">Apply</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-[#1a1a1a]">Create your account</h1>
          <p className="mt-2 text-sm text-[#666]">Start your university application journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F4C430] px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#666]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#1a1a1a] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
