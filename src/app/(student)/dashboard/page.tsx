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

  const [familyRes, educationRes, scoresRes, documentsRes, portfolioItemsRes, universitiesRes] = await Promise.all([
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
      .select("id, name, name_th, website, faculties(id, programs(id))")
      .order("name"),
  ]);

  type UniversityRow = {
    id: string;
    name: string;
    name_th: string | null;
    website: string | null;
    faculties: { id: string; programs: { id: string }[] }[];
  };

  const universities = (universitiesRes.data ?? []).map((u: UniversityRow) => ({
    id: u.id,
    name: u.name,
    name_th: u.name_th ?? "",
    website: u.website,
    facultyCount: u.faculties?.length ?? 0,
    programCount: (u.faculties ?? []).reduce((sum, f) => sum + (f.programs?.length ?? 0), 0),
  }));

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
    />
  );
}
