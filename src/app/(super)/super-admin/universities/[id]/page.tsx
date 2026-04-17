import { getUniversityDetail } from "../../actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function UniversityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getUniversityDetail(id);

  if (!data) redirect("/super-admin/universities");

  const { university, faculties, teamMembers, stats } = data;

  function getRoleBadge(role: string) {
    switch (role) {
      case "uni_admin": return "bg-blue-50 text-blue-600";
      case "faculty_admin": return "bg-[#F4C430]/10 text-[#1a1a1a]";
      default: return "bg-gray-100 text-gray-600";
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "uni_admin": return "Uni Admin";
      case "faculty_admin": return "Faculty Team";
      default: return role;
    }
  }

  return (
    <div>
      <Link href="/super-admin/universities" className="text-base text-[#F4C430] hover:underline mb-4 inline-block">
        &larr; All Universities
      </Link>

      <h1 className="text-3xl font-bold text-[#1a1a1a]">{university.name}</h1>
      {university.name_th && <p className="text-base text-[#666] mt-1">{university.name_th}</p>}
      {university.website && <p className="text-sm text-[#999] mt-1">{university.website}</p>}

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-5">
          <p className="text-sm font-medium text-[#999]">Programs</p>
          <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{stats.programCount}</p>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-5">
          <p className="text-sm font-medium text-[#999]">Applications</p>
          <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{stats.applicationCount}</p>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-5">
          <p className="text-sm font-medium text-[#999]">Pending Review</p>
          <p className="text-2xl font-bold text-[#F4C430] mt-1">{stats.pendingCount}</p>
        </div>
      </div>

      {/* Faculties */}
      <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
          Faculties <span className="text-base font-normal text-[#999]">({faculties.length})</span>
        </h2>
        {faculties.length === 0 ? (
          <p className="text-base text-[#999]">No faculties set up yet.</p>
        ) : (
          <div className="space-y-2">
            {faculties.map((faculty: Record<string, unknown>) => (
              <div key={faculty.id as string} className="flex items-center justify-between rounded-lg border border-[#efefef] px-4 py-4">
                <div>
                  <p className="text-base font-medium text-[#1a1a1a]">{String(faculty.name)}</p>
                  {faculty.name_th ? <p className="text-sm text-[#666]">{String(faculty.name_th)}</p> : null}
                </div>
                <span className="text-sm text-[#999]">
                  {String(faculty.programCount)} {(faculty.programCount as number) === 1 ? "program" : "programs"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
          Team Members <span className="text-base font-normal text-[#999]">({teamMembers.length})</span>
        </h2>
        {teamMembers.length === 0 ? (
          <p className="text-base text-[#999]">No team members assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {teamMembers.map((member: Record<string, unknown>) => (
              <Link key={member.id as string} href={`/super-admin/users/${member.id}`}>
                <div className="flex items-center justify-between rounded-lg border border-[#efefef] px-4 py-4 hover:border-[#F4C430]/50 transition-colors cursor-pointer mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#F4C430]/10 flex items-center justify-center text-base font-semibold text-[#1a1a1a]">
                      {((member.full_name as string) ?? (member.email as string)).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-medium text-[#1a1a1a]">{(member.full_name as string) || (member.email as string)}</p>
                      <p className="text-sm text-[#666]">{member.email as string}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getRoleBadge(member.role as string)}`}>
                      {getRoleLabel(member.role as string)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
