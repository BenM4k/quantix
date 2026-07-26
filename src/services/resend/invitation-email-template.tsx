import * as React from "react";

export interface InvitationEmailTemplateProps {
  invitedByName: string;
  invitedByEmail: string;
  companyName: string;
  role: string;
  inviteLink: string;
}

export function InvitationEmailTemplate({
  invitedByName,
  invitedByEmail,
  companyName,
  role,
  inviteLink,
}: InvitationEmailTemplateProps) {
  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        padding: "40px 20px",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          backgroundColor: "#1e293b",
          borderRadius: "16px",
          border: "1px solid #334155",
          padding: "40px 32px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-block",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#f97316",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "900",
              lineHeight: "48px",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            Q
          </div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "#f8fafc",
              margin: "0",
              letterSpacing: "-0.5px",
            }}
          >
            Quantix ERP
          </h1>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#f8fafc",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          You&apos;ve been invited to join {companyName}
        </h2>

        {/* Body content */}
        <p
          style={{
            fontSize: "14px",
            lineHeight: "24px",
            color: "#94a3b8",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          <strong style={{ color: "#e2e8f0" }}>{invitedByName}</strong> (
          <span style={{ color: "#cbd5e1" }}>{invitedByEmail}</span>) has
          invited you to join the team at{" "}
          <strong style={{ color: "#e2e8f0" }}>{companyName}</strong> as a{" "}
          <span
            style={{
              backgroundColor: "rgba(249, 115, 22, 0.15)",
              color: "#f97316",
              padding: "2px 8px",
              borderRadius: "6px",
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {role}
          </span>
          .
        </p>

        {/* CTA Button */}
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a
            href={inviteLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#f97316",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "700",
              padding: "14px 32px",
              borderRadius: "12px",
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 12px rgba(249, 115, 22, 0.4)",
            }}
          >
            Accept Invitation
          </a>
        </div>

        {/* Alternate link notice */}
        <div
          style={{
            borderTop: "1px solid #334155",
            paddingTop: "24px",
            marginTop: "32px",
            fontSize: "12px",
            color: "#64748b",
            lineHeight: "20px",
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>
            Or copy and paste this URL into your browser:
          </p>
          <p
            style={{
              margin: 0,
              wordBreak: "break-all",
              color: "#38bdf8",
              fontFamily: "monospace",
            }}
          >
            {inviteLink}
          </p>
        </div>

        {/* Security / Expiration Notice */}
        <p
          style={{
            fontSize: "12px",
            color: "#64748b",
            marginTop: "24px",
            textAlign: "center",
            lineHeight: "18px",
          }}
        >
          This invitation link will expire in 7 days. If you were not expecting
          this invitation, you can safely ignore this email.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "12px",
          color: "#64748b",
        }}
      >
        © {new Date().getFullYear()} Quantix ERP. All rights reserved.
      </div>
    </div>
  );
}

export function renderInvitationEmailHtml(
  props: InvitationEmailTemplateProps,
): string {
  // Simple HTML string generator for email providers
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invitation to join ${props.companyName}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#0f172a;">
        <div style="background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;padding:40px 20px;color:#f8fafc;">
          <div style="max-width:560px;margin:0 auto;background-color:#1e293b;border-radius:16px;border:1px solid #334155;padding:40px 32px;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background-color:#f97316;color:#ffffff;font-size:24px;font-weight:900;line-height:48px;text-align:center;margin-bottom:12px;">Q</div>
              <h1 style="font-size:22px;font-weight:800;color:#f8fafc;margin:0;">Quantix ERP</h1>
            </div>
            <h2 style="font-size:20px;font-weight:700;color:#f8fafc;margin-bottom:16px;text-align:center;">You've been invited to join ${props.companyName}</h2>
            <p style="font-size:14px;line-height:24px;color:#94a3b8;margin-bottom:24px;text-align:center;">
              <strong style="color:#e2e8f0;">${props.invitedByName}</strong> (${props.invitedByEmail}) has invited you to join the team at <strong style="color:#e2e8f0;">${props.companyName}</strong> as a <span style="background-color:rgba(249,115,22,0.15);color:#f97316;padding:2px 8px;border-radius:6px;font-weight:600;">${props.role}</span>.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${props.inviteLink}" target="_blank" style="background-color:#f97316;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;display:inline-block;">Accept Invitation</a>
            </div>
            <div style="border-top:1px solid #334155;padding-top:24px;margin-top:32px;font-size:12px;color:#64748b;">
              <p style="margin:0 0 8px 0;">Or copy and paste this URL into your browser:</p>
              <p style="margin:0;word-break:break-all;color:#38bdf8;font-family:monospace;">${props.inviteLink}</p>
            </div>
            <p style="font-size:12px;color:#64748b;margin-top:24px;text-align:center;">This invitation link will expire in 7 days. If you were not expecting this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
