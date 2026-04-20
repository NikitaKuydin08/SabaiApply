"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendSupportEmail } from "@/lib/email";
import { getFacultyPreset } from "@/lib/thai-faculties";
import { getProgramPreset } from "@/lib/thai-programs";

// ── Auth check (reused across actions) ──

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") throw new Error("Not authorized");
  return user;
}

// ── Dashboard Stats ──

export async function getPlatformStats() {
  await requireSuperAdmin();
  const db = createServiceClient();

  const [
    { count: uniCount },
    { count: userCount },
    { count: studentCount },
    { count: adminCount },
    { count: appCount },
  ] = await Promise.all([
    db.from("universities").select("*", { count: "exact", head: true }),
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    db.from("profiles").select("*", { count: "exact", head: true }).in("role", ["faculty_admin", "uni_admin"]),
    db.from("applications").select("*", { count: "exact", head: true }),
  ]);

  return {
    universities: uniCount ?? 0,
    totalUsers: userCount ?? 0,
    students: studentCount ?? 0,
    admins: adminCount ?? 0,
    applications: appCount ?? 0,
  };
}

// ── Universities ──

export async function getAllUniversities() {
  await requireSuperAdmin();
  const db = createServiceClient();

  const { data } = await db
    .from("universities")
    .select("*")
    .order("name");

  return data ?? [];
}

export async function createUniversity(name: string, nameTh: string | null, website: string | null) {
  await requireSuperAdmin();
  const db = createServiceClient();

  // Check for duplicates by name OR name_th (case-insensitive)
  const { data: existing } = await db
    .from("universities")
    .select("id, name, name_th")
    .or(nameTh ? `name.ilike.${name},name_th.eq.${nameTh}` : `name.ilike.${name}`);

  if (existing && existing.length > 0) {
    const dup = existing[0];
    return {
      error: `University already exists: "${dup.name}"${dup.name_th ? ` (${dup.name_th})` : ""}. Click on it in the list to manage it.`,
    };
  }

  const { data, error } = await db
    .from("universities")
    .insert({ name, name_th: nameTh, website })
    .select()
    .single();

  if (error) return { error: error.message };

  // Auto-add standard faculties if we have a preset for this university
  const preset = getFacultyPreset(name) ?? (nameTh ? getFacultyPreset(nameTh) : null);
  let facultiesCreated = 0;
  if (preset && data) {
    const { error: facultyError } = await db
      .from("faculties")
      .insert(preset.map((f) => ({
        university_id: data.id,
        name: f.name,
        name_th: f.name_th,
      })));
    if (!facultyError) facultiesCreated = preset.length;
  }

  return { success: true, university: data, facultiesCreated };
}

// Restore standard faculties — adds missing ones, skips duplicates
export async function restoreStandardFaculties(universityId: string) {
  await requireSuperAdmin();
  const db = createServiceClient();

  // Get the university name to find preset
  const { data: uni } = await db
    .from("universities")
    .select("name, name_th")
    .eq("id", universityId)
    .single();

  if (!uni) return { error: "University not found" };

  const preset = getFacultyPreset(uni.name) ?? (uni.name_th ? getFacultyPreset(uni.name_th) : null);
  if (!preset) return { error: "No standard faculty preset available for this university" };

  // Get existing faculties to avoid duplicates
  const { data: existing } = await db
    .from("faculties")
    .select("name, name_th")
    .eq("university_id", universityId);

  const existingNames = new Set(
    (existing ?? []).flatMap((f: { name: string; name_th: string | null }) => [
      f.name.toLowerCase(),
      ...(f.name_th ? [f.name_th] : []),
    ])
  );

  // Filter out faculties that already exist
  const toCreate = preset.filter(
    (p) => !existingNames.has(p.name.toLowerCase()) && !existingNames.has(p.name_th)
  );

  if (toCreate.length === 0) {
    return { success: true, created: 0, skipped: preset.length };
  }

  const { error } = await db
    .from("faculties")
    .insert(toCreate.map((f) => ({
      university_id: universityId,
      name: f.name,
      name_th: f.name_th,
    })));

  if (error) return { error: error.message };

  return {
    success: true,
    created: toCreate.length,
    skipped: preset.length - toCreate.length,
  };
}

export async function deleteUniversity(id: string) {
  await requireSuperAdmin();
  const db = createServiceClient();

  const { error } = await db.from("universities").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function getUniversityDetail(id: string) {
  await requireSuperAdmin();
  const db = createServiceClient();

  // University info
  const { data: university } = await db
    .from("universities")
    .select("*")
    .eq("id", id)
    .single();

  if (!university) return null;

  // Faculties with program count
  const { data: faculties } = await db
    .from("faculties")
    .select("*, programs(id)")
    .eq("university_id", id)
    .order("name");

  // Team members (anyone with university_id = this uni)
  const { data: teamMembers } = await db
    .from("profiles")
    .select("*, faculty_admins(faculty_id, faculties(name))")
    .eq("university_id", id)
    .neq("role", "student")
    .order("role");

  // Stats
  const facultyIds = (faculties ?? []).map((f: { id: string }) => f.id);

  let programCount = 0;
  let applicationCount = 0;
  let pendingCount = 0;

  if (facultyIds.length > 0) {
    const { count: pc } = await db
      .from("programs")
      .select("*", { count: "exact", head: true })
      .in("faculty_id", facultyIds);
    programCount = pc ?? 0;

    const { data: programIds } = await db
      .from("programs")
      .select("id")
      .in("faculty_id", facultyIds);

    if (programIds && programIds.length > 0) {
      const pIds = programIds.map((p: { id: string }) => p.id);

      const { count: ac } = await db
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("program_id", pIds);
      applicationCount = ac ?? 0;

      const { count: pendc } = await db
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("program_id", pIds)
        .eq("status", "submitted");
      pendingCount = pendc ?? 0;
    }
  }

  return {
    university,
    faculties: (faculties ?? []).map((f: Record<string, unknown>) => ({
      ...f,
      programCount: Array.isArray(f.programs) ? f.programs.length : 0,
    })),
    teamMembers: teamMembers ?? [],
    stats: { programCount, applicationCount, pendingCount },
  };
}

// ── Users ──

export async function getAllUsers() {
  await requireSuperAdmin();
  const db = createServiceClient();

  const { data } = await db
    .from("profiles")
    .select("*, faculty_admins(faculty_id, faculties(name, universities(name)))")
    .order("created_at", { ascending: false });

  if (!data) return [];

  // For students, get application counts
  const studentIds = data
    .filter((u: Record<string, unknown>) => u.role === "student")
    .map((u: Record<string, unknown>) => u.id as string);

  let appCounts: Record<string, number> = {};

  if (studentIds.length > 0) {
    // Get student_profiles IDs for these users
    const { data: studentProfiles } = await db
      .from("student_profiles")
      .select("id, user_id")
      .in("user_id", studentIds);

    if (studentProfiles && studentProfiles.length > 0) {
      const spIds = studentProfiles.map((sp: { id: string }) => sp.id);

      const { data: apps } = await db
        .from("applications")
        .select("student_id")
        .in("student_id", spIds);

      if (apps) {
        // Count apps per student_profile_id, then map back to user_id
        const spToUser: Record<string, string> = {};
        for (const sp of studentProfiles) {
          spToUser[sp.id] = sp.user_id;
        }

        for (const app of apps) {
          const userId = spToUser[app.student_id];
          if (userId) {
            appCounts[userId] = (appCounts[userId] ?? 0) + 1;
          }
        }
      }
    }
  }

  return data.map((u: Record<string, unknown>) => ({
    ...u,
    applicationCount: appCounts[u.id as string] ?? 0,
  }));
}

export async function getUserDetail(userId: string) {
  await requireSuperAdmin();
  const db = createServiceClient();

  // Profile
  const { data: profile } = await db
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  // Faculty assignments
  const { data: facultyAssignments } = await db
    .from("faculty_admins")
    .select("*, faculties(name, name_th, universities(name, name_th))")
    .eq("user_id", userId);

  // Invites (who invited this person)
  const { data: invites } = await db
    .from("invites")
    .select("*, faculties(name)")
    .eq("email", profile.email)
    .order("created_at", { ascending: false });

  // Student-specific data
  let studentProfile = null;
  let education = null;
  let scores: Record<string, unknown>[] = [];
  let documents: Record<string, unknown>[] = [];
  let applications: Record<string, unknown>[] = [];

  if (profile.role === "student") {
    const { data: sp } = await db
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    studentProfile = sp;

    if (sp) {
      const [eduResult, scoresResult, docsResult, appsResult] = await Promise.all([
        db.from("student_education").select("*").eq("student_id", sp.id).single(),
        db.from("student_scores").select("*").eq("student_id", sp.id).order("created_at", { ascending: false }),
        db.from("student_documents").select("*").eq("student_id", sp.id).order("created_at", { ascending: false }),
        db.from("applications")
          .select("*, programs(name, name_th, faculties(name, universities(name)))")
          .eq("student_id", sp.id)
          .order("submitted_at", { ascending: false }),
      ]);

      education = eduResult.data;
      scores = scoresResult.data ?? [];
      documents = docsResult.data ?? [];
      applications = appsResult.data ?? [];
    }
  }

  return {
    profile,
    facultyAssignments: facultyAssignments ?? [],
    invites: invites ?? [],
    studentProfile,
    education,
    scores,
    documents,
    applications,
  };
}

export async function updateUserRole(userId: string, newRole: string, universityId?: string) {
  await requireSuperAdmin();
  const db = createServiceClient();

  const updateData: Record<string, unknown> = { role: newRole };
  if (universityId) updateData.university_id = universityId;

  const { error } = await db
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function sendPasswordReset(email: string) {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "https://sabaiapply.com" : "http://localhost:3000"}/admin/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function sendSupportEmailToUser(to: string, subject: string, message: string) {
  await requireSuperAdmin();
  const result = await sendSupportEmail(to, subject, message);
  return result;
}

// ── Faculty Detail & Programs ──

export async function getFacultyDetail(facultyId: string) {
  await requireSuperAdmin();
  const db = createServiceClient();

  const { data: faculty } = await db
    .from("faculties")
    .select("*, universities(id, name, name_th)")
    .eq("id", facultyId)
    .single();

  if (!faculty) return null;

  const { data: programs } = await db
    .from("programs")
    .select("*")
    .eq("faculty_id", facultyId)
    .order("name");

  return { faculty, programs: programs ?? [] };
}

export async function restoreStandardPrograms(facultyId: string) {
  await requireSuperAdmin();
  const db = createServiceClient();

  // Get the faculty + university name to find preset
  const { data: faculty } = await db
    .from("faculties")
    .select("name, universities(name, name_th)")
    .eq("id", facultyId)
    .single();

  if (!faculty) return { error: "Faculty not found" };

  const universities = faculty.universities as unknown as { name: string; name_th: string | null } | null;
  const uniName = universities?.name ?? "";

  const preset = getProgramPreset(faculty.name, uniName)
    ?? (universities?.name_th ? getProgramPreset(faculty.name, universities.name_th) : null);

  if (!preset) return { error: "No standard program preset available for this faculty" };

  // Get existing programs to avoid duplicates
  const { data: existing } = await db
    .from("programs")
    .select("name, name_th")
    .eq("faculty_id", facultyId);

  const existingNames = new Set(
    (existing ?? []).flatMap((p: { name: string; name_th: string | null }) => [
      p.name.toLowerCase(),
      ...(p.name_th ? [p.name_th] : []),
    ])
  );

  // Filter out duplicates
  const toCreate = preset.filter(
    (p) => !existingNames.has(p.name.toLowerCase()) && !existingNames.has(p.name_th)
  );

  if (toCreate.length === 0) {
    return { success: true, created: 0, skipped: preset.length };
  }

  const { error } = await db
    .from("programs")
    .insert(toCreate.map((p) => ({
      faculty_id: facultyId,
      name: p.name,
      name_th: p.name_th,
      degree_type: p.degree_type ?? "bachelor",
      is_international: p.is_international ?? false,
    })));

  if (error) return { error: error.message };

  return {
    success: true,
    created: toCreate.length,
    skipped: preset.length - toCreate.length,
  };
}

export async function deleteProgram(programId: string) {
  await requireSuperAdmin();
  const db = createServiceClient();

  const { error } = await db.from("programs").delete().eq("id", programId);
  if (error) return { error: error.message };
  return { success: true };
}
