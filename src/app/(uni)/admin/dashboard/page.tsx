import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { count: programCount },
    { count: applicationCount },
    { count: pendingCount },
  ] = await Promise.all([
    supabase.from("programs").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted"),
  ]);

  return (
    <DashboardClient
      email={user?.email}
      programCount={programCount ?? 0}
      applicationCount={applicationCount ?? 0}
      pendingCount={pendingCount ?? 0}
    />
  );
}
