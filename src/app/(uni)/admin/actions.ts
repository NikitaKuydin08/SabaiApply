"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { AdminContext, University, Faculty } from "@/types/database";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function getAdminProfile(): Promise<AdminContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "student") return null;

  const isSuperAdmin = profile.role === "super_admin";

  let university: University | null = null;
  let faculties: Faculty[] = [];
  let assignedFacultyIds: string[] = [];

  if (isSuperAdmin) {
    // Super admin: no scoping needed at layout level
    // Individual pages load data as needed
  } else if (profile.role === "uni_admin" && profile.university_id) {
    // Uni admin: load their university + all its faculties
    const { data: uni } = await supabase
      .from("universities")
      .select("*")
      .eq("id", profile.university_id)
      .single();
    university = uni;

    const { data: facs } = await supabase
      .from("faculties")
      .select("*")
      .eq("university_id", profile.university_id)
      .order("name");
    faculties = facs ?? [];
  } else if (profile.role === "faculty_admin") {
    // Faculty admin: load only their assigned faculties
    const { data: assignments } = await supabase
      .from("faculty_admins")
      .select("faculty_id, faculties(*, universities(*))")
      .eq("user_id", user.id);

    if (assignments && assignments.length > 0) {
      assignedFacultyIds = assignments.map((a: Record<string, unknown>) => a.faculty_id as string);
      faculties = assignments.map((a: Record<string, unknown>) => a.faculties as unknown as Faculty);

      // Derive university from first faculty
      const firstFaculty = assignments[0].faculties as unknown as Faculty & { universities: University };
      university = firstFaculty?.universities ?? null;
    }
  }

  return { profile, university, faculties, assignedFacultyIds, isSuperAdmin };
}
