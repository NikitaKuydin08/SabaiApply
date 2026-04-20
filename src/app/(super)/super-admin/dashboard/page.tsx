import { getPlatformStats } from "../actions";

export default async function SuperDashboardPage() {
  const stats = await getPlatformStats();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a]">Platform Dashboard</h1>
      <p className="mt-2 text-base text-[#666]">Overview of the entire SabaiApply platform</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">Universities</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{stats.universities}</p>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">Total Users</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{stats.totalUsers}</p>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">Students</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{stats.students}</p>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">Admins</p>
          <p className="text-3xl font-bold text-[#F4C430] mt-2">{stats.admins}</p>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-6">
          <p className="text-base font-medium text-[#999]">Applications</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-2">{stats.applications}</p>
        </div>
      </div>
    </div>
  );
}
