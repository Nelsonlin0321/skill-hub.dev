export default function HomePage() {
  return (
    <section className="w-full rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="max-w-2xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Authenticated App Shell
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Better Auth foundation is now wired into the root route.
          </h2>
          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
            This page renders only after the shared auth helpers validate the
            current session. Unauthenticated requests are redirected to
            `/sign-in` before any protected content is shown.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-zinc-50 p-5 dark:border-white/10 dark:bg-zinc-900">
            <h3 className="text-base font-semibold">Protected page flow</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              The authenticated layout enforces session presence and exposes the
              current user identity in the app shell header.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-zinc-50 p-5 dark:border-white/10 dark:bg-zinc-900">
            <h3 className="text-base font-semibold">Protected JSON route</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              The `/api/me` route uses the same shared helper contract and
              returns `401` when the session is missing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
