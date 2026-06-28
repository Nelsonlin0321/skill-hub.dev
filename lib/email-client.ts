import "server-only";

import { SESClient } from "@aws-sdk/client-ses";

const AUTH_CONFIGURATION_ERROR = "AUTH_CONFIGURATION_ERROR";

export const sesRegion =
  process.env.AWS_REGION?.trim() ||
  process.env.AWS_DEFAULT_REGION?.trim() ||
  "us-east-1";

/**
 * SES client built from the AWS SDK v3 `@aws-sdk/client-ses` package.
 *
 * Credentials are resolved lazily (only when a command is sent) so that a
 * missing `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` pair surfaces as a
 * clear `AUTH_CONFIGURATION_ERROR` at send time instead of crashing the app
 * at import. The client itself is safe to construct eagerly.
 */
export const sesClient = new SESClient({
  region: sesRegion,
  credentials: async () => {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        `${AUTH_CONFIGURATION_ERROR}: Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY for SES email delivery.`,
      );
    }

    return { accessKeyId, secretAccessKey };
  },
});
