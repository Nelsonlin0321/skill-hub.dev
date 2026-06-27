import "server-only";

import { auth } from "@/lib/auth";
import prisma from "@/prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED";

type MaybeSession = Awaited<ReturnType<typeof auth.api.getSession>>;
type Session = NonNullable<MaybeSession>;

export type LinkedAuthAccount = {
  providerId: string;
  accountId: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  linkedAccounts: LinkedAuthAccount[];
};

async function resolveSession(): Promise<MaybeSession> {
  return auth.api.getSession({
    headers: await headers(),
  });
}

async function resolveUser(session: Session): Promise<AuthenticatedUser> {
  const linkedAccounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: {
      providerId: true,
      accountId: true,
    },
    orderBy: {
      providerId: "asc",
    },
  });

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    linkedAccounts,
  };
}

export async function getSession(): Promise<MaybeSession> {
  return resolveSession();
}

export async function requireSession(): Promise<Session> {
  const session = await resolveSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function getUser(): Promise<AuthenticatedUser | null> {
  const session = await resolveSession();

  if (!session) {
    return null;
  }

  return resolveUser(session);
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const session = await requireSession();

  return resolveUser(session);
}

export function unauthorizedResponse(message = "You must sign in to continue.") {
  return Response.json(
    {
      code: AUTH_UNAUTHORIZED,
      message,
    },
    { status: 401 },
  );
}
