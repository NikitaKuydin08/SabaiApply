"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentDocument, DocType } from "@/types/database";
import { Upload, CheckCircle, FileText } from "lucide-react";
import SectionPanel from "./section-panel";

interface Props {
  documents: StudentDocument[];
  studentId: string;
  onClose: () => void;
  inline?: boolean;
}

interface DocSlot {
  type: DocType;
  label: string;
  required: boolean;
}

const DOCUMENT_SLOTS: DocSlot[] = [
  { type: "transcript", label: "High School Transcript", required: true },
  { type: "id_copy", label: "National ID Card / Passport Copy", required: true },
  { type: "photo", label: "Profile Photo", required: true },
  { type: "high_school_diploma", label: "High School Diploma", required: true },
  { type: "student_status_cert", label: "Student Status Certificate (if still studying)", required: false },
  { type: "high_school_equivalency", label: "High School Equivalency Certificate (GED/IB)", required: false },
  { type: "gpa_equivalency_cert", label: "GPA Equivalency Certificate", required: false },
  { type: "score_certificate", label: "Test Score Certificate(s)", required: true },
  { type: "english_proficiency_cert", label: "English Proficiency Certificate", required: false },
  { type: "passport_copy", label: "Passport Copy (for non-Thai)", required: false },
  { type: "name_change_cert", label: "Name Change Certificate", required: false },
  { type: "recommendation_letter", label: "Recommendation Letter", required: false },
  { type: "certificate", label: "Other Certificate / Award", required: false },
];

export default function DocumentsSection({ documents, studentId, onClose, inline }: Props) {
  const [localDocs, setLocalDocs] = useState<StudentDocument[]>(documents);
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
    const filePath = `${studentId}/documents/${docType}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
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
      setError(`Save failed: ${insertError.message}`);
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
          <h3 className="mb-3 text-base font-semibold text-[#1a1a1a]">Documents</h3>
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
                        {slot.label}
                        {slot.required ? <span className="ml-0.5 text-red-500">*</span> : <span className="ml-1 text-xs font-normal text-[#999]">(optional)</span>}
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
                    {isUploading ? "Uploading..." : doc ? "Replace" : "Upload"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
  );

  if (inline) return <div>{formContent}</div>;

  return (
    <SectionPanel title="Documents" onClose={onClose}>
      {formContent}
    </SectionPanel>
  );
}
