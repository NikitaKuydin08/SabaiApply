import { createClient } from "@/lib/supabase/server";

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
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a]">Dashboard</h1>
      <p className="mt-2 text-base text-[#666]">
        Welcome back, {user?.email}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">Programs</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{programCount ?? 0}</p>
        </div>

        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">Total Applications</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{applicationCount ?? 0}</p>
        </div>

        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">Pending Review</p>
          <p className="text-3xl font-bold text-[#F4C430] mt-2">{pendingCount ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
