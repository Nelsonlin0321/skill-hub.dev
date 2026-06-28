import "server-only";

import { sesClient, sesRegion } from "@/lib/email-client";
import { SendEmailCommand } from "@aws-sdk/client-ses";

const AUTH_EMAIL_FROM =
  process.env.AUTH_EMAIL_FROM?.trim() || "NoReply <noreply@leetquiz.com>";
const AUTH_INTERNAL_ERROR = "AUTH_INTERNAL_ERROR";

type SendEmailOptions = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

type VerificationEmailOptions = {
  name: string | null;
  to: string;
  verificationUrl: string;
};

type PasswordResetEmailOptions = {
  name: string | null;
  resetUrl: string;
  to: string;
};

export async function sendEmail({
  html,
  subject,
  text,
  to,
}: SendEmailOptions): Promise<void> {
  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: AUTH_EMAIL_FROM,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Charset: "UTF-8",
            Data: subject,
          },
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: html,
            },
            Text: {
              Charset: "UTF-8",
              Data: text,
            },
          },
        },
      }),
    );
  } catch (error) {
    console.error(`${AUTH_INTERNAL_ERROR}: Failed to send email via AWS SES.`, {
      from: AUTH_EMAIL_FROM,
      to,
      region: sesRegion,
      error,
    });
    throw error;
  }
}

export async function sendAuthVerificationEmail({
  name,
  to,
  verificationUrl,
}: VerificationEmailOptions): Promise<void> {
  const recipientName = name?.trim() || "there";

  await sendEmail({
    to,
    subject: "Verify your Skill Hub email address",
    text: [
      `Hi ${recipientName},`,
      "",
      "Thanks for signing up for Skill Hub.",
      `Verify your email address by visiting: ${verificationUrl}`,
      "",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #18181b; line-height: 1.6;">
        <p>Hi ${recipientName},</p>
        <p>Thanks for signing up for Skill Hub.</p>
        <p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 999px; background: #18181b; color: #ffffff; text-decoration: none; font-weight: 600;">
            Verify your email
          </a>
        </p>
        <p>If the button does not work, open this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendAuthPasswordResetEmail({
  name,
  resetUrl,
  to,
}: PasswordResetEmailOptions): Promise<void> {
  const recipientName = name?.trim() || "there";

  await sendEmail({
    to,
    subject: "Reset your Skill Hub password",
    text: [
      `Hi ${recipientName},`,
      "",
      "We received a request to reset your Skill Hub password.",
      `Reset your password here: ${resetUrl}`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #18181b; line-height: 1.6;">
        <p>Hi ${recipientName},</p>
        <p>We received a request to reset your Skill Hub password.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 999px; background: #18181b; color: #ffffff; text-decoration: none; font-weight: 600;">
            Reset your password
          </a>
        </p>
        <p>If the button does not work, open this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}
