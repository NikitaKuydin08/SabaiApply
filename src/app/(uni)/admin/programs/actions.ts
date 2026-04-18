"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Get current admin context (role + university + assigned faculties)
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

  // For faculty admins, get assigned faculty IDs
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

// List all programs the current admin can see, grouped by faculty
export async function getProgramsForAdmin() {
  const { supabase, profile, assignedFacultyIds } = await getCurrentAdmin();

  // Get faculty list based on role
  let facultyQuery = supabase
    .from("faculties")
    .select("id, name, name_th, university_id")
    .order("name");

  if (profile.role === "super_admin") {
    // super admin sees all
  } else if (profile.role === "uni_admin") {
    if (!profile.university_id) return { faculties: [], programs: [] };
    facultyQuery = facultyQuery.eq("university_id", profile.university_id);
  } else if (profile.role === "faculty_admin") {
    if (assignedFacultyIds.length === 0) return { faculties: [], programs: [] };
    facultyQuery = facultyQuery.in("id", assignedFacultyIds);
  }

  const { data: faculties } = await facultyQuery;
  if (!faculties || faculties.length === 0) return { faculties: [], programs: [] };

  const facultyIds = faculties.map((f: { id: string }) => f.id);

  const { data: programs } = await supabase
    .from("programs")
    .select("*")
    .in("faculty_id", facultyIds)
    .order("name");

  return { faculties, programs: programs ?? [] };
}

export async function createProgram(data: {
  faculty_id: string;
  name: string;
  name_th: string | null;
  degree_type: string;
  seats_round_1: number;
  seats_round_2: number;
  seats_round_4: number;
  tuition_per_semester: number | null;
  description: string | null;
  is_international: boolean;
}) {
  const { supabase, profile, assignedFacultyIds } = await getCurrentAdmin();

  // Verify the faculty_id is in admin's scope
  if (profile.role === "faculty_admin" && !assignedFacultyIds.includes(data.faculty_id)) {
    return { error: "Not authorized to add programs to this faculty" };
  }

  if (profile.role === "uni_admin") {
    const { data: faculty } = await supabase
      .from("faculties")
      .select("university_id")
      .eq("id", data.faculty_id)
      .single();
    if (!faculty || faculty.university_id !== profile.university_id) {
      return { error: "Not authorized to add programs to this faculty" };
    }
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from("programs")
    .select("id")
    .eq("faculty_id", data.faculty_id)
    .ilike("name", data.name)
    .maybeSingle();

  if (existing) return { error: `Program "${data.name}" already exists in this faculty` };

  const { error } = await supabase.from("programs").insert(data);
  if (error) return { error: error.message };

  revalidatePath("/admin/programs");
  return { success: true };
}

export async function updateProgram(programId: string, data: Partial<{
  name: string;
  name_th: string | null;
  degree_type: string;
  seats_round_1: number;
  seats_round_2: number;
  seats_round_4: number;
  tuition_per_semester: number | null;
  description: string | null;
  is_international: boolean;
}>) {
  const { supabase } = await getCurrentAdmin();

  // RLS will enforce scope
  const { error } = await supabase.from("programs").update(data).eq("id", programId);
  if (error) return { error: error.message };

  revalidatePath("/admin/programs");
  return { success: true };
}

export async function deleteProgram(programId: string) {
  const { supabase } = await getCurrentAdmin();

  // RLS will enforce scope
  const { error } = await supabase.from("programs").delete().eq("id", programId);
  if (error) return { error: error.message };

  revalidatePath("/admin/programs");
  return { success: true };
}
