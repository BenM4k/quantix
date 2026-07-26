"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/services/better-auth/auth-client";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface AcceptInvitationClientProps {
  invitationId: string;
}

export function AcceptInvitationClient({ invitationId }: AcceptInvitationClientProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [invitationDetails, setInvitationDetails] = React.useState<{
    organizationName?: string;
    role?: string;
    email?: string;
  } | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function processInvitation() {
      try {
        // 1. Check session state
        const sessionRes = await authClient.getSession();
        const sessionUser = sessionRes?.data?.user;

        // 2. Fetch invitation details securely from Better Auth
        const getInvRes = await authClient.organization.getInvitation({
          query: { id: invitationId },
        });

        if (getInvRes.error || !getInvRes.data) {
          if (isMounted) {
            setStatus("error");
            setErrorMessage(
              getInvRes.error?.message ||
                "This invitation is invalid, has expired, or was already revoked."
            );
          }
          return;
        }

        const inv = getInvRes.data;
        if (isMounted) {
          setInvitationDetails({
            organizationName: inv.organizationName || "the organization",
            role: inv.role,
            email: inv.email,
          });
        }

        // 3. If user is NOT authenticated, redirect to sign in with callback
        if (!sessionUser) {
          const callbackUrl = `/accept-invitation?invitationId=${invitationId}`;
          router.push(`/sign-in?callback=${encodeURIComponent(callbackUrl)}`);
          return;
        }

        // 4. Verify email match if logged in
        if (sessionUser.email.toLowerCase() !== inv.email.toLowerCase()) {
          if (isMounted) {
            setStatus("error");
            setErrorMessage(
              `You are currently signed in as "${sessionUser.email}", but this invitation was sent to "${inv.email}". Please sign in with the invited email address.`
            );
          }
          return;
        }

        // 5. Accept invitation via Better Auth Organization Plugin
        const acceptRes = await authClient.organization.acceptInvitation({
          invitationId,
        });

        if (acceptRes.error) {
          if (isMounted) {
            setStatus("error");
            setErrorMessage(
              acceptRes.error.message || "Failed to accept the organization invitation."
            );
          }
          return;
        }

        // 6. Set active organization to the newly joined organization
        if (inv.organizationId) {
          await authClient.organization.setActive({
            organizationId: inv.organizationId,
          });
        }

        if (isMounted) {
          setStatus("success");
          setTimeout(() => {
            router.push(`/${inv.organizationId}/inventory/products`);
            router.refresh();
          }, 1500);
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while processing your invitation."
          );
        }
      }
    }

    processInvitation();

    return () => {
      isMounted = false;
    };
  }, [invitationId, router]);

  return (
    <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-8 shadow-2xl relative z-10 text-center space-y-6">
      {/* Header Branding */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-lg">
          Q
        </div>
        <h1 className="text-xl font-extrabold text-foreground tracking-tight">Quantix ERP</h1>
      </div>

      {/* Status: Loading */}
      {status === "loading" && (
        <div className="py-8 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Processing Invitation...</h2>
            <p className="text-xs text-muted-foreground">
              Authenticating and joining organization...
            </p>
          </div>
        </div>
      )}

      {/* Status: Success */}
      {status === "success" && (
        <div className="py-6 space-y-4 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">Invitation Accepted!</h2>
            <p className="text-xs text-muted-foreground">
              Welcome to <strong className="text-foreground">{invitationDetails?.organizationName}</strong>. Redirecting you to your workspace dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Status: Error */}
      {status === "error" && (
        <div className="py-4 space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">Unable to Join Organization</h2>
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3.5 rounded-xl border border-border/40">
              {errorMessage}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button onClick={() => router.push("/sign-in")} className="w-full">
              Sign In with Different Account
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              Return to Home
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
