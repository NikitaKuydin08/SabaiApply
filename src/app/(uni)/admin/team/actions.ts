"use server";

import { createClient } from "@/lib/supabase/server";
import { sendInviteEmail } from "@/lib/email";

export async function createAndSendInvite(email: string, facultyId: string | null, origin: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check for existing pending invite
  const { data: existing } = await supabase
    .from("invites")
    .select("id")
    .eq("email", email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (existing) {
    return { error: "This email already has a pending invite." };
  }

  // Get faculty name for the email
  let facultyName: string | undefined;
  if (facultyId) {
    const { data: faculty } = await supabase
      .from("faculties")
      .select("name")
      .eq("id", facultyId)
      .single();
    if (faculty) facultyName = faculty.name;
  }

  // Create invite
  const { data: invite, error: insertError } = await supabase
    .from("invites")
    .insert({
      email,
      role: "faculty_admin" as const,
      faculty_id: facultyId,
      invited_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  const inviteLink = `${origin}/admin/invite/${invite.token}`;

  // Send email
  const emailResult = await sendInviteEmail(email, inviteLink, facultyName);

  if (emailResult.error) {
    // Invite was created but email failed — still return the link
    return {
      success: true,
      token: invite.token,
      emailSent: false,
      emailError: emailResult.error,
    };
  }

  return { success: true, token: invite.token, emailSent: true };
}
