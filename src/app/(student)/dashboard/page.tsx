import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Dashboard</h1>
          <p className="text-sm text-[#666] mt-1">Welcome, {user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardCard
          title="My Profile"
          description="Personal info, education & test scores"
          href="/profile"
        />
        <DashboardCard
          title="My Portfolio"
          description="Build or import your portfolio"
          href="/portfolio"
        />
        <DashboardCard
          title="Browse Programs"
          description="Explore universities & check eligibility"
          href="/programs"
        />
        <DashboardCard
          title="My Applications"
          description="Track your application statuses"
          href="/applications"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a
      href={href}
      className="block rounded-xl border border-[#e8e8e8] p-6 hover:border-[#F4C430] hover:shadow-sm transition-all"
    >
      <h3 className="text-base font-semibold text-[#1a1a1a]">{title}</h3>
      <p className="text-sm text-[#666] mt-1">{description}</p>
    </a>
  );
}
