// lib/log/action-logger.ts
import { logger } from "@/lib/logger";
import { headers } from "next/headers";

export async function getRequestId(): Promise<string> {
  const h = await headers();
  return h.get("x-request-id") ?? crypto.randomUUID();
}

type ActionContext = {
  action: string;
  userId?: string;
  isGuest?: boolean;
  extra?: Record<string, unknown>;
};

export async function createActionLogger(ctx: ActionContext) {
  const requestId = await getRequestId();

  const log = logger.child({
    requestId,
    action: ctx.action,
    userId: ctx.userId ?? "anonymous",
    isGuest: ctx.isGuest ?? false,
    ...ctx.extra,
  });

  const start = Date.now();

  log.info("action:start");

  return {
    log,
    requestId,
    start,

    success(extra?: Record<string, unknown>) {
      log.info(
        {
          durationMs: Date.now() - start,
          ...extra,
        },
        "action:success",
      );
    },

    failure(error: unknown, extra?: Record<string, unknown>) {
      log.error(
        {
          durationMs: Date.now() - start,
          err: error,
          ...extra,
        },
        "action:error",
      );
    },

    warn(msg: string, extra?: Record<string, unknown>) {
      log.warn(
        {
          durationMs: Date.now() - start,
          ...extra,
        },
        msg,
      );
    },
  };
}
