// lib/log/api-logger.ts
import { logger, type ChildLogger } from "@/lib/logger";

type ExternalApiContext = {
  service: string;
  method: string;
  url: string;
  requestId?: string;
  userId?: string;
  extra?: Record<string, unknown>;
};

function getLog(log?: ChildLogger): ChildLogger {
  return log ?? logger;
}

export function logExternalApiStart(
  ctx: ExternalApiContext,
  log?: ChildLogger,
) {
  getLog(log).info(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      externalApi: {
        service: ctx.service,
        method: ctx.method,
        url: ctx.url,
        ...ctx.extra,
      },
    },
    `external_api:start — ${ctx.service}`,
  );
}

export function logExternalApiSuccess(
  ctx: ExternalApiContext & { statusCode?: number; durationMs: number },
  log?: ChildLogger,
) {
  getLog(log).info(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      externalApi: {
        service: ctx.service,
        method: ctx.method,
        url: ctx.url,
        statusCode: ctx.statusCode,
        durationMs: ctx.durationMs,
        ...ctx.extra,
      },
    },
    `external_api:success — ${ctx.service} ${ctx.durationMs}ms`,
  );
}

export function logExternalApiFailure(
  ctx: ExternalApiContext & {
    statusCode?: number;
    durationMs: number;
    error: unknown;
  },
  log?: ChildLogger,
) {
  getLog(log).error(
    {
      requestId: ctx.requestId,
      userId: ctx.userId,
      externalApi: {
        service: ctx.service,
        method: ctx.method,
        url: ctx.url,
        statusCode: ctx.statusCode,
        durationMs: ctx.durationMs,
        ...ctx.extra,
      },
      err: ctx.error,
    },
    `external_api:failure — ${ctx.service}`,
  );
}

export async function fetchWithLog<T>(
  ctx: ExternalApiContext,
  fetchFn: () => Promise<Response>,
  log?: ChildLogger,
): Promise<T> {
  const start = Date.now();
  logExternalApiStart(ctx, log);

  try {
    const res = await fetchFn();
    const durationMs = Date.now() - start;

    if (!res.ok) {
      logExternalApiFailure(
        {
          ...ctx,
          statusCode: res.status,
          durationMs,
          error: `HTTP ${res.status}`,
        },
        log,
      );
      throw new Error(`${ctx.service} API error: HTTP ${res.status}`);
    }

    logExternalApiSuccess({ ...ctx, statusCode: res.status, durationMs }, log);

    return res.json() as Promise<T>;
  } catch (error) {
    const durationMs = Date.now() - start;
    logExternalApiFailure({ ...ctx, durationMs, error }, log);
    throw error;
  }
}
