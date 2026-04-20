"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { restoreStandardPrograms, deleteProgram } from "../../actions";

export function RestoreProgramsButton({ facultyId }: { facultyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleRestore() {
    if (!confirm("Add standard programs for this faculty? Existing programs will not be duplicated.")) return;

    setLoading(true);
    setFeedback("");

    const result = await restoreStandardPrograms(facultyId);

    if (result.error) {
      setFeedback(`Failed: ${result.error}`);
    } else {
      const created = result.created ?? 0;
      const skipped = result.skipped ?? 0;
      setFeedback(`Added ${created} ${created === 1 ? "program" : "programs"}. Skipped ${skipped} (already exist).`);
      router.refresh();
    }

    setLoading(false);
    setTimeout(() => setFeedback(""), 6000);
  }

  return (
    <div>
      <button
        onClick={handleRestore}
        disabled={loading}
        className="rounded-lg bg-[#F4C430] px-5 py-3 text-base font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors"
      >
        {loading ? "Restoring..." : "Restore Standard Programs"}
      </button>
      {feedback && (
        <p className={`mt-2 text-sm ${feedback.startsWith("Failed") ? "text-red-600" : "text-green-600"}`}>
          {feedback}
        </p>
      )}
    </div>
  );
}

export function DeleteProgramButton({ programId, programName }: { programId: string; programName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${programName}"?`)) return;

    setLoading(true);
    const result = await deleteProgram(programId);
    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
