// lib/log/auth-logger.ts
import { logger } from "@/lib/logger";
import type { Logger } from "pino";

type AuthFailureReason =
  | "no_session"
  | "expired_token"
  | "invalid_token"
  | "insufficient_role"
  | "account_disabled"
  | "too_many_attempts"
  | "user_not_in_db"
  | "guest_creation_failed"
  | string;

type AuthContext = {
  requestId?: string;
  userId?: string;
  action?: string;
  reason: AuthFailureReason;
  extra?: Record<string, unknown>;
};

function getLog(log?: Logger) {
  return log ?? logger;
}

export function logAuthFailure(ctx: AuthContext, log?: Logger) {
  getLog(log).warn(
    {
      requestId: ctx.requestId,
      userId: ctx.userId ?? "anonymous",
      action: ctx.action,
      auth: {
        reason: ctx.reason,
        ...ctx.extra,
      },
    },
    `auth:failure — ${ctx.reason}`,
  );
}

export function logAuthSuccess(
  ctx: {
    requestId?: string;
    userId: string;
    action?: string;
    isGuest?: boolean;
  },
  log?: Logger,
) {
  getLog(log).info(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      action: ctx.action,
      auth: {
        isGuest: ctx.isGuest ?? false,
      },
    },
    "auth:success",
  );
}

export function logAuthGuestCreated(
  ctx: {
    requestId?: string;
    guestUserId: string;
    action?: string;
  },
  log?: Logger,
) {
  getLog(log).info(
    {
      requestId: ctx.requestId,
      userId: ctx.guestUserId,
      action: ctx.action,
      auth: {
        isGuest: true,
        guestUserId: ctx.guestUserId,
      },
    },
    "auth:guest_created",
  );
}
