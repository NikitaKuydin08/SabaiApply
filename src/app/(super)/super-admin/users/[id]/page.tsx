"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getUserDetail, sendPasswordReset, sendSupportEmailToUser } from "../../actions";

interface UserDetailData {
  profile: Record<string, unknown>;
  facultyAssignments: Record<string, unknown>[];
  invites: Record<string, unknown>[];
  studentProfile: Record<string, unknown> | null;
  education: Record<string, unknown> | null;
  scores: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  applications: Record<string, unknown>[];
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // Support actions
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [actionFeedback, setActionFeedback] = useState("");

  useEffect(() => {
    async function load() {
      const result = await getUserDetail(userId);
      setData(result as UserDetailData | null);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setSendingEmail(true);
    setActionFeedback("");

    const result = await sendSupportEmailToUser(
      data!.profile.email as string,
      emailSubject,
      emailMessage
    );

    if (result.error) {
      setActionFeedback(`Failed: ${result.error}`);
    } else {
      setActionFeedback("Email sent successfully!");
      setShowEmailForm(false);
      setEmailSubject("");
      setEmailMessage("");
    }
    setSendingEmail(false);
    setTimeout(() => setActionFeedback(""), 5000);
  }

  async function handleResetPassword() {
    if (!confirm(`Send password reset email to ${data!.profile.email}?`)) return;
    setActionFeedback("");

    const result = await sendPasswordReset(data!.profile.email as string);
    if (result.error) {
      setActionFeedback(`Failed: ${result.error}`);
    } else {
      setActionFeedback("Password reset email sent!");
    }
    setTimeout(() => setActionFeedback(""), 5000);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "submitted": return "bg-gray-100 text-gray-600";
      case "under_review": return "bg-[#F4C430]/10 text-[#1a1a1a]";
      case "shortlisted": return "bg-blue-50 text-blue-600";
      case "interview_scheduled": return "bg-purple-50 text-purple-600";
      case "accepted": return "bg-green-50 text-green-600";
      case "waitlisted": return "bg-amber-50 text-amber-600";
      case "rejected": return "bg-red-50 text-red-600";
      case "confirmed": return "bg-green-100 text-green-700";
      case "withdrawn": return "bg-gray-200 text-gray-500";
      default: return "bg-gray-100 text-gray-600";
    }
  }

  function getStatusLabel(status: string) {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (loading) return <div className="p-8"><p className="text-[#666]">Loading...</p></div>;
  if (!data) return <div className="p-8"><p className="text-red-500">User not found.</p></div>;

  const { profile, facultyAssignments, invites, studentProfile, education, scores, documents, applications } = data;
  const isStudent = profile.role === "student";

  return (
    <div>
      <Link href="/super-admin/users" className="text-base text-[#F4C430] hover:underline mb-4 inline-block">
        &larr; All Users
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mt-2">
        <div className="h-16 w-16 rounded-full bg-[#F4C430]/10 flex items-center justify-center text-2xl font-bold text-[#1a1a1a]">
          {((profile.full_name as string) ?? (profile.email as string)).charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">{(profile.full_name as string) || "No Name"}</h1>
          <p className="text-base text-[#666]">{profile.email as string}</p>
          <span className={`inline-block mt-1 rounded-full px-3 py-1 text-sm font-medium ${
            profile.role === "super_admin" ? "bg-red-50 text-red-600" :
            profile.role === "uni_admin" ? "bg-blue-50 text-blue-600" :
            profile.role === "faculty_admin" ? "bg-[#F4C430]/10 text-[#1a1a1a]" :
            "bg-green-50 text-green-600"
          }`}>
            {getStatusLabel(profile.role as string)}
          </span>
        </div>
      </div>

      {/* Action Feedback */}
      {actionFeedback && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${actionFeedback.startsWith("Failed") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {actionFeedback}
        </div>
      )}

      {/* Support Actions */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <button onClick={() => setShowEmailForm(!showEmailForm)}
          className="rounded-lg bg-[#F4C430] px-4 py-2 text-base font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] transition-colors">
          Send Email
        </button>
        <button onClick={handleResetPassword}
          className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-base text-[#1a1a1a] hover:bg-[#fafafa] transition-colors">
          Reset Password
        </button>
      </div>

      {/* Email Form */}
      {showEmailForm && (
        <div className="mt-4 max-w-lg rounded-xl border border-[#e8e8e8] bg-white p-6">
          <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">Send Email to {profile.email as string}</h3>
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-base font-medium text-[#1a1a1a]">Subject</label>
              <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} required
                placeholder="Subject line..."
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="block text-base font-medium text-[#1a1a1a]">Message</label>
              <textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} required rows={5}
                placeholder="Type your message..."
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#999] focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 focus:outline-none transition-colors resize-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={sendingEmail}
                className="rounded-lg bg-[#F4C430] px-5 py-4 text-lg font-semibold text-[#1a1a1a] hover:bg-[#e6b82a] disabled:opacity-50 transition-colors">
                {sendingEmail ? "Sending..." : "Send"}
              </button>
              <button type="button" onClick={() => setShowEmailForm(false)}
                className="rounded-lg px-5 py-4 text-base text-[#666] hover:bg-[#fafafa] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Info */}
      <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Profile Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-[#999]">Email</p>
            <p className="text-base text-[#1a1a1a]">{profile.email as string}</p>
          </div>
          <div>
            <p className="text-sm text-[#999]">Joined</p>
            <p className="text-base text-[#1a1a1a]">{new Date(profile.created_at as string).toLocaleDateString()}</p>
          </div>
          {isStudent && studentProfile && (
            <>
              <div>
                <p className="text-sm text-[#999]">Phone</p>
                <p className="text-base text-[#1a1a1a]">{(studentProfile.phone as string) || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-[#999]">Line ID</p>
                <p className="text-base text-[#1a1a1a]">{(studentProfile.line_id as string) || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-[#999]">Nationality</p>
                <p className="text-base text-[#1a1a1a]">{(studentProfile.nationality as string) || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-[#999]">Date of Birth</p>
                <p className="text-base text-[#1a1a1a]">{(studentProfile.dob as string) || "—"}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Education (students only) */}
      {isStudent && education && (
        <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Education</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-[#999]">School</p>
              <p className="text-base text-[#1a1a1a]">{(education.school_name as string) || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-[#999]">GPA</p>
              <p className="text-base text-[#1a1a1a]">{education.gpa != null ? String(education.gpa) : "—"}</p>
            </div>
            <div>
              <p className="text-sm text-[#999]">Graduation Year</p>
              <p className="text-base text-[#1a1a1a]">{education.graduation_year != null ? String(education.graduation_year) : "—"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Test Scores (students only) */}
      {isStudent && scores.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Test Scores</h2>
          <div className="space-y-2">
            {scores.map((score) => (
              <div key={score.id as string} className="flex items-center justify-between rounded-lg border border-[#efefef] px-4 py-3">
                <div>
                  <p className="text-base font-medium text-[#1a1a1a]">{String(score.score_type)}</p>
                  {score.test_date ? <p className="text-sm text-[#999]">{String(score.test_date)}</p> : null}
                </div>
                <p className="text-lg font-bold text-[#1a1a1a]">{String(score.score_value as number)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applications (students only) */}
      {isStudent && (
        <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
            Applications <span className="text-base font-normal text-[#999]">({applications.length})</span>
          </h2>
          {applications.length === 0 ? (
            <p className="text-base text-[#999]">No applications submitted.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const program = app.programs as Record<string, unknown> | null;
                const faculty = program?.faculties as Record<string, unknown> | null;
                const uni = faculty?.universities as Record<string, unknown> | null;

                return (
                  <div key={app.id as string} className="rounded-lg border border-[#efefef] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-base font-medium text-[#1a1a1a]">
                          {(program?.name as string) || "Unknown Program"}
                        </p>
                        <p className="text-sm text-[#666]">
                          {(faculty?.name as string) || ""} — {(uni?.name as string) || ""}
                        </p>
                        <p className="text-sm text-[#999] mt-1">
                          Round {app.round as string} | Submitted {new Date(app.submitted_at as string).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(app.status as string)}`}>
                        {getStatusLabel(app.status as string)}
                      </span>
                    </div>
                    {app.total_score != null && (
                      <p className="mt-2 text-sm text-[#666]">Score: <strong>{String(app.total_score)}</strong></p>
                    )}
                    {app.waitlist_position != null && (
                      <p className="mt-1 text-sm text-[#666]">Waitlist position: #{String(app.waitlist_position)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Documents (students only) */}
      {isStudent && documents.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id as string} className="flex items-center justify-between rounded-lg border border-[#efefef] px-4 py-3">
                <div>
                  <p className="text-base font-medium text-[#1a1a1a]">{String(doc.file_name ?? "Document")}</p>
                  <p className="text-sm text-[#999]">{getStatusLabel(String(doc.doc_type))}</p>
                </div>
                {doc.file_url ? (
                  <a href={String(doc.file_url)} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-[#F4C430] hover:underline">
                    View
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Faculty Assignments (admins only) */}
      {!isStudent && facultyAssignments.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Faculty Assignments</h2>
          <div className="space-y-2">
            {facultyAssignments.map((fa) => {
              const fac = fa.faculties as Record<string, unknown> | null;
              const uni = fac?.universities as Record<string, unknown> | null;
              return (
                <div key={fa.id as string} className="rounded-lg border border-[#efefef] px-4 py-3">
                  <p className="text-base font-medium text-[#1a1a1a]">{(fac?.name as string) || "—"}</p>
                  <p className="text-sm text-[#666]">{(uni?.name as string) || "—"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite History */}
      {invites.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Invite History</h2>
          <div className="space-y-2">
            {invites.map((inv) => (
              <div key={inv.id as string} className="rounded-lg border border-[#efefef] px-4 py-3">
                <p className="text-base text-[#1a1a1a]">
                  Invited as {getStatusLabel(String(inv.role))}
                  {inv.faculties ? ` to ${String((inv.faculties as Record<string, unknown>).name)}` : ""}
                </p>
                <p className="text-sm text-[#999]">
                  {new Date(inv.created_at as string).toLocaleDateString()}
                  {inv.accepted_at ? " — Accepted" : " — Pending"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
