"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  fullName: string | null;
  email: string;
}

export function AdminLayoutClient({
  children,
  fullName,
  email,
}: AdminLayoutClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar fullName={fullName} email={email} />

      {/* Top bar */}
      <div className="ml-64">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div />
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              Sign Out
            </Button>
          </form>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
