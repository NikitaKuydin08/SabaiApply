import { getFacultyDetail } from "../../actions";
import { getProgramPreset } from "@/lib/thai-programs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RestoreProgramsButton, DeleteProgramButton } from "./restore-programs-button";

export default async function FacultyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getFacultyDetail(id);

  if (!data) redirect("/super-admin/universities");

  const { faculty, programs } = data;
  const uni = faculty.universities as unknown as { id: string; name: string; name_th: string | null };

  const hasPreset = !!getProgramPreset(faculty.name, uni?.name)
    || !!(uni?.name_th && getProgramPreset(faculty.name, uni.name_th));

  return (
    <div>
      <Link href={`/super-admin/universities/${uni.id}`} className="text-base text-[#F4C430] hover:underline mb-4 inline-block">
        &larr; {uni.name}
      </Link>

      <h1 className="text-3xl font-bold text-[#1a1a1a]">{faculty.name}</h1>
      {faculty.name_th ? <p className="text-base text-[#666] mt-1">{String(faculty.name_th)}</p> : null}

      {/* Programs */}
      <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1a1a1a]">
            Programs <span className="text-base font-normal text-[#999]">({programs.length})</span>
          </h2>
          {hasPreset && <RestoreProgramsButton facultyId={faculty.id} />}
        </div>

        {programs.length === 0 ? (
          <p className="text-base text-[#999]">
            No programs set up yet.{hasPreset ? " Click \"Restore Standard Programs\" above to add the standard programs." : ""}
          </p>
        ) : (
          <div className="space-y-2">
            {programs.map((program: Record<string, unknown>) => (
              <div key={program.id as string} className="flex items-center justify-between rounded-lg border border-[#efefef] px-4 py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium text-[#1a1a1a]">{String(program.name)}</p>
                    {program.is_international ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
                        International
                      </span>
                    ) : null}
                  </div>
                  {program.name_th ? <p className="text-sm text-[#666]">{String(program.name_th)}</p> : null}
                  <div className="mt-1 flex gap-4 text-sm text-[#999]">
                    <span>Degree: {String(program.degree_type ?? "bachelor")}</span>
                    {(program.seats_round_1 as number) > 0 && <span>R1: {String(program.seats_round_1)} seats</span>}
                    {(program.seats_round_2 as number) > 0 && <span>R2: {String(program.seats_round_2)} seats</span>}
                  </div>
                </div>
                <DeleteProgramButton programId={program.id as string} programName={String(program.name)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
