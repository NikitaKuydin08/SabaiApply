import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all student data in parallel
  const { data: profile, error: profileError } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching student profile:", profileError);
  }

  const studentId = profile?.id;

  const [familyRes, educationRes, scoresRes, documentsRes, portfolioItemsRes, universitiesRes, applicationsRes] = await Promise.all([
    studentId
      ? supabase.from("student_family").select("*").eq("student_id", studentId).single()
      : { data: null },
    studentId
      ? supabase.from("student_education").select("*").eq("student_id", studentId).limit(1).single()
      : { data: null },
    studentId
      ? supabase.from("student_scores").select("*").eq("student_id", studentId)
      : { data: null },
    studentId
      ? supabase.from("student_documents").select("*").eq("student_id", studentId)
      : { data: null },
    studentId
      ? supabase.from("portfolio_items").select("*").eq("student_id", studentId).order("sort_order")
      : { data: null },
    supabase
      .from("universities")
      .select(`
        id, name, name_th, website, logo_url,
        faculties(
          id, name, name_th,
          programs(id, name, name_th, degree_type, is_international, tuition_per_semester)
        )
      `)
      .order("name"),
    studentId
      ? supabase
          .from("applications")
          .select(`
            id, status, round, submitted_at, program_id,
            program:programs!inner(
              id,
              faculty:faculties!inner(id, university_id)
            )
          `)
          .eq("student_id", studentId)
      : { data: null },
  ]);

  type ProgramRow = {
    id: string;
    name: string;
    name_th: string | null;
    degree_type: string | null;
    is_international: boolean | null;
    tuition_per_semester: number | null;
  };
  type FacultyRow = {
    id: string;
    name: string;
    name_th: string | null;
    programs: ProgramRow[];
  };
  type UniversityRow = {
    id: string;
    name: string;
    name_th: string | null;
    website: string | null;
    logo_url: string | null;
    faculties: FacultyRow[];
  };

  const universities = (universitiesRes.data ?? []).map((u: UniversityRow) => ({
    id: u.id,
    name: u.name,
    name_th: u.name_th ?? "",
    website: u.website,
    logo_url: u.logo_url,
    facultyCount: u.faculties?.length ?? 0,
    programCount: (u.faculties ?? []).reduce((sum, f) => sum + (f.programs?.length ?? 0), 0),
    faculties: (u.faculties ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      name_th: f.name_th ?? "",
      programs: (f.programs ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        name_th: p.name_th ?? "",
        degree_type: p.degree_type,
        is_international: p.is_international ?? false,
        tuition_per_semester: p.tuition_per_semester,
      })),
    })),
  }));

  // Build per-university submission map from the student's actual applications.
  // A university is "submitted" if any of its programs has an application row.
  type ApplicationRow = {
    id: string;
    status: string;
    round: string;
    submitted_at: string;
    program_id: string;
    program: { id: string; faculty: { id: string; university_id: string } | { id: string; university_id: string }[] } | { id: string; faculty: { id: string; university_id: string } | { id: string; university_id: string }[] }[];
  };
  const applications = (applicationsRes.data ?? []) as ApplicationRow[];
  const submittedUniIds: Record<string, { applicationId: string; status: string; submittedAt: string }> = {};
  for (const a of applications) {
    const program = Array.isArray(a.program) ? a.program[0] : a.program;
    const faculty = program ? (Array.isArray(program.faculty) ? program.faculty[0] : program.faculty) : null;
    const uniId = faculty?.university_id;
    if (!uniId) continue;
    // Keep the most recent if multiple exist (e.g. different rounds).
    const prev = submittedUniIds[uniId];
    if (!prev || a.submitted_at > prev.submittedAt) {
      submittedUniIds[uniId] = { applicationId: a.id, status: a.status, submittedAt: a.submitted_at };
    }
  }

  return (
    <DashboardClient
      user={{ email: user.email!, id: user.id }}
      profile={profile}
      family={familyRes.data}
      education={educationRes.data}
      scores={scoresRes.data ?? []}
      documents={documentsRes.data ?? []}
      portfolioItems={portfolioItemsRes.data ?? []}
      universities={universities}
      submittedApplications={submittedUniIds}
    />
  );
}
