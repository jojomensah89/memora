import type { Next } from "hono";
import { auth } from "../../lib/auth";
import type { AppContext } from "../types/hono.types";

export async function authMiddleware(c: AppContext, next: Next): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      c.status(401);
      c.json({ error: "Authentication required" });
      return;
    }

    c.set("session", session);
    c.set("authUser", session.user);

    await next();
  } catch (error) {
    c.status(401);
    c.json({
      error: "Authentication failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function optionalAuth(c: AppContext, next: Next): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (session) {
      c.set("session", session);
      c.set("authUser", session.user);
    }

    await next();
  } catch (_error) {
    await next();
  }
}

export function createAuthMiddleware() {
  return authMiddleware;
}
