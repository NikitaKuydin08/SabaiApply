"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SubmitInput {
  programId: string;
  round: "1" | "2" | "4";
  essay?: string;
  signatureName: string;
  customAnswers?: Record<string, unknown>;
  portfolioId?: string;
}

interface SubmitResult {
  error?: string;
  applicationId?: string;
  submittedAt?: string;
}

/**
 * Submit a student application to a specific program/round.
 *
 * - Resolves the current authenticated user → their student_profile.
 * - Inserts a row in `applications` with status='submitted'.
 * - The essay (per-university Other-requirements writing) lands in `notes`.
 * - Signature + any extra per-uni answers are merged into `custom_answers`
 *   so admins reviewing in Mubina's portal see them as part of the
 *   application record.
 */
export async function submitApplication(input: SubmitInput): Promise<SubmitResult> {
  if (!input.programId) return { error: "No program selected" };
  if (!input.round) return { error: "No admission round selected" };
  if (!input.signatureName?.trim()) return { error: "Signature is required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile, error: profileErr } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr) return { error: `Failed to look up student profile: ${profileErr.message}` };
  if (!profile) return { error: "No student profile found. Complete the Personal Information section first." };

  const { data: inserted, error: insertErr } = await supabase
    .from("applications")
    .insert({
      student_id: profile.id,
      program_id: input.programId,
      round: input.round,
      status: "submitted",
      notes: input.essay ?? null,
      custom_answers: {
        signature_name: input.signatureName.trim(),
        ...(input.customAnswers ?? {}),
      },
      portfolio_id: input.portfolioId ?? null,
    })
    .select("id, submitted_at")
    .single();

  if (insertErr) {
    // Unique violation = student already applied to this (program, round).
    // Surface a readable message instead of the raw Postgres error.
    if (insertErr.code === "23505") {
      return { error: "You have already submitted an application for this program and round." };
    }
    return { error: insertErr.message };
  }

  revalidatePath("/dashboard");
  return { applicationId: inserted.id, submittedAt: inserted.submitted_at };
}
