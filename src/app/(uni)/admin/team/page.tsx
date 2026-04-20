"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createAndSendInvite } from "./actions";
import { useLocale } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import type { Faculty } from "@/types/database";

interface InviteRow {
  id: string;
  email: string;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
  faculties: { name: string; name_th: string | null } | null;
}

interface TeamMember {
  id: string;
  user_id: string;
  is_primary: boolean;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
  };
  faculty: {
    id: string;
    name: string;
    name_th: string | null;
  };
}

export default function TeamPage() {
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [linkCountdown, setLinkCountdown] = useState(0);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);

    const { data: facultyData } = await supabase
      .from("faculties")
      .select("*")
      .order("name");
    if (facultyData) setFaculties(facultyData);

    const { data: inviteData } = await supabase
      .from("invites")
      .select("*, faculties(name, name_th)")
      .order("created_at", { ascending: false });
    if (inviteData) setInvites(inviteData as InviteRow[]);

    // Load active team members
    const { data: memberData } = await supabase
      .from("faculty_admins")
      .select("id, user_id, is_primary, profiles(id, email, full_name, role), faculties(id, name, name_th)")
      .order("created_at", { ascending: false });

    if (memberData) {
      const mapped = memberData.map((m: Record<string, unknown>) => ({
        id: m.id as string,
        user_id: m.user_id as string,
        is_primary: m.is_primary as boolean,
        profile: m.profiles as TeamMember["profile"],
        faculty: m.faculties as TeamMember["faculty"],
      }));
      setMembers(mapped);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInviteLink("");
    setLoading(true);

    const result = await createAndSendInvite(
      email,
      facultyId || null,
      window.location.origin
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const link = `${window.location.origin}/admin/invite/${result.token}`;
    setInviteLink(link);

    if (result.emailSent) {
      setSuccess(
        locale === "th"
          ? `ส่งคำเชิญไปที่ ${email} เรียบร้อยแล้ว (อีเมลถูกส่งแล้ว)`
          : `Invite sent to ${email} (email delivered)`
      );
    } else {
      setSuccess(
        locale === "th"
          ? `สร้างคำเชิญสำหรับ ${email} แล้ว (ส่งอีเมลไม่สำเร็จ — กรุณาแชร์ลิงก์ด้านล่าง)`
          : `Invite created for ${email} (email failed — share the link below)`
      );
    }

    setEmail("");
    setFacultyId("");
    setLoading(false);

    await loadAll();

    // Clear success message after 7 seconds
    setTimeout(() => {
      setSuccess("");
    }, 7000);

    // Start 5-minute countdown for invite link
    setLinkCountdown(300);
    const timer = setInterval(() => {
      setLinkCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setInviteLink("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleDeleteMember(member: TeamMember) {
    const name = member.profile.full_name || member.profile.email;
    const msg = locale === "th"
      ? `ลบ "${name}" ออกจากทีม? สมาชิกจะไม่สามารถเข้าถึงแดชบอร์ดของคณะได้อีก`
      : `Remove "${name}" from the team? They will lose access to the faculty dashboard.`;

    if (!confirm(msg)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("faculty_admins")
      .delete()
      .eq("id", member.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAll();
  }

  async function handleDeleteInvite(invite: InviteRow) {
    const msg = locale === "th"
      ? `ยกเลิกคำเชิญสำหรับ "${invite.email}"?`
      : `Cancel invite for "${invite.email}"?`;

    if (!confirm(msg)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("invites")
      .delete()
      .eq("id", invite.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAll();
  }

  function getStatus(invite: InviteRow) {
    if (invite.accepted_at) return t("accepted", locale);
    if (new Date(invite.expires_at) < new Date()) return t("expired", locale);
    return t("pending", locale);
  }

  function getStatusRaw(invite: InviteRow) {
    if (invite.accepted_at) return "accepted";
    if (new Date(invite.expires_at) < new Date()) return "expired";
    return "pending";
  }

  function getStatusColor(invite: InviteRow) {
    const status = getStatusRaw(invite);
    if (status === "accepted") return "text-green-600 bg-green-50";
    if (status === "expired") return "text-red-600 bg-red-50";
    return "text-[#F4C430] bg-[#F4C430]/10";
  }

  // Filter members by search query (supports Thai and English)
  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (m.profile.full_name ?? "").toLowerCase();
    const email = m.profile.email.toLowerCase();
    const facName = (m.faculty?.name ?? "").toLowerCase();
    const facNameTh = m.faculty?.name_th ?? "";
    return name.includes(q) || email.includes(q) || facName.includes(q) || facNameTh.includes(searchQuery);
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a1a1a]">{t("team", locale)}</h1>
      <p className="mt-2 text-base text-[#666]">{t("invite_admins", locale)}</p>

      {/* Invite Form */}
      <div className="mt-6 max-w-lg rounded-xl border border-[#e8e8e8] bg-white p-6">
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">{t("send_invite", locale)}</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-base font-medium text-[#1a1a1a]">
              {t("email_address", locale)}
            </label>
            <input
              id="email"
              type="email"
              placeholder="staff@university.ac.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="faculty" className="block text-base font-medium text-[#1a1a1a]">
              {t("faculty_optional", locale)}
            </label>
            <select
              id="faculty"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3.5 text-base text-[#1a1a1a] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            >
              <option value="">{t("no_specific_faculty", locale)}</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {locale === "th" && f.name_th ? f.name_th : f.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

          {success && (
            <div className="space-y-3">
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>
              {inviteLink && (
                <div className="bg-[#fafafa] p-4 rounded-lg border border-[#efefef]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#999]">{t("share_invite_link", locale)}</p>
                    {linkCountdown > 0 && (
                      <p className="text-xs text-[#999]">
                        {locale === "th" ? "ลิงก์จะหายไปใน" : "Link disappearing in"}{" "}
                        <span className="font-medium text-[#F4C430]">
                          {Math.floor(linkCountdown / 60)}:{(linkCountdown % 60).toString().padStart(2, "0")}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input value={inviteLink} readOnly className="flex-1 rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#1a1a1a]" />
                    <button type="button" onClick={() => navigator.clipboard.writeText(inviteLink)}
                      className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#fafafa] transition-colors">
                      {t("copy", locale)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors">
            {loading ? t("sending", locale) : t("send_invite", locale)}
          </button>
        </form>
      </div>

      {/* Active Team Members */}
      <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1a1a1a]">
            {locale === "th" ? "สมาชิกในทีม" : "Team Members"}
            {members.length > 0 && (
              <span className="ml-2 text-base font-normal text-[#999]">({members.length})</span>
            )}
          </h2>
        </div>

        {/* Search */}
        {members.length > 0 && (
          <div className="mb-4">
            <input
              placeholder={locale === "th" ? "ค้นหาชื่อ อีเมล หรือคณะ..." : "Search by name, email, or faculty..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors"
            />
          </div>
        )}

        {members.length === 0 ? (
          <p className="text-base text-[#999]">
            {locale === "th" ? "ยังไม่มีสมาชิกในทีม" : "No team members yet."}
          </p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-base text-[#999]">
            {locale === "th" ? "ไม่พบสมาชิกที่ตรงกับการค้นหา" : "No members match your search."}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg border border-[#efefef] px-4 py-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-[#F4C430]/10 flex items-center justify-center text-base font-semibold text-[#1a1a1a]">
                    {(member.profile.full_name ?? member.profile.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium text-[#1a1a1a]">
                        {member.profile.full_name || member.profile.email}
                      </p>
                      {member.is_primary && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#F4C430]/10 text-[#1a1a1a] font-medium">
                          {locale === "th" ? "ผู้ดูแลหลัก" : "Primary"}
                        </span>
                      )}
                      {member.user_id === currentUserId && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                          {locale === "th" ? "คุณ" : "You"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#666]">{member.profile.email}</p>
                    {member.faculty && (
                      <p className="text-sm text-[#999]">
                        {locale === "th" && member.faculty.name_th
                          ? member.faculty.name_th
                          : member.faculty.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delete button — can't delete yourself */}
                {member.user_id !== currentUserId && (
                  <button
                    onClick={() => handleDeleteMember(member)}
                    className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    {locale === "th" ? "ลบ" : "Remove"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invites List */}
      <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
          {t("sent_invites", locale)}
          {invites.length > 0 && (
            <span className="ml-2 text-base font-normal text-[#999]">({invites.length})</span>
          )}
        </h2>
        {invites.length === 0 ? (
          <p className="text-base text-[#999]">{t("no_invites", locale)}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-[#e0e0e0] text-left text-[#999]">
                  <th className="pb-3 pr-4 font-medium">{t("email", locale)}</th>
                  <th className="pb-3 pr-4 font-medium">{t("faculties", locale)}</th>
                  <th className="pb-3 pr-4 font-medium">{t("status", locale)}</th>
                  <th className="pb-3 pr-4 font-medium">{t("sent", locale)}</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#efefef] last:border-0">
                    <td className="py-4 pr-4 text-[#1a1a1a]">{inv.email}</td>
                    <td className="py-4 pr-4 text-[#666]">
                      {inv.faculties
                        ? (locale === "th" && inv.faculties.name_th ? inv.faculties.name_th : inv.faculties.name)
                        : "—"}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(inv)}`}>
                        {getStatus(inv)}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-[#666]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      {getStatusRaw(inv) !== "accepted" && (
                        <button
                          onClick={() => handleDeleteInvite(inv)}
                          className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          {locale === "th" ? "ยกเลิก" : "Cancel"}
                        </button>
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
