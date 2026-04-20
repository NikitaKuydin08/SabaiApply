import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/app/(uni)/admin/layout-client";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "super_admin") {
    redirect("/admin/dashboard");
  }

  return (
    <AdminLayoutClient
      fullName={profile.full_name}
      email={profile.email}
      role={profile.role}
      universityName={null}
    >
      {children}
    </AdminLayoutClient>
  );
}
