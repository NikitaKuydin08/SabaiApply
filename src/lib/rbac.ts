import type { UserRole } from "@/types/database";

export function canInviteTeamMembers(role: UserRole): boolean {
  return role === "super_admin" || role === "uni_admin";
}

export function canManageUniversity(role: UserRole): boolean {
  return role === "super_admin" || role === "uni_admin";
}

export function canManageAllUniversities(role: UserRole): boolean {
  return role === "super_admin";
}

export function canViewAllData(role: UserRole): boolean {
  return role === "super_admin";
}

export function canManageFaculty(
  role: UserRole,
  facultyId: string,
  assignedFacultyIds: string[]
): boolean {
  if (role === "super_admin" || role === "uni_admin") return true;
  return assignedFacultyIds.includes(facultyId);
}

export function canAccessTeamPage(role: UserRole): boolean {
  return role === "super_admin" || role === "uni_admin";
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}
