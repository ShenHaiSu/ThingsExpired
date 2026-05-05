import type { Context, Next } from "hono";
import type { SimpleLogger } from "@/utils/logger";

export function createLoggerMiddleware(logger: SimpleLogger) {
  return async function loggerMiddleware(
    c: Context,
    next: Next,
  ): Promise<Response | void> {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;

    await next();

    const duration = Date.now() - start;
    logger.info({ method, path, status: c.res.status, duration }, "HTTP 请求");
  };
}
