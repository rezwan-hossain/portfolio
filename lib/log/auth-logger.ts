// lib/log/auth-logger.ts
import { logger, type ChildLogger } from "@/lib/logger";

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

function getLog(log?: ChildLogger): ChildLogger {
  return log ?? logger;
}

export function logAuthFailure(ctx: AuthContext, log?: ChildLogger) {
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
  log?: ChildLogger,
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
  log?: ChildLogger,
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
