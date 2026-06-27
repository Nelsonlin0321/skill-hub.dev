"use client";

import { signIn } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type SignInCardProps = {
  googleEnabled: boolean;
};

function getErrorMessage(errorCode: string | null): string | null {
  if (!errorCode) {
    return null;
  }

  return "Unable to sign in right now. Please try again.";
}

export function SignInCard({ googleEnabled }: SignInCardProps) {
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParamError = useMemo(
    () => getErrorMessage(searchParams.get("error")),
    [searchParams],
  );

  async function handleGoogleSignIn() {
    setError(null);
    setIsPending(true);

    const result = await signIn.social({
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/sign-in?error=oauth",
    });

    if (result.error) {
      setError("Unable to sign in right now. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Skill Hub
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Sign in with Google
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Use your Google account to access the authenticated app shell.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={!googleEnabled || isPending}
          className="inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-600"
        >
          {isPending ? "Redirecting to Google..." : "Continue with Google"}
        </button>

        {!googleEnabled ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            Google sign-in is not available until `GOOGLE_CLIENT_ID` and
            `GOOGLE_CLIENT_SECRET` are configured.
          </p>
        ) : null}

        {error ?? searchParamError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error ?? searchParamError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
