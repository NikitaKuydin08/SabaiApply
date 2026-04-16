"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createUniversity(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const name_th = formData.get("name_th") as string;
  const website = formData.get("website") as string;

  const { error } = await supabase.from("universities").insert({
    name,
    name_th: name_th || null,
    website: website || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/university");
  return { success: true };
}

export async function updateUniversity(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const name_th = formData.get("name_th") as string;
  const website = formData.get("website") as string;

  const { error } = await supabase
    .from("universities")
    .update({
      name,
      name_th: name_th || null,
      website: website || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/university");
  return { success: true };
}

export async function createFaculty(universityId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const name_th = formData.get("name_th") as string;

  const { data: faculty, error } = await supabase
    .from("faculties")
    .insert({
      university_id: universityId,
      name,
      name_th: name_th || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Link current user as primary admin for this faculty
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && faculty) {
    await supabase.from("faculty_admins").upsert({
      user_id: user.id,
      faculty_id: faculty.id,
      is_primary: true,
    });
  }

  revalidatePath("/admin/university");
  return { success: true };
}

export async function updateFaculty(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const name_th = formData.get("name_th") as string;

  const { error } = await supabase
    .from("faculties")
    .update({
      name,
      name_th: name_th || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/university");
  return { success: true };
}

export async function deleteFaculty(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("faculties").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/university");
  return { success: true };
}
