"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { LanguageToggle } from "@/components/language-toggle";
import { LocaleProvider } from "@/lib/locale-context";
import { signOut } from "./actions";
import type { UserRole } from "@/types/database";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  fullName: string | null;
  email: string;
  role: UserRole;
  universityName: string | null;
}

export function AdminLayoutClient({
  children,
  fullName,
  email,
  role,
  universityName,
}: AdminLayoutClientProps) {
  return (
    <LocaleProvider>
      <div className="min-h-screen bg-[#fafafa]">
        <AdminSidebar
          fullName={fullName}
          email={email}
          role={role}
          universityName={universityName}
        />

        <div className="ml-64">
          <header className="flex items-center justify-between border-b border-[#e0e0e0] bg-white px-6 py-3">
            <div />
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg px-4 py-2 text-base text-[#666] hover:bg-[#fafafa] hover:text-[#1a1a1a] transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </LocaleProvider>
  );
}
