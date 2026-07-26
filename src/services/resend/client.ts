import { Resend } from "resend";
import {
  renderInvitationEmailHtml,
  InvitationEmailTemplateProps,
} from "./invitation-email-template";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendInvitationEmail(
  toEmail: string,
  params: InvitationEmailTemplateProps,
) {
  if (!resend) {
    console.warn(
      "[Resend] RESEND_API_KEY is not configured. Email invitation log:",
      { toEmail, params },
    );
    return { success: false, reason: "NO_API_KEY" };
  }

  try {
    const html = renderInvitationEmailHtml(params);

    const { data, error } = await resend.emails.send({
      from: "Quantix ERP <invites@quantix.app>",
      to: [toEmail],
      subject: `Invitation to join ${params.companyName} on Quantix ERP`,
      html,
    });

    if (error) {
      console.error("[Resend] Failed to send invitation email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[Resend] Unexpected email sending error:", error);
    return { success: false, error };
  }
}
