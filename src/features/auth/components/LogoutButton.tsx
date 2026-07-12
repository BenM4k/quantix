"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/app/actions/auth.actions";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const res = await signOutAction();
      if (res.ok) {
        router.push("/sign-in");
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="px-4 py-2 rounded-xl glass-subtle border border-[var(--glass-border)] hover:border-primary/30 text-muted-foreground hover:text-foreground font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2 text-xs"
    >
      {isPending ? (
        <div className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
      ) : (
        "Sign Out"
      )}
    </button>
  );
}
