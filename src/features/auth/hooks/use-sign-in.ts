import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction } from "@/app/api/auth/[...all]/actions/auth.actions";
import { type SignInInput } from "@/lib/validation/auth";

export function useSignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback");

  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSignIn = (data: SignInInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await signInAction(data);
      if (!res.ok) {
        setServerError(res.error.message);
      } else {
        if (callback) {
          router.push(callback);
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    });
  };

  return {
    isPending,
    serverError,
    handleSignIn,
  };
}
