import { SignInCard } from "@/components/auth/sign-in-card";
import { isGoogleAuthConfigured } from "@/lib/auth";
import { getSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <SignInCard googleEnabled={isGoogleAuthConfigured} />
    </main>
  );
}
