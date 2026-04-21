"use client";

import { useLocale } from "@/lib/i18n/context";

interface PlatformStats {
  universities: number;
  totalUsers: number;
  students: number;
  admins: number;
  applications: number;
}

export default function SuperDashboardClient({ stats }: { stats: PlatformStats }) {
  const { t } = useLocale();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("super_dashboard")}</h1>
      <p className="mt-2 text-base text-[#666]">{t("super_dashboard_subtitle")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">{t("stat_universities")}</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{stats.universities}</p>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">{t("total_users")}</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{stats.totalUsers}</p>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">{t("stat_students")}</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{stats.students}</p>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">{t("stat_admins")}</p>
          <p className="text-3xl font-bold text-[#F4C430] mt-2">{stats.admins}</p>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">{t("stat_applications")}</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{stats.applications}</p>
        </div>
      </div>
    </div>
  );
}
