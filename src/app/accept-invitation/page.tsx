import Link from "next/link";
import { AcceptInvitationClient } from "./accept-invitation-client";
import { AlertCircle } from "lucide-react";

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ invitationId?: string; id?: string }>;
}) {
  const params = await searchParams;
  const invitationId = params.invitationId || params.id;

  if (!invitationId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-8 shadow-2xl relative z-10 text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-lg">
              Q
            </div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Quantix ERP</h1>
          </div>

          <div className="py-4 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground">Invalid Invitation Link</h2>
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3.5 rounded-xl border border-border/40">
                No invitation ID was provided in the link. Please check your invitation email or contact your organization administrator.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/sign-in"
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold text-center hover:opacity-90 transition-opacity"
              >
                Sign In to Account
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-sm font-semibold text-center hover:bg-muted/40 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <AcceptInvitationClient invitationId={invitationId} />
    </div>
  );
}
