"use client";

import { X, Mail, Lock, Trash2, Bell } from "lucide-react";
import { useStudentLocale } from "../i18n/context";

interface Props {
  onClose: () => void;
}

export default function AccountSettingsModal({ onClose }: Props) {
  const { t } = useStudentLocale();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <h2 className="text-lg font-bold text-[#1a1a1a]">{t("settings.title")}</h2>
          <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:bg-[#f5f5f5]">
            <X size={20} className="text-[#666]" />
          </button>
        </div>
        <div className="py-2">
          <SettingsItem icon={<Mail size={18} />} label={t("settings.changeEmail")} />
          <SettingsItem icon={<Lock size={18} />} label={t("settings.changePassword")} />
          <SettingsItem icon={<Bell size={18} />} label={t("settings.commPrefs")} />
          <div className="mx-6 my-1 border-t border-[#f0f0f0]" />
          <SettingsItem icon={<Trash2 size={18} />} label={t("settings.deleteAccount")} danger />
        </div>
      </div>
    </div>
  );
}

function SettingsItem({ icon, label, danger = false }: { icon: React.ReactNode; label: string; danger?: boolean }) {
  return (
    <button className={`flex w-full items-center gap-3 px-6 py-3 text-left text-sm font-medium transition-colors ${danger ? "text-red-600 hover:bg-red-50" : "text-[#1a1a1a] hover:bg-[#f5f5f5]"}`}>
      <span className={danger ? "text-red-500" : "text-[#666]"}>{icon}</span>
      {label}
    </button>
  );
}
