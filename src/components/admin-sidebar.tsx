"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

const navItems = [
  { href: "/admin/dashboard", labelKey: "dashboard" as const, icon: "📊" },
  { href: "/admin/university", labelKey: "university_setup" as const, icon: "🏛️" },
  { href: "/admin/programs", labelKey: "programs" as const, icon: "📋" },
  { href: "/admin/applications", labelKey: "applications" as const, icon: "📥" },
  { href: "/admin/interviews", labelKey: "interviews" as const, icon: "🗓️" },
  { href: "/admin/results", labelKey: "results" as const, icon: "✅" },
  { href: "/admin/team", labelKey: "team" as const, icon: "👥" },
];

interface AdminSidebarProps {
  fullName: string | null;
  email: string;
}

export function AdminSidebar({ fullName, email }: AdminSidebarProps) {
  const pathname = usePathname();
  const { locale } = useLocale();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#e0e0e0] bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b border-[#e0e0e0] p-5">
          <Link href="/admin/dashboard">
            <h1 className="text-3xl font-bold text-[#1a1a1a]">SabaiApply</h1>
            <p className="text-sm text-[#999] mt-1">{t("admin_portal", locale)}</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 mt-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-colors",
                pathname === item.href
                  ? "bg-[#F4C430]/10 text-[#1a1a1a] font-medium border border-[#F4C430]/30"
                  : "text-[#666] hover:bg-[#fafafa] hover:text-[#1a1a1a]"
              )}
            >
              <span>{item.icon}</span>
              {t(item.labelKey, locale)}
            </Link>
          ))}
        </nav>

        {/* User info — clickable, links to profile */}
        <Link href="/admin/profile" className="block border-t border-[#e0e0e0] p-5 hover:bg-[#fafafa] transition-colors">
          <p className="text-base font-medium text-[#1a1a1a] truncate">
            {fullName || "Admin"}
          </p>
          <p className="text-sm text-[#999] truncate">{email}</p>
          <p className="text-xs text-[#F4C430] mt-1">
            {locale === "th" ? "ดูโปรไฟล์" : "View Profile"}
          </p>
        </Link>
      </div>
    </aside>
  );
}
