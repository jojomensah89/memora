import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createAuthMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import { setupRoutes } from "./routes";

// Create and configure Hono app
export function createApp() {
  const app = new Hono();

  // Apply common middleware
  app.use("*", logger());

  app.use(
    "*",
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Apply authentication middleware to API routes
  app.use("/api/*", createAuthMiddleware());

  // Apply error handling globally
  app.onError(errorHandler);

  // Setup all API routes
  setupRoutes(app);

  // Root endpoint
  app.get("/", (c) =>
    c.json({
      name: "Memora API",
      version: "1.0.0",
      status: "running",
      endpoints: {
        api: "/api",
        health: "/api/health",
        auth: "/api/auth",
      },
    })
  );

  return app;
}

// Export default app for server usage
export default createApp;
