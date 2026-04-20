import { getAdminProfile } from "./actions";
import { AdminLayoutClient } from "./layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminContext = await getAdminProfile();

  if (!adminContext) {
    return <>{children}</>;
  }

  return (
    <AdminLayoutClient
      fullName={adminContext.profile.full_name}
      email={adminContext.profile.email}
      role={adminContext.profile.role}
      universityName={adminContext.university?.name ?? null}
    >
      {children}
    </AdminLayoutClient>
  );
}
