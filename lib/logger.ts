// lib/logger.ts
import "server-only";
import { Logger } from "next-axiom";

export interface ChildLogger {
  info(obj: object, msg?: string): void;
  info(msg: string): void;
  warn(obj: object, msg?: string): void;
  warn(msg: string): void;
  error(obj: object, msg?: string): void;
  error(msg: string): void;
  debug(obj: object, msg?: string): void;
  debug(msg: string): void;
  child(bindings: Record<string, unknown>): ChildLogger;
  flush(): Promise<void>;
}

function createShim(axiomLogger: Logger): ChildLogger {
  function normalizeArgs(
    objOrMsg: object | string,
    msg?: string,
  ): [string, Record<string, unknown>] {
    if (typeof objOrMsg === "string") {
      return [objOrMsg, {}];
    }
    return [msg ?? "", objOrMsg as Record<string, unknown>];
  }

  return {
    info(objOrMsg: object | string, msg?: string) {
      const [message, fields] = normalizeArgs(objOrMsg, msg);
      axiomLogger.info(message, fields);
    },

    warn(objOrMsg: object | string, msg?: string) {
      const [message, fields] = normalizeArgs(objOrMsg, msg);
      axiomLogger.warn(message, fields);
    },

    error(objOrMsg: object | string, msg?: string) {
      const [message, fields] = normalizeArgs(objOrMsg, msg);
      axiomLogger.error(message, fields);
    },

    debug(objOrMsg: object | string, msg?: string) {
      const [message, fields] = normalizeArgs(objOrMsg, msg);
      axiomLogger.debug(message, fields);
    },

    child(bindings: Record<string, unknown>): ChildLogger {
      return createShim(axiomLogger.with(bindings));
    },

    async flush() {
      await axiomLogger.flush();
    },
  };
}

// Correct: Logger() takes no config for fields,
// use .with() to attach global fields instead
const axiomRoot = new Logger().with({
  service: "marathon-registration-app",
  env: process.env.NODE_ENV,
});

export const logger: ChildLogger = createShim(axiomRoot);

export function createRequestLogger(
  requestId: string,
  action: string,
  userId?: string,
): ChildLogger {
  return logger.child({
    requestId,
    action,
    ...(userId ? { userId } : {}),
  });
}
