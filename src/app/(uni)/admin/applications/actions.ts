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
  return { supabase, profile };
}

export interface ScoreReq { type: string; min: number }
export interface DocReq { type: string; required: boolean }
export interface CustomQuestion { question: string; type: string; required: boolean }
export interface RubricItem { criterion: string; weight: number; max_score: number }

export interface ScreeningResult {
  level: "green" | "yellow" | "red" | "unknown";
  issues: Array<{ severity: "warn" | "fail"; message: string }>;
}

interface ProgramRequirements {
  min_gpa: number | null;
  required_scores: ScoreReq[];
  required_documents: DocReq[];
}

interface StudentData {
  gpa: number | null;
  scores: Array<{ score_type: string; score_value: number }>;
  documents: Array<{ doc_type: string }>;
}

// Pure function — compares student data against program requirements.
export function screenApplication(student: StudentData, reqs: ProgramRequirements | null): ScreeningResult {
  if (!reqs) return { level: "unknown", issues: [] };

  const issues: ScreeningResult["issues"] = [];

  // GPA check
  if (reqs.min_gpa != null && reqs.min_gpa > 0) {
    if (student.gpa == null) {
      issues.push({ severity: "fail", message: `Missing GPA (requires ≥ ${reqs.min_gpa.toFixed(2)})` });
    } else if (student.gpa < reqs.min_gpa) {
      const diff = reqs.min_gpa - student.gpa;
      if (diff <= 0.2) issues.push({ severity: "warn", message: `GPA ${student.gpa.toFixed(2)} is just below required ${reqs.min_gpa.toFixed(2)}` });
      else issues.push({ severity: "fail", message: `GPA ${student.gpa.toFixed(2)} below required ${reqs.min_gpa.toFixed(2)}` });
    }
  }

  // Score checks — pick highest matching student score per requirement
  for (const req of reqs.required_scores ?? []) {
    const studentScores = student.scores.filter((s) => s.score_type === req.type);
    if (studentScores.length === 0) {
      issues.push({ severity: "fail", message: `Missing ${req.type} (requires ≥ ${req.min})` });
      continue;
    }
    const best = Math.max(...studentScores.map((s) => s.score_value));
    if (best < req.min) {
      issues.push({ severity: "fail", message: `${req.type} ${best} below required ${req.min}` });
    }
  }

  // Document checks
  const submittedDocs = new Set(student.documents.map((d) => d.doc_type));
  for (const doc of reqs.required_documents ?? []) {
    if (doc.required && !submittedDocs.has(doc.type)) {
      issues.push({ severity: "fail", message: `Missing document: ${doc.type}` });
    }
  }

  const hasFail = issues.some((i) => i.severity === "fail");
  const hasWarn = issues.some((i) => i.severity === "warn");
  return {
    level: hasFail ? "red" : hasWarn ? "yellow" : "green",
    issues,
  };
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

  const program = Array.isArray(app.program) ? app.program[0] : app.program;
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
