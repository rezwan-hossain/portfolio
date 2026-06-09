import "server-only";
import pino, { type Logger, type TransportSingleOptions } from "pino";

const isDev = process.env.NODE_ENV === "development";

const REDACTED_PATHS = [
  // Auth / secrets
  "password",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "headers.authorization",
  "headers.cookie",

  // API credentials
  "apiKey",
  "secret",
  "clientSecret",
  "stripeSecretKey",
  "headers.x-api-key",

  // Personal data
  "email",
  "phone",
  "customerEmail",
  "customerPhone",
  "user.email",

  // Nested query data
  "db.query.email",
  "db.query.phone",
  "db.query.customerEmail",
  "db.query.customerPhone",

  // Form / request body
  "formData.email",
  "formData.phone",
  "body.email",
  "body.password",
  "body.token",

  // User objects
  "user.password",
] as const;

function buildTransport(): ReturnType<typeof pino.transport> | undefined {
  if (isDev) {
    return pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    });
  }

  const token = process.env.AXIOM_TOKEN?.trim();
  const dataset = process.env.AXIOM_DATASET?.trim();

  if (token && dataset) {
    // Prevent aggressive static analysis by bundlers
    const target: TransportSingleOptions["target"] = "@axiomhq/pino";

    return pino.transport({
      target,
      options: {
        token,
        dataset,
      },
    });
  }

  // Fallback: structured JSON logs to stdout
  // Vercel and most platforms automatically capture these.
  return undefined;
}

let transport: ReturnType<typeof pino.transport> | undefined;

try {
  transport = buildTransport();
} catch (error) {
  console.error("Failed to initialize logger transport:", error);
}

export const logger: Logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",

    base: {
      service: "race-registration-app",
      env: process.env.NODE_ENV,
    },

    redact: {
      paths: [...REDACTED_PATHS],
      censor: "[REDACTED]",
    },

    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);

// Optional helper for request-scoped logging
export function createRequestLogger(
  requestId: string,
  action: string,
  userId?: string,
) {
  return logger.child({
    requestId,
    action,
    ...(userId ? { userId } : {}),
  });
}
