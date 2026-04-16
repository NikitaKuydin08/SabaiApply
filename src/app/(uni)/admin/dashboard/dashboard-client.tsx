"use client";

import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

interface Props {
  email: string | undefined;
  programCount: number;
  applicationCount: number;
  pendingCount: number;
}

export function DashboardClient({ email, programCount, applicationCount, pendingCount }: Props) {
  const { locale } = useLocale();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("dashboard", locale)}</h1>
      <p className="mt-2 text-base text-[#666]">
        {t("welcome_back", locale)}, {email}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">{t("programs", locale)}</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{programCount}</p>
        </div>

        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">{t("total_applications", locale)}</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{applicationCount}</p>
        </div>

        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">{t("pending_review", locale)}</p>
          <p className="text-3xl font-bold text-[#F4C430] mt-2">{pendingCount}</p>
        </div>
      </div>
    </div>
  );
}