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
}

interface DocSlot {
  type: DocType;
  label: string;
  required: boolean;
}

const DOCUMENT_SLOTS: DocSlot[] = [
  { type: "transcript", label: "Transcript", required: true },
  { type: "id_copy", label: "ID Card Copy", required: true },
  { type: "photo", label: "Photo", required: true },
  { type: "passport_copy", label: "Passport Copy", required: false },
  { type: "student_id_card", label: "Student ID Card", required: false },
  { type: "name_change_cert", label: "Name Change Certificate", required: false },
  { type: "score_certificate", label: "Score Certificate", required: false },
  { type: "recommendation_letter", label: "Recommendation Letter", required: false },
  { type: "certificate", label: "Certificate", required: false },
];

export default function DocumentsSection({ documents, studentId, onClose }: Props) {
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

  return (
    <SectionPanel title="Documents" onClose={onClose}>
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

        {/* Required documents */}
        <div>
          <h3 className="mb-3 text-base font-semibold text-[#1a1a1a]">Required Documents</h3>
          <div className="space-y-2">
            {DOCUMENT_SLOTS.filter((s) => s.required).map((slot) => {
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
                      <p className="text-sm font-medium text-[#1a1a1a]">{slot.label}</p>
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

        {/* Optional documents */}
        <div>
          <h3 className="mb-3 text-base font-semibold text-[#1a1a1a]">Optional Documents</h3>
          <div className="space-y-2">
            {DOCUMENT_SLOTS.filter((s) => !s.required).map((slot) => {
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
                      <Upload size={18} className="shrink-0 text-[#ccc]" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a]">{slot.label}</p>
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
    </SectionPanel>
  );
}
