import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "SabaiApply <team@sabaiapply.com>";

export async function sendInviteEmail(
  to: string,
  inviteLink: string,
  facultyName?: string
) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "You're invited to join SabaiApply",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 30px; font-weight: 700; color: #1a1a1a; margin: 0;">SabaiApply</h1>
          <p style="font-size: 16px; color: #666; margin-top: 8px;">University Admissions Platform</p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 16px; padding: 32px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px 0;">
            You've been invited!
          </h2>

          <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 8px 0;">
            You've been invited to join the SabaiApply faculty team${facultyName ? ` for <strong>${facultyName}</strong>` : ""}.
          </p>

          <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 24px 0;">
            Click the button below to set up your account:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" style="display: inline-block; background: #F4C430; color: #1a1a1a; font-size: 18px; font-weight: 600; padding: 16px 32px; border-radius: 8px; text-decoration: none;">
              Set Up Account
            </a>
          </div>

          <p style="font-size: 14px; color: #999; line-height: 1.6; margin: 24px 0 0 0;">
            This invite expires in 7 days. If you didn't expect this email, you can safely ignore it.
          </p>

          <hr style="border: none; border-top: 1px solid #efefef; margin: 24px 0;" />

          <p style="font-size: 12px; color: #999; margin: 0;">
            If the button doesn't work, copy and paste this link:<br />
            <a href="${inviteLink}" style="color: #F4C430; word-break: break-all;">${inviteLink}</a>
          </p>
        </div>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
          SabaiApply — One Form. Multiple Universities.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send invite email:", error);
    return { error: error.message };
  }

  return { success: true };
}
