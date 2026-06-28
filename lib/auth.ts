import prisma from "@/prisma/client";
import {
  sendAuthPasswordResetEmail,
  sendAuthVerificationEmail,
} from "@/lib/email";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

const AUTH_CONFIGURATION_ERROR = "AUTH_CONFIGURATION_ERROR";

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${AUTH_CONFIGURATION_ERROR}: Missing required env var ${name}.`,
    );
  }

  return value;
}

function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

function getGoogleProviderConfig() {
  const clientId = readOptionalEnv("GOOGLE_CLIENT_ID");
  const clientSecret = readOptionalEnv("GOOGLE_CLIENT_SECRET");

  if (clientId && clientSecret) {
    return { clientId, clientSecret };
  }

  if (!clientId && !clientSecret) {
    if (process.env.NODE_ENV === "development") {
      throw new Error(
        `${AUTH_CONFIGURATION_ERROR}: Missing GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.`,
      );
    }

    console.error(
      `${AUTH_CONFIGURATION_ERROR}: Google OAuth is disabled because GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not configured.`,
    );
    return undefined;
  }

  const missingVariable = clientId
    ? "GOOGLE_CLIENT_SECRET"
    : "GOOGLE_CLIENT_ID";

  if (process.env.NODE_ENV === "development") {
    throw new Error(
      `${AUTH_CONFIGURATION_ERROR}: Missing ${missingVariable} for Google OAuth.`,
    );
  }

  console.error(
    `${AUTH_CONFIGURATION_ERROR}: Google OAuth is disabled because ${missingVariable} is missing.`,
  );
  return undefined;
}

const baseURL = readRequiredEnv("BETTER_AUTH_URL");
const secret = readRequiredEnv("BETTER_AUTH_SECRET");
const googleProvider = getGoogleProviderConfig();

export const isGoogleAuthConfigured = Boolean(googleProvider);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL,
  secret,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: ({ user, url }) => {
      void sendAuthPasswordResetEmail({
        to: user.email,
        name: user.name ?? null,
        resetUrl: url,
      });
      return Promise.resolve();
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    sendOnSignUp: true,
    sendVerificationEmail: ({ user, url }) => {
      void sendAuthVerificationEmail({
        to: user.email,
        name: user.name ?? null,
        verificationUrl: url,
      });
      return Promise.resolve();
    },
  },
  ...(googleProvider
    ? {
        socialProviders: {
          google: googleProvider,
        },
      }
    : {}),
  plugins: [nextCookies()],
});
