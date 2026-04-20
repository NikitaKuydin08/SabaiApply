"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import type { UserRole } from "@/types/database";

interface NavItem {
  href: string;
  labelKey: Parameters<typeof t>[0];
  icon: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", labelKey: "dashboard", icon: "📊", roles: ["super_admin", "uni_admin", "faculty_admin"] },
  { href: "/admin/university", labelKey: "university_setup", icon: "🏛️", roles: ["super_admin", "uni_admin"] },
  { href: "/admin/programs", labelKey: "programs", icon: "📋", roles: ["super_admin", "uni_admin", "faculty_admin"] },
  { href: "/admin/requirements", labelKey: "requirements", icon: "📝", roles: ["super_admin", "uni_admin", "faculty_admin"] },
  { href: "/admin/applications", labelKey: "applications", icon: "📥", roles: ["super_admin", "uni_admin", "faculty_admin"] },
  { href: "/admin/interviews", labelKey: "interviews", icon: "🗓️", roles: ["uni_admin", "faculty_admin"] },
  { href: "/admin/results", labelKey: "results", icon: "✅", roles: ["uni_admin", "faculty_admin"] },
  { href: "/admin/team", labelKey: "team", icon: "👥", roles: ["super_admin", "uni_admin"] },
];

const superAdminItems: NavItem[] = [
  { href: "/super-admin/dashboard", labelKey: "super_dashboard" as Parameters<typeof t>[0], icon: "⚡", roles: ["super_admin"] },
  { href: "/super-admin/universities", labelKey: "all_universities" as Parameters<typeof t>[0], icon: "🌐", roles: ["super_admin"] },
  { href: "/super-admin/users", labelKey: "all_users" as Parameters<typeof t>[0], icon: "👤", roles: ["super_admin"] },
];

interface AdminSidebarProps {
  fullName: string | null;
  email: string;
  role: UserRole;
  universityName: string | null;
}

export function AdminSidebar({ fullName, email, role, universityName }: AdminSidebarProps) {
  const pathname = usePathname();
  const { locale } = useLocale();

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));
  const visibleSuperItems = superAdminItems.filter((item) => item.roles.includes(role));

  function getLabel(labelKey: string): string {
    // Try to use i18n, fallback to labelKey
    try {
      return t(labelKey as Parameters<typeof t>[0], locale);
    } catch {
      return labelKey;
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#e0e0e0] bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b border-[#e0e0e0] p-5">
          <Link href={role === "super_admin" ? "/super-admin/dashboard" : "/admin/dashboard"}>
            <h1 className="text-3xl font-bold text-[#1a1a1a]">SabaiApply</h1>
            <p className="text-sm text-[#999] mt-1">
              {role === "super_admin"
                ? (locale === "th" ? "ผู้ดูแลระบบ" : "Super Admin")
                : t("admin_portal", locale)}
            </p>
            {universityName && role !== "super_admin" && (
              <p className="text-xs text-[#F4C430] mt-1 truncate">{universityName}</p>
            )}
          </Link>
        </div>

        {/* Super admin section */}
        {visibleSuperItems.length > 0 && (
          <nav className="space-y-1 p-3 mt-2">
            <p className="px-4 py-1 text-xs font-medium text-[#999] uppercase tracking-wider">
              {locale === "th" ? "ระบบ" : "Platform"}
            </p>
            {visibleSuperItems.map((item) => (
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
                {getLabel(item.labelKey)}
              </Link>
            ))}
          </nav>
        )}

        {/* Regular admin section */}
        <nav className="flex-1 space-y-1 p-3 mt-2">
          {role === "super_admin" && visibleNavItems.length > 0 && (
            <p className="px-4 py-1 text-xs font-medium text-[#999] uppercase tracking-wider">
              {locale === "th" ? "มหาวิทยาลัย" : "University"}
            </p>
          )}
          {visibleNavItems.map((item) => (
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
              {getLabel(item.labelKey)}
            </Link>
          ))}
        </nav>

        {/* User info */}
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
