"use client";

import { X } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  saving?: boolean;
}

export default function SectionPanel({ title, onClose, children, onSave, saveLabel, saving }: Props) {
  const { t } = useLocale();
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative flex h-full w-full max-w-[640px] flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <h2 className="text-xl font-bold text-[#1a1a1a]">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#666] transition-colors hover:bg-[#f5f5f5]">
            <X size={22} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Footer — save button */}
        {onSave && (
          <div className="border-t border-[#f0f0f0] px-6 py-4">
            <button
              onClick={onSave}
              disabled={saving}
              className="w-full rounded-lg bg-[#F4C430] px-5 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50"
            >
              {saving ? t("form.saving") : saveLabel || t("form.save")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
