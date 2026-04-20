"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { restoreStandardFaculties } from "../../actions";

export function RestoreFacultiesButton({ universityId }: { universityId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleRestore() {
    if (!confirm("Add standard faculties for this university? Existing faculties will not be duplicated.")) return;

    setLoading(true);
    setFeedback("");

    const result = await restoreStandardFaculties(universityId);

    if (result.error) {
      setFeedback(`Failed: ${result.error}`);
    } else {
      const created = result.created ?? 0;
      const skipped = result.skipped ?? 0;
      setFeedback(`Added ${created} ${created === 1 ? "faculty" : "faculties"}. Skipped ${skipped} (already exist).`);
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
        {loading ? "Restoring..." : "Restore Standard Faculties"}
      </button>
      {feedback && (
        <p className={`mt-2 text-sm ${feedback.startsWith("Failed") ? "text-red-600" : "text-green-600"}`}>
          {feedback}
        </p>
      )}
    </div>
  );
}
