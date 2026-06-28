/**
 * Standalone script that sends a single verification email through the real
 * `sendAuthVerificationEmail` pipeline from `lib/email.ts`, so you can confirm
 * the verification template renders and SES delivers it end-to-end.
 *
 * Run it with:
 *
 *   npm run send-verification-email
 *
 * It loads `.env` and `.env.local` (Next's env files) itself, so your AWS
 * credentials and `AUTH_EMAIL_FROM` only need to be present there. Shell
 * environment variables take precedence over the files.
 *
 * NOTE: while the SES account is in the sandbox, the recipient address must be
 * a verified identity in SES — otherwise AWS rejects the send with
 * "Email address is not verified".
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RECIPIENT = "nelsonlin0321@gmail.com";

const ENV_FILES = [".env", ".env.local"];

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, "utf8");

  for (const line of contents.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Shell/already-set environment variables take precedence over file values.
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadEnv(): void {
  for (const file of ENV_FILES) {
    loadEnvFile(resolve(process.cwd(), file));
  }
}

async function main(): Promise<void> {
  loadEnv();

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!accessKeyId || !secretAccessKey) {
    console.error(
      "AUTH_CONFIGURATION_ERROR: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set (in .env / .env.local or the shell) to send a verification email.",
    );
    process.exit(1);
  }

  const baseURL =
    process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";
  const verificationUrl = `${baseURL}/verify-email?token=test-token&callbackURL=${encodeURIComponent("/sign-in?verified=1")}`;

  console.log(`Sending verification email...`);
  console.log(`  to:              ${RECIPIENT}`);
  console.log(`  verificationUrl: ${verificationUrl}`);

  // Imported after env is loaded so `AUTH_EMAIL_FROM` and `sesRegion` resolve
  // against the merged env values.
  const { sendAuthVerificationEmail } = await import("../lib/email");

  await sendAuthVerificationEmail({
    name: "Nelson",
    to: RECIPIENT,
    verificationUrl,
  });

  console.log(`\nSend succeeded.`);
  console.log(`  Check the inbox at ${RECIPIENT}.`);
}

main().catch((error) => {
  console.error(
    "AUTH_INTERNAL_ERROR: Failed to send verification email via AWS SES.",
    {
      to: RECIPIENT,
      error,
    },
  );
  process.exit(1);
});
