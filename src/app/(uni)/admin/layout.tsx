import { redirect } from "next/navigation";
import { getAdminProfile } from "./actions";
import { AdminLayoutClient } from "./layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getAdminProfile();

  // If no profile (not logged in or student), let middleware handle redirect
  // But for pages like login/register, profile will be null and that's fine
  if (!profile) {
    return <>{children}</>;
  }

  return (
    <AdminLayoutClient fullName={profile.full_name} email={profile.email}>
      {children}
    </AdminLayoutClient>
  );
}
