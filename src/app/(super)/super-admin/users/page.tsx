"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllUsers, updateUserRole } from "../actions";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  university_id: string | null;
  created_at: string;
  applicationCount: number;
  faculty_admins: Array<{
    faculty_id: string;
    faculties: {
      name: string;
      universities: { name: string };
    };
  }>;
}

export default function SuperUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data as UserRow[]);
    setLoading(false);
  }

  async function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>, userId: string) {
    e.stopPropagation();
    const result = await updateUserRole(userId, e.target.value);
    if (result.error) { alert(result.error); return; }
    await loadData();
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "super_admin": return "bg-red-50 text-red-600";
      case "uni_admin": return "bg-blue-50 text-blue-600";
      case "faculty_admin": return "bg-[#F4C430]/10 text-[#1a1a1a]";
      case "student": return "bg-green-50 text-green-600";
      default: return "bg-gray-100 text-gray-600";
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "super_admin": return "Super Admin";
      case "uni_admin": return "Uni Admin";
      case "faculty_admin": return "Faculty Team";
      case "student": return "Student";
      default: return role;
    }
  }

  const filtered = users.filter((u) => {
    // Role filter
    if (roleFilter !== "all" && u.role !== roleFilter) return false;

    // Search filter
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a]">All Users</h1>
      <p className="mt-2 text-base text-[#666]">Manage all registered users ({users.length})</p>

      {/* Filters */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
        >
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="uni_admin">Uni Admin</option>
          <option value="faculty_admin">Faculty Team</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Users List — clickable rows */}
      <div className="mt-4 rounded-xl border border-[#e8e8e8] bg-white overflow-hidden">
        {loading ? (
          <p className="p-6 text-[#666]">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-[#999]">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-[#e0e0e0] text-left text-[#999] bg-[#fafafa]">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Details</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/super-admin/users/${user.id}`} className="text-[#1a1a1a] font-medium hover:text-[#F4C430] transition-colors">
                        {user.full_name || "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-[#666]">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#666]">
                      {user.role === "student" && user.applicationCount > 0 && (
                        <span className="inline-block rounded-full bg-[#F4C430]/10 px-3 py-1 text-sm font-medium text-[#1a1a1a]">
                          {user.applicationCount} {user.applicationCount === 1 ? "application" : "applications"}
                        </span>
                      )}
                      {user.role === "student" && user.applicationCount === 0 && (
                        <span className="text-sm text-[#999]">No applications</span>
                      )}
                      {user.faculty_admins?.length > 0 && (
                        <span className="text-sm">
                          {user.faculty_admins.map((fa, i) => (
                            <span key={i} className="block">
                              {fa.faculties?.name} — {fa.faculties?.universities?.name}
                            </span>
                          ))}
                        </span>
                      )}
                      {user.role !== "student" && !user.faculty_admins?.length && "—"}
                    </td>
                    <td className="px-5 py-4 text-[#999] text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {user.role !== "super_admin" && (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(e, user.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg border border-[#e0e0e0] px-2 py-1.5 text-sm focus:border-[#F4C430] focus:outline-none"
                        >
                          <option value="student">Student</option>
                          <option value="faculty_admin">Faculty Team</option>
                          <option value="uni_admin">Uni Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
