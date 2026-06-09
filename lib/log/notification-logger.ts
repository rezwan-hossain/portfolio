// lib/log/notification-logger.ts
import { logger } from "@/lib/logger";
import type { Logger } from "pino";

type NotificationContext = {
  requestId?: string;
  userId?: string;
  orderId?: string;
  type: "email" | "sms";
};

function getLog(log?: Logger) {
  return log ?? logger;
}

export function logNotificationSuccess(ctx: NotificationContext, log?: Logger) {
  getLog(log).info(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      orderId: ctx.orderId,
      notification: {
        type: ctx.type,
      },
    },
    `notification:${ctx.type}_sent`,
  );
}

export function logNotificationFailure(
  ctx: NotificationContext,
  error: unknown,
  log?: Logger,
) {
  getLog(log).error(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      orderId: ctx.orderId,
      notification: {
        type: ctx.type,
      },
      err: error,
    },
    `notification:${ctx.type}_failed`,
  );
}

export function logNotificationSkipped(
  ctx: NotificationContext,
  reason: string,
  log?: Logger,
) {
  getLog(log).warn(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      orderId: ctx.orderId,
      notification: {
        type: ctx.type,
        reason,
      },
    },
    `notification:${ctx.type}_skipped — ${reason}`,
  );
}
