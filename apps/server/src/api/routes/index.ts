import type { Hono } from "hono";
import chatRoutes from "./chat.routes";
import chatShareRoutes from "./chat-share.routes";
import contextRoutes from "./context.routes";
import messageRoutes from "./message.routes";
import rulesRoutes from "./rules.routes";
import tokenUsageRoutes from "./token-usage.routes";

export function setupRoutes(app: Hono) {
  // Health check endpoint (public)
  app.get("/api/health", (c) =>
    c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    })
  );

  // Private data endpoint for testing auth
  app.get("/api/private-data", (c) => {
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
  app.route("/api/chats", chatRoutes);
  app.route("/api/rules", rulesRoutes);
  app.route("/api/context-engine", contextRoutes);
  app.route("/api/messages", messageRoutes);
  app.route("/api/token-usage", tokenUsageRoutes);
  app.route("/api/chat-share", chatShareRoutes);

  return app;
}
