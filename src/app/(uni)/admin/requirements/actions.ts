"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getCurrentAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, university_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "student") throw new Error("Not authorized");

  let assignedFacultyIds: string[] = [];
  if (profile.role === "faculty_admin") {
    const { data: assignments } = await supabase
      .from("faculty_admins")
      .select("faculty_id")
      .eq("user_id", user.id);
    assignedFacultyIds = (assignments ?? []).map((a: { faculty_id: string }) => a.faculty_id);
  }

  return { supabase, profile, assignedFacultyIds };
}

// Return universities, faculties, and programs the admin can configure.
// super_admin: everything. uni_admin: only their university. faculty_admin: only assigned faculties.
export async function getProgramsForRequirements() {
  const { supabase, profile, assignedFacultyIds } = await getCurrentAdmin();

  let facultyQuery = supabase
    .from("faculties")
    .select("id, name, name_th, university_id")
    .order("name");

  if (profile.role === "uni_admin") {
    if (!profile.university_id) return { universities: [], faculties: [], programs: [] };
    facultyQuery = facultyQuery.eq("university_id", profile.university_id);
  } else if (profile.role === "faculty_admin") {
    if (assignedFacultyIds.length === 0) return { universities: [], faculties: [], programs: [] };
    facultyQuery = facultyQuery.in("id", assignedFacultyIds);
  }

  const { data: faculties } = await facultyQuery;
  if (!faculties || faculties.length === 0) return { universities: [], faculties: [], programs: [] };

  const facultyIds = faculties.map((f: { id: string }) => f.id);
  const universityIds = Array.from(new Set(faculties.map((f: { university_id: string }) => f.university_id)));

  const { data: universities } = await supabase
    .from("universities")
    .select("id, name, name_th")
    .in("id", universityIds)
    .order("name");

  const { data: programs } = await supabase
    .from("programs")
    .select("id, faculty_id, name, name_th, degree_type")
    .in("faculty_id", facultyIds)
    .order("name");

  return { universities: universities ?? [], faculties, programs: programs ?? [] };
}

export async function getRequirements(programId: string) {
  const { supabase } = await getCurrentAdmin();

  const { data, error } = await supabase
    .from("program_requirements")
    .select("*")
    .eq("program_id", programId)
    .maybeSingle();

  if (error) return { error: error.message };
  return { requirements: data };
}

export interface RequirementsPayload {
  min_gpa: number | null;
  required_subjects: Array<{ name: string; name_th: string | null }>;
  required_scores: Array<{ type: string; min: number }>;
  required_documents: Array<{ type: string; required: boolean }>;
  custom_questions: Array<{ question: string; type: string; required: boolean }>;
  scoring_rubric: Array<{ criterion: string; weight: number; max_score: number }>;
  deadline_round_1: string | null;
  deadline_round_2: string | null;
  deadline_round_4: string | null;
}

export async function saveRequirements(programId: string, data: RequirementsPayload) {
  const { supabase } = await getCurrentAdmin();

  const { data: existing } = await supabase
    .from("program_requirements")
    .select("id")
    .eq("program_id", programId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("program_requirements")
      .update(data)
      .eq("program_id", programId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("program_requirements")
      .insert({ program_id: programId, ...data });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/requirements");
  return { success: true };
}
