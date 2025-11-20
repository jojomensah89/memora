import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { AuthVariables } from "../types/auth.types";
import type { AppContext } from "../types/hono.types";
import chatRoutes from "./chat.routes";
import contextRoutes from "./context.routes";
import messageRoutes from "./message.routes";
import rulesRoutes from "./rules.routes";
import streamingRoutes from "./streaming.routes";

export function setupRoutes(app: Hono<{ Variables: AuthVariables }>) {
  const protectedRoutes = new Hono<{ Variables: AuthVariables }>();
  protectedRoutes.use("*", authMiddleware);

  protectedRoutes.get("/private-data", (c: AppContext) => {
    const authUser = c.get("authUser");
    return c.json({
      message: "This is private data",
      user: authUser,
    });
  });

  protectedRoutes.route("/chat", streamingRoutes);
  protectedRoutes.route("/chats", chatRoutes);
  protectedRoutes.route("/rules", rulesRoutes);
  protectedRoutes.route("/context-engine", contextRoutes);
  protectedRoutes.route("/messages", messageRoutes);

  app.route("/api/v1", protectedRoutes);

  return app;
}
