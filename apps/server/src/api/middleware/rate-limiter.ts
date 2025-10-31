import prisma from "@memora/db";
import type { Context, Next } from "hono";

const HTTP_STATUS = {
  TOO_MANY_REQUESTS: 429,
} as const;

type RateLimitOptions = {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
};

const getWindowKey = (ip: string, route: string): string => {
  const normalizedRoute = route.replace(/\/\d+/g, "/:id");
  return `api:${normalizedRoute}:${ip}`;
};

export const rateLimiter =
  (options: RateLimitOptions) => async (c: Context, next: Next) => {
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown";

    const route = c.req.path;
    const key = getWindowKey(ip, route);
    const now = Date.now();
    const windowStart = now - options.windowMs;

    try {
      const result = await prisma.rateLimit.findUnique({
        where: { key },
      });

      let count = 1;
      let resetTime = now + options.windowMs;

      if (result?.lastRequest && result.lastRequest > windowStart) {
        count = result.count + 1;

        if (count > options.max) {
          const remainingTime = Math.ceil(
            (result.lastRequest + options.windowMs - now) / 1000
          );

          c.header("X-RateLimit-Limit", String(options.max));
          c.header("X-RateLimit-Remaining", "0");
          c.header("X-RateLimit-Reset", String(resetTime));
          c.header("X-Retry-After", String(remainingTime));

          return c.json(
            {
              error: "Too Many Requests",
              message: options.message || "Rate limit exceeded",
              retryAfter: remainingTime,
            },
            HTTP_STATUS.TOO_MANY_REQUESTS
          );
        }

        resetTime = result.lastRequest + options.windowMs;
      }

      const remaining = Math.max(0, options.max - count);
      c.header("X-RateLimit-Limit", String(options.max));
      c.header("X-RateLimit-Remaining", String(remaining));
      c.header("X-RateLimit-Reset", String(resetTime));

      await prisma.rateLimit.upsert({
        where: { key },
        update: {
          count,
          lastRequest: now,
        },
        create: {
          key,
          count,
          lastRequest: now,
        },
      });

      await next();
    } catch (error) {
      await next();
    }
  };

export const createRateLimiter = (windowSeconds: number, max: number) =>
  rateLimiter({ windowMs: windowSeconds * 1000, max });
