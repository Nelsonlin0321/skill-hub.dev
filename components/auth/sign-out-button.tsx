"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    setIsPending(true);

    const result = await signOut();

    if (result.error) {
      setError("Unable to sign out right now. Please try again.");
      setIsPending(false);
      return;
    }

    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-black/20 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-zinc-200 dark:hover:border-white/20 dark:hover:bg-zinc-900"
      >
        {isPending ? "Signing out..." : "Sign out"}
      </button>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
