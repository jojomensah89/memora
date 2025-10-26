import { Hono } from "hono";
import { createAuthMiddleware } from "../middleware/auth";
import chatRoutes from "./chat.routes";
import chatShareRoutes from "./chat-share.routes";
import contextRoutes from "./context.routes";
import messageRoutes from "./message.routes";
import rulesRoutes from "./rules.routes";
import streamingRoutes from "./streaming.routes";
import tokenUsageRoutes from "./token-usage.routes";

export function setupRoutes(app: Hono) {
  // Group for protected routes
  const protectedRoutes = new Hono();
  protectedRoutes.use("*", createAuthMiddleware());

  // Private data endpoint for testing auth
  protectedRoutes.get("/private-data", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({
      message: "This is private data",
      user: authUser,
    });
  });

  // Mount feature routes
  protectedRoutes.route("/chat", streamingRoutes); // MUST be before /api/chats for proper routing
  protectedRoutes.route("/chats", chatRoutes);
  protectedRoutes.route("/rules", rulesRoutes);
  protectedRoutes.route("/context-engine", contextRoutes);
  protectedRoutes.route("/messages", messageRoutes);
  protectedRoutes.route("/token-usage", tokenUsageRoutes);
  protectedRoutes.route("/chat-share", chatShareRoutes);

  // Mount the protected routes group under /api/v1
  app.route("/api/v1", protectedRoutes);

  return app;
}
