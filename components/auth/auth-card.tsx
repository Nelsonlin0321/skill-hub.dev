"use client";

import { signIn, signUp } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type AuthCardProps = {
  googleEnabled: boolean;
  mode: "sign-in" | "sign-up";
};

type FormState = {
  email: string;
  name: string;
  password: string;
};

const initialFormState: FormState = {
  email: "",
  name: "",
  password: "",
};

function getOrigin() {
  return window.location.origin;
}

function getSearchParamMessage(
  mode: "sign-in" | "sign-up",
  searchParams: URLSearchParams,
): string | null {
  if (searchParams.get("error")) {
    return "Unable to continue right now. Please try again.";
  }

  if (mode === "sign-in" && searchParams.get("verified") === "1") {
    return "Your email has been verified. You can sign in now.";
  }

  return null;
}

export function AuthCard({ googleEnabled, mode }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(
    null,
  );

  const searchParamMessage = useMemo(
    () => getSearchParamMessage(mode, searchParams),
    [mode, searchParams],
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleGoogleSignIn() {
    setError(null);
    setNotice(null);
    setPendingAction("google");

    const result = await signIn.social({
      provider: "google",
      callbackURL: `${getOrigin()}/`,
      errorCallbackURL: `${getOrigin()}/sign-in?error=oauth`,
    });

    if (result.error) {
      setError("Unable to sign in with Google right now. Please try again.");
      setPendingAction(null);
    }
  }

  async function handleEmailSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPendingAction("email");

    const result = await signIn.email({
      email: form.email,
      password: form.password,
    });

    if (result.error) {
      if (result.error.status === 403) {
        setNotice(
          "Please verify your email address before signing in. A fresh verification email has been sent if the account exists.",
        );
      } else if (result.error.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Unable to sign in right now. Please try again.");
      }

      setPendingAction(null);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleEmailSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPendingAction("email");

    const result = await signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
      callbackURL: `${getOrigin()}/sign-in?verified=1`,
    });

    if (result.error) {
      setError("Unable to create your account right now. Please try again.");
      setPendingAction(null);
      return;
    }

    setNotice(
      "Check your inbox for a verification email from NoReply <noreply@skill-hub.dev> before signing in.",
    );
    setForm(initialFormState);
    setPendingAction(null);
  }

  const isSubmittingEmail = pendingAction === "email";
  const isSubmittingGoogle = pendingAction === "google";

  return (
    <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Skill Hub
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {mode === "sign-in" ? "Sign in" : "Create your account"}
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {mode === "sign-in"
            ? "Sign in with email and password, or continue with Google."
            : "Create an email account. We will send a verification email through AWS SES."}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {mode === "sign-in" ? (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={!googleEnabled || pendingAction !== null}
              className="inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-600"
            >
              {isSubmittingGoogle
                ? "Redirecting to Google..."
                : "Continue with Google"}
            </button>

            {!googleEnabled ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                Google sign-in is not available until `GOOGLE_CLIENT_ID` and
                `GOOGLE_CLIENT_SECRET` are configured.
              </p>
            ) : null}

            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-zinc-400">
              <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              <span>Or</span>
              <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            </div>
          </>
        ) : null}

        <form
          onSubmit={mode === "sign-in" ? handleEmailSignIn : handleEmailSignUp}
          className="space-y-4"
        >
          {mode === "sign-up" ? (
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              minLength={8}
              required
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
            />
            {mode === "sign-up" ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Use at least 8 characters.
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={pendingAction !== null}
            className="inline-flex w-full items-center justify-center rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-zinc-900 transition hover:border-black/20 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-zinc-50 dark:hover:border-white/20 dark:hover:bg-zinc-900"
          >
            {isSubmittingEmail
              ? mode === "sign-in"
                ? "Signing in..."
                : "Creating account..."
              : mode === "sign-in"
                ? "Sign in with email"
                : "Create account"}
          </button>
        </form>

        {(notice ?? searchParamMessage) ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {notice ?? searchParamMessage}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {mode === "sign-in" ? "Need an account?" : "Already have an account?"}{" "}
          <Link
            href={mode === "sign-in" ? "/sign-up" : "/sign-in"}
            className="font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
          >
            {mode === "sign-in" ? "Create one" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
