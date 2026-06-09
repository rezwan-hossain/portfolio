// lib/log/db-logger.ts
import { logger } from "@/lib/logger";
import type { Logger } from "pino";

type DbContext = {
  model: string;
  operation: string;
  requestId?: string;
  userId?: string;
  query?: Record<string, unknown>;
};

// use child logger from action if available
// or fallback to root logger
function getLog(log?: Logger) {
  return log ?? logger;
}

export function logDbStart(ctx: DbContext, log?: Logger) {
  getLog(log).info(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      db: {
        model: ctx.model,
        operation: ctx.operation,
        query: ctx.query,
      },
    },
    `db:start — ${ctx.model}.${ctx.operation}`,
  );
}

export function logDbSuccess(ctx: DbContext, durationMs: number, log?: Logger) {
  getLog(log).info(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      db: {
        model: ctx.model,
        operation: ctx.operation,
        durationMs,
      },
    },
    `db:success — ${ctx.model}.${ctx.operation}`,
  );
}

export function logDbNotFound(ctx: DbContext, log?: Logger) {
  getLog(log).warn(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      db: {
        model: ctx.model,
        operation: ctx.operation,
        query: ctx.query,
      },
    },
    `db:not_found — ${ctx.model}.${ctx.operation}`,
  );
}

export function logDbError(ctx: DbContext, error: unknown, log?: Logger) {
  getLog(log).error(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      db: {
        model: ctx.model,
        operation: ctx.operation,
        query: ctx.query,
      },
      err: error,
    },
    `db:error — ${ctx.model}.${ctx.operation}`,
  );
}

export function logDbSlow(
  ctx: DbContext,
  durationMs: number,
  threshold = 1000,
  log?: Logger,
) {
  if (durationMs > threshold) {
    getLog(log).warn(
      {
        requestId: ctx.requestId,
        userId: ctx.userId,
        db: {
          model: ctx.model,
          operation: ctx.operation,
          query: ctx.query,
          durationMs,
          threshold,
        },
      },
      `db:slow_query — ${ctx.model}.${ctx.operation} took ${durationMs}ms`,
    );
  }
}

// convenience wrapper — runs your db call and logs everything
export async function withDbLog<T>(
  ctx: DbContext,
  fn: () => Promise<T>,
  log?: Logger,
): Promise<T> {
  const start = Date.now();
  logDbStart(ctx, log);

  try {
    const result = await fn();
    const durationMs = Date.now() - start;

    logDbSlow(ctx, durationMs, 1000, log);

    if (result === null || result === undefined) {
      logDbNotFound(ctx, log);
    } else {
      logDbSuccess(ctx, durationMs, log);
    }

    return result;
  } catch (error) {
    logDbError(ctx, error, log);
    throw error;
  }
}
