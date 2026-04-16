"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Suspense } from "react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF9EC] px-4">
      <div className="w-full max-w-[480px] rounded-2xl border border-[#e8e8e8] bg-white px-10 py-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        {/* Logo */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-3xl font-bold tracking-tight text-[#1a1a1a]">
            <img src="/logo-lotus.png" alt="" className="mr-2 h-9 w-9 object-contain" />
            Sabai<span className="text-[#F4C430]">Apply</span>
          </Link>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#DBEAFE]">
          <Mail size={28} className="text-[#3B82F6]" />
        </div>

        {/* Message */}
        <h1 className="mb-3 text-2xl font-bold text-[#1a1a1a]">Check your email</h1>
        <p className="mb-2 text-base leading-relaxed text-[#666]">
          We sent a confirmation link to
        </p>
        {email && (
          <p className="mb-4 text-base font-semibold text-[#1a1a1a]">{email}</p>
        )}
        <p className="mb-8 text-sm leading-relaxed text-[#999]">
          Click the link in your email to activate your account. Once confirmed, you can log in from any device.
        </p>

        {/* Login button */}
        <Link
          href="/login?confirmed=pending"
          className="inline-block w-full rounded-lg bg-[#F4C430] px-6 py-3.5 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]"
        >
          Go to Login
        </Link>

        <p className="mt-6 text-sm text-[#999]">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FFF9EC]">
        <p className="text-[#666]">Loading...</p>
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}
