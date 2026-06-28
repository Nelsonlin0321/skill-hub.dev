import { AuthCard } from "@/components/auth/auth-card";
import { isGoogleAuthConfigured } from "@/lib/auth";
import { getSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <AuthCard googleEnabled={isGoogleAuthConfigured} mode="sign-up" />
    </main>
  );
}
