import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/lib/auth-session";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const displayName = user.name ?? user.email;
  const linkedProviders = user.linkedAccounts.map((account) => account.providerId);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-black/5 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-zinc-950/90">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-5">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Skill Hub
            </p>
            <div>
              <h1 className="text-lg font-semibold">{displayName}</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.email}
              </p>
            </div>
            {linkedProviders.length > 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Connected providers: {linkedProviders.join(", ")}
              </p>
            ) : null}
          </div>

          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-12">
        {children}
      </main>
    </div>
  );
}
