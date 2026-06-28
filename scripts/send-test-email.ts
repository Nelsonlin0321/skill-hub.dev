/**
 * Standalone script that sends a single test email through the real SES client
 * from `lib/email-client.ts`, so you can confirm delivery by checking the inbox.
 *
 * Run it with:
 *
 *   npm run send-test-email
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
      "AUTH_CONFIGURATION_ERROR: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set (in .env / .env.local or the shell) to send a test email.",
    );
    process.exit(1);
  }

  // Imported after env is loaded so `sesRegion` reads the resolved region.
  const { sesClient, sesRegion } = await import("../lib/email-client");
  const { SendEmailCommand } = await import("@aws-sdk/client-ses");

  const fromAddress =
    process.env.AUTH_EMAIL_FROM?.trim() || "NoReply <noreply@leetquiz.com>";

  console.log(`Sending test email...`);
  console.log(`  from:   ${fromAddress}`);
  console.log(`  to:     ${RECIPIENT}`);
  console.log(`  region: ${sesRegion}`);

  const result = await sesClient.send(
    new SendEmailCommand({
      Source: fromAddress,
      Destination: {
        ToAddresses: [RECIPIENT],
      },
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: "Skill Hub SES client test",
        },
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: "This message was sent by the Skill Hub send-test-email script to verify the SES client can deliver email.",
          },
          Html: {
            Charset: "UTF-8",
            Data: `
              <div style="font-family: Arial, Helvetica, sans-serif; color: #18181b; line-height: 1.6;">
                <p>Hi,</p>
                <p>This message was sent by the Skill Hub <code>send-test-email</code> script to verify the SES client can deliver email.</p>
              </div>
            `,
          },
        },
      },
    }),
  );

  console.log(`\nSend succeeded.`);
  console.log(`  MessageId: ${result.MessageId}`);
  console.log(`  Check the inbox at ${RECIPIENT}.`);
}

main().catch((error) => {
  console.error("AUTH_INTERNAL_ERROR: Failed to send test email via AWS SES.", {
    to: RECIPIENT,
    error,
  });
  process.exit(1);
});
