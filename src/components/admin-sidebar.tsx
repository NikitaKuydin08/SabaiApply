import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/university", label: "University Setup", icon: "🏛️" },
  { href: "/admin/programs", label: "Programs", icon: "📋" },
  { href: "/admin/applications", label: "Applications", icon: "📥" },
  { href: "/admin/interviews", label: "Interviews", icon: "🗓️" },
  { href: "/admin/results", label: "Results", icon: "✅" },
];

interface AdminSidebarProps {
  fullName: string | null;
  email: string;
}

export function AdminSidebar({ fullName, email }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b border-gray-200 p-4">
          <Link href="/admin/dashboard">
            <h1 className="text-xl font-bold text-blue-600">SabaiApply</h1>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-900 truncate">
            {fullName || "Admin"}
          </p>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </div>
      </div>
    </aside>
  );
}
