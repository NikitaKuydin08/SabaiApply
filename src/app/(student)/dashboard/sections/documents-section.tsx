"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { StudentDocument, DocType } from "@/types/database";
import { Upload, CheckCircle, FileText } from "lucide-react";
import SectionPanel from "./section-panel";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { tReplace } from "@/lib/i18n/translations";

interface Props {
  documents: StudentDocument[];
  studentId: string;
  userId: string;
  onClose: () => void;
  inline?: boolean;
  onSaved?: () => void;
}

interface DocSlot {
  type: DocType;
  labelKey: TranslationKey;
  required: boolean;
}

const DOCUMENT_SLOTS: DocSlot[] = [
  { type: "transcript", labelKey: "form.doc.transcript", required: true },
  { type: "id_copy", labelKey: "form.doc.idCopy", required: true },
  { type: "photo", labelKey: "form.doc.photo", required: true },
  { type: "high_school_diploma", labelKey: "form.doc.highSchoolDiploma", required: true },
  { type: "student_status_cert", labelKey: "form.doc.studentStatusCert", required: false },
  { type: "high_school_equivalency", labelKey: "form.doc.gedIb", required: false },
  { type: "gpa_equivalency_cert", labelKey: "form.doc.gpaEquiv", required: false },
  { type: "score_certificate", labelKey: "form.doc.scoreCert", required: true },
  { type: "english_proficiency_cert", labelKey: "form.doc.englishCert", required: false },
  { type: "passport_copy", labelKey: "form.doc.passportCopy", required: false },
  { type: "name_change_cert", labelKey: "form.doc.nameChange", required: false },
  { type: "recommendation_letter", labelKey: "form.doc.recommendation", required: false },
  { type: "certificate", labelKey: "form.doc.otherCert", required: false },
];

export default function DocumentsSection({ documents, studentId, userId, onClose, inline, onSaved }: Props) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [localDocs, setLocalDocs] = useState<StudentDocument[]>(documents);
  useEffect(() => { setLocalDocs(documents); }, [documents]);
  const [uploading, setUploading] = useState<DocType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlotType, setActiveSlotType] = useState<DocType | null>(null);

  function getDocForType(type: DocType): StudentDocument | undefined {
    return localDocs.find((d) => d.doc_type === type);
  }

  function triggerUpload(type: DocType) {
    setActiveSlotType(type);
    setError(null);
    // Small delay to ensure state is set before click
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeSlotType) return;

    setUploading(activeSlotType);
    setError(null);

    const supabase = createClient();
    const docType = activeSlotType;

    // Upload to Supabase Storage
    const filePath = `${userId}/documents/${docType}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      setError(tReplace("form.validation.uploadFail", locale, { error: uploadError.message }));
      setUploading(null);
      resetFileInput();
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Remove existing doc of this type if replacing
    const existingDoc = getDocForType(docType);
    if (existingDoc) {
      await supabase
        .from("student_documents")
        .delete()
        .eq("id", existingDoc.id);
    }

    // Insert new document reference
    const { data: newDoc, error: insertError } = await supabase
      .from("student_documents")
      .insert({
        student_id: studentId,
        doc_type: docType,
        file_url: fileUrl,
        file_name: file.name,
        file_size: file.size,
      })
      .select()
      .single();

    if (insertError) {
      setError(tReplace("form.validation.saveFail", locale, { error: insertError.message }));
      setUploading(null);
      resetFileInput();
      return;
    }

    // Update local state
    setLocalDocs((prev) => {
      const filtered = prev.filter((d) => d.doc_type !== docType);
      return [...filtered, newDoc as StudentDocument];
    });

    setUploading(null);
    setActiveSlotType(null);
    resetFileInput();
    router.refresh();
  }

  function resetFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const formContent = (
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileChange}
        />

        {/* Documents */}
        <div>
          <h3 className="mb-3 text-base font-semibold text-[#1a1a1a]">{t("form.documents")}</h3>
          <div className="space-y-2">
            {DOCUMENT_SLOTS.map((slot) => {
              const doc = getDocForType(slot.type);
              const isUploading = uploading === slot.type;

              return (
                <div
                  key={slot.type}
                  className="flex items-center justify-between rounded-lg border border-[#e0e0e0] px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {doc ? (
                      <CheckCircle size={18} className="shrink-0 text-green-500" />
                    ) : (
                      <FileText size={18} className="shrink-0 text-[#ccc]" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a]">
                        {t(slot.labelKey)}
                        {slot.required ? <span className="ml-0.5 text-red-500">*</span> : <span className="ml-1 text-xs font-normal text-[#999]">{t("form.optional")}</span>}
                      </p>
                      {doc && (
                        <p className="truncate text-xs text-[#888]">{doc.file_name}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => triggerUpload(slot.type)}
                    disabled={isUploading}
                    className="ml-3 shrink-0 rounded-lg border border-[#e0e0e0] px-3 py-1.5 text-xs font-medium text-[#666] transition-colors hover:bg-[#f5f5f5] disabled:opacity-50"
                  >
                    {isUploading ? t("form.uploading") : doc ? t("form.replace") : t("form.upload")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
  );

  if (inline) return (
    <div>
      {formContent}
      {onSaved && (
        <div className="mt-6 flex justify-end border-t border-[#f0f0f0] pt-5">
          <button
            onClick={onSaved}
            className="rounded-lg bg-[#F4C430] px-6 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );

  return (
    <SectionPanel title={t("form.documents")} onClose={onClose}>
      {formContent}
    </SectionPanel>
  );
}
