"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { screenApplication, type ProgramRequirements } from "./screening";

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
  return { supabase, profile };
}

export async function getApplications() {
  const { supabase } = await getCurrentAdmin();

  // RLS scopes results to admin's role
  const { data: apps, error } = await supabase
    .from("applications")
    .select(`
      id, status, round, submitted_at, total_score, reviewed_by,
      program:programs!inner(
        id, name, name_th, faculty_id,
        faculty:faculties!inner(id, name, name_th, university_id)
      ),
      student:student_profiles!inner(
        id, first_name, last_name, first_name_th, last_name_th,
        education:student_education(gpa, school_name),
        scores:student_scores(score_type, score_value),
        documents:student_documents(doc_type)
      )
    `)
    .order("submitted_at", { ascending: false });

  if (error) return { error: error.message, applications: [] };
  if (!apps) return { applications: [] };

  // Fetch requirements for unique programs
  const programIds = Array.from(new Set(apps.map((a: { program: { id: string } | { id: string }[] }) => {
    const p = Array.isArray(a.program) ? a.program[0] : a.program;
    return p.id;
  })));
  const { data: reqRows } = await supabase
    .from("program_requirements")
    .select("program_id, min_gpa, required_scores, required_documents")
    .in("program_id", programIds);

  const reqsByProgram = new Map<string, ProgramRequirements>();
  for (const r of reqRows ?? []) {
    reqsByProgram.set(r.program_id, {
      min_gpa: r.min_gpa,
      required_scores: r.required_scores ?? [],
      required_documents: r.required_documents ?? [],
    });
  }

  const enriched = apps.map((a) => {
    const program = Array.isArray(a.program) ? a.program[0] : a.program;
    const student = Array.isArray(a.student) ? a.student[0] : a.student;
    const education = Array.isArray(student.education) ? student.education[0] : student.education;

    const screen = screenApplication(
      {
        gpa: education?.gpa ?? null,
        scores: student.scores ?? [],
        documents: student.documents ?? [],
      },
      reqsByProgram.get(program.id) ?? null,
    );

    return {
      id: a.id,
      status: a.status,
      round: a.round,
      submitted_at: a.submitted_at,
      total_score: a.total_score,
      student_id: student.id,
      student_name: [student.first_name, student.last_name].filter(Boolean).join(" ") || "—",
      student_name_th: [student.first_name_th, student.last_name_th].filter(Boolean).join(" ") || null,
      school_name: education?.school_name ?? null,
      gpa: education?.gpa ?? null,
      program_id: program.id,
      program_name: program.name,
      program_name_th: program.name_th,
      faculty_id: program.faculty_id,
      screen,
    };
  });

  return { applications: enriched };
}

export async function getApplication(id: string) {
  const { supabase } = await getCurrentAdmin();

  const { data: app, error } = await supabase
    .from("applications")
    .select(`
      id, status, round, submitted_at, total_score, custom_answers, notes, scores, portfolio_id,
      program:programs!inner(
        id, name, name_th, faculty_id, degree_type,
        faculty:faculties!inner(id, name, name_th, university_id,
          university:universities!inner(id, name, name_th)
        )
      ),
      student:student_profiles!inner(
        id, first_name, last_name, first_name_th, last_name_th,
        phone, line_id, nationality, gender, photo_url, user_id,
        education:student_education(id, school_name, gpa, graduation_year, transcript_url),
        scores:student_scores(id, score_type, score_value, test_date),
        documents:student_documents(id, doc_type, file_url, file_name)
      ),
      portfolio:student_portfolios(id, title, source, external_url, pdf_url)
    `)
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  if (!app) return { error: "Not found" };

  // Fetch student email via profiles
  const student = Array.isArray(app.student) ? app.student[0] : app.student;
  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", student.user_id)
    .single();

  const rawProgram = Array.isArray(app.program) ? app.program[0] : app.program;
  const rawFaculty = Array.isArray(rawProgram.faculty) ? rawProgram.faculty[0] : rawProgram.faculty;
  const rawUniversity = Array.isArray(rawFaculty.university) ? rawFaculty.university[0] : rawFaculty.university;
  const program = {
    ...rawProgram,
    faculty: { ...rawFaculty, university: rawUniversity },
  };
  const { data: reqRow } = await supabase
    .from("program_requirements")
    .select("*")
    .eq("program_id", program.id)
    .maybeSingle();

  const education = Array.isArray(student.education) ? student.education[0] : student.education;
  const screen = screenApplication(
    {
      gpa: education?.gpa ?? null,
      scores: student.scores ?? [],
      documents: student.documents ?? [],
    },
    reqRow
      ? {
          min_gpa: reqRow.min_gpa,
          required_scores: reqRow.required_scores ?? [],
          required_documents: reqRow.required_documents ?? [],
        }
      : null,
  );

  return {
    application: {
      ...app,
      program,
      student: { ...student, email: studentProfile?.email ?? null },
      requirements: reqRow,
      screen,
    },
  };
}

const ALLOWED_STATUSES = [
  "submitted", "under_review", "shortlisted", "interview_scheduled",
  "accepted", "waitlisted", "rejected", "confirmed", "withdrawn",
];

export async function updateApplicationStatus(id: string, status: string) {
  const { supabase, profile } = await getCurrentAdmin();
  if (!ALLOWED_STATUSES.includes(status)) return { error: "Invalid status" };

  const { error } = await supabase
    .from("applications")
    .update({ status, reviewed_by: profile.id })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  return { success: true };
}

export async function saveApplicationScoring(id: string, scores: Record<string, number>, totalScore: number | null) {
  const { supabase, profile } = await getCurrentAdmin();

  const { error } = await supabase
    .from("applications")
    .update({ scores, total_score: totalScore, reviewed_by: profile.id })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/applications/${id}`);
  return { success: true };
}

export async function saveApplicationNotes(id: string, notes: string) {
  const { supabase, profile } = await getCurrentAdmin();

  const { error } = await supabase
    .from("applications")
    .update({ notes, reviewed_by: profile.id })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/applications/${id}`);
  return { success: true };
}
