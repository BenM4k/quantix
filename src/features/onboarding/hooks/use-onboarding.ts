import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { onboardingAction } from "@/app/api/auth/[...all]/actions/auth.actions";
import { type OnboardingInput } from "@/lib/validation/auth";

export function useOnboarding() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleOnboarding = (data: OnboardingInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await onboardingAction(data);
      if (!res.ok) {
        setServerError(res.error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  return {
    isPending,
    serverError,
    handleOnboarding,
  };
}
