import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get or create student profile
  let { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    const { data: newProfile } = await supabase
      .from("student_profiles")
      .insert({ user_id: user.id })
      .select()
      .single();
    profile = newProfile;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <ProfileForm profile={profile!} />
    </div>
  );
}
