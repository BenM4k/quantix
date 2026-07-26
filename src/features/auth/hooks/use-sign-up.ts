import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpAction } from "@/app/api/auth/[...all]/actions/auth.actions";
import { type SignUpFormInput } from "@/lib/validation/auth";

export function useSignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = ({ name, email, password }: SignUpFormInput) => {
    setError(null);
    startTransition(async () => {
      const res = await signUpAction({ name, email, password });
      if (!res.ok) {
        setError(res.error.message);
      } else {
        if (callback) {
          router.push(callback);
        } else {
          router.push("/onboarding");
        }
        router.refresh();
      }
    });
  };

  return {
    isPending,
    error,
    handleSignUp,
  };
}
