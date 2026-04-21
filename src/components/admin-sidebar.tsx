"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { UserRole } from "@/types/database";

interface NavItem {
  href: string;
  labelKey: TranslationKey;
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
  { href: "/super-admin/dashboard", labelKey: "super_dashboard", icon: "⚡", roles: ["super_admin"] },
  { href: "/super-admin/universities", labelKey: "all_universities", icon: "🌐", roles: ["super_admin"] },
  { href: "/super-admin/users", labelKey: "all_users", icon: "👤", roles: ["super_admin"] },
];

interface AdminSidebarProps {
  fullName: string | null;
  email: string;
  role: UserRole;
  universityName: string | null;
}

export function AdminSidebar({ fullName, email, role, universityName }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t: tr } = useLocale();

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));
  const visibleSuperItems = superAdminItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#e0e0e0] bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b border-[#e0e0e0] p-5">
          <Link href={role === "super_admin" ? "/super-admin/dashboard" : "/admin/dashboard"}>
            <h1 className="text-3xl font-bold text-[#1a1a1a]">SabaiApply</h1>
            <p className="text-sm text-[#999] mt-1">
              {role === "super_admin" ? tr("super_admin_label") : tr("admin_portal")}
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
              {tr("platform")}
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
                {tr(item.labelKey)}
              </Link>
            ))}
          </nav>
        )}

        {/* Regular admin section */}
        <nav className="flex-1 space-y-1 p-3 mt-2">
          {role === "super_admin" && visibleNavItems.length > 0 && (
            <p className="px-4 py-1 text-xs font-medium text-[#999] uppercase tracking-wider">
              {tr("university_section")}
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
              {tr(item.labelKey)}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <Link href="/admin/profile" className="block border-t border-[#e0e0e0] p-5 hover:bg-[#fafafa] transition-colors">
          <p className="text-base font-medium text-[#1a1a1a] truncate">
            {fullName || tr("admin_default_name")}
          </p>
          <p className="text-sm text-[#999] truncate">{email}</p>
          <p className="text-xs text-[#F4C430] mt-1">
            {tr("view_profile")}
          </p>
        </Link>
      </div>
    </aside>
  );
}
