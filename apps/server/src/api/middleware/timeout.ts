import type { MiddlewareHandler } from "hono";
import { TIMEOUTS } from "../common/constants/timeouts.constants";
import { RequestTimeoutError } from "../common/errors/client.errors";

/**
 * Timeout Middleware Configuration
 */
export type TimeoutConfig = {
  timeout: number;
  message?: string;
};

/**
 * Create a timeout middleware for Hono
 * Aborts requests that exceed the specified timeout
 */
export function createTimeoutMiddleware(
  config: TimeoutConfig = { timeout: TIMEOUTS.REQUEST_DEFAULT }
): MiddlewareHandler {
  return async (c, next) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, config.timeout);

    try {
      c.req.raw.signal.addEventListener("abort", () => {
        controller.abort();
      });

      await Promise.race([
        next(),
        new Promise((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(
              new RequestTimeoutError(
                config.message || `Request timeout after ${config.timeout}ms`
              ).withContext({
                operation: "http_request_timeout",
                retryable: true,
                metadata: {
                  timeout: config.timeout,
                  path: c.req.path,
                  method: c.req.method,
                },
              })
            );
          });
        }),
      ]);
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Default timeout middleware (30s)
 */
export const timeoutMiddleware = createTimeoutMiddleware();

/**
 * Short timeout middleware for quick operations (10s)
 */
export const shortTimeoutMiddleware = createTimeoutMiddleware({
  timeout: TIMEOUTS.REQUEST_SHORT,
  message: "Operation timeout - request took too long",
});

/**
 * Long timeout middleware for file uploads (60s)
 */
export const longTimeoutMiddleware = createTimeoutMiddleware({
  timeout: TIMEOUTS.REQUEST_LONG,
  message: "Upload timeout - file upload took too long",
});
