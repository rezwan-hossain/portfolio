// lib/log/db-logger.ts
import { logger, type ChildLogger } from "@/lib/logger";

type DbContext = {
  model: string;
  operation: string;
  requestId?: string;
  userId?: string;
  query?: Record<string, unknown>;
};

// ── use ChildLogger instead of pino Logger ────────────────────────────────────

function getLog(log?: ChildLogger): ChildLogger {
  return log ?? logger;
}

export function logDbStart(ctx: DbContext, log?: ChildLogger) {
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

export function logDbSuccess(
  ctx: DbContext,
  durationMs: number,
  log?: ChildLogger,
) {
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

export function logDbNotFound(ctx: DbContext, log?: ChildLogger) {
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

export function logDbError(ctx: DbContext, error: unknown, log?: ChildLogger) {
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
  log?: ChildLogger,
) {
  if (durationMs > threshold) {
    getLog(log).warn(
      {
        requestId: ctx.requestId,
        userId: ctx.userId,
        db: {
          model: ctx.model,
          operation: ctx.operation,
          durationMs,
          threshold,
        },
      },
      `db:slow_query — ${ctx.model}.${ctx.operation} took ${durationMs}ms`,
    );
  }
}

export async function withDbLog<T>(
  ctx: DbContext,
  fn: () => Promise<T>,
  log?: ChildLogger,
): Promise<T> {
  const start = Date.now();
  logDbStart(ctx, log);

  try {
    const result = await fn();
    const durationMs = Date.now() - start;

    logDbSlow(ctx, durationMs, 1000, log);

    if (result === null) {
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
