import type { Context, Next } from "hono";
import { auth } from "../../lib/auth";

export function authMiddleware(c: Context, next: Next) {
  return async () => {
    try {
      // Get session using Better Auth
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session) {
        return c.json({ error: "Authentication required" }, 401);
      }

      // Set user data in context
      c.set("session", session);
      c.set("authUser", session?.user);

      await next();
    } catch (error) {
      return c.json({ error: "Authentication failed", details: error }, 401);
    }
  };
}

// Simple wrapper that returns proper Hono middleware
export function createAuthMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      // Get session using Better Auth
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session) {
        return c.json({ error: "Authentication required" }, 401);
      }

      // Set user data in context
      c.set("session", session);
      c.set("authUser", session?.user);

      await next();
    } catch (error) {
      return c.json({ error: "Authentication failed", details: error }, 401);
    }
  };
}
