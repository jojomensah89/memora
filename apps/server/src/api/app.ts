import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "../lib/auth";
import { createAuthMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import { createRateLimiter } from "./middleware/rate-limiter";
import { setupRoutes } from "./routes";

// Create and configure the main Hono app
const app = new Hono();

// 1. Apply global middleware first
app.use(logger());

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposeHeaders: ["Set-Cookie"],
    maxAge: 600,
  })
);

// 2. Apply rate limiting middleware (after CORS but before error handling)
app.use("/api/*", createRateLimiter(60, 120)); // 120 requests per minute for general API
app.use("/ai", createRateLimiter(60, 30)); // 30 requests per minute for AI endpoints

// 3. Apply error handling globally
app.onError(errorHandler);

// 4. Health check endpoint (public, no auth required)
app.get("/api/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
);

/// 5. Auth routes (public, MUST be before protected API routes)
app.all("/api/auth/*", async (c) => {
  const response = await auth.handler(c.req.raw);
  return response;
});

/// 6. AI streaming endpoint (protected)
app.post("/ai", createAuthMiddleware(), async (c) => {
  const body = await c.req.json();
  const uiMessages = body.messages || [];
  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(uiMessages),
  });

  return result.toUIMessageStreamResponse();
});

// 7. Setup all protected API routes (versioned)
setupRoutes(app);

// 8. Root endpoint with API information (last)
app.get("/", (c) =>
  c.json({
    name: "Memora AI Server",
    status: "running",
    version: "1.0.0",
    api: {
      health: "/api/health",
      auth: "/api/auth/**",
      v1: "/api/v1",
    },
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/**",
      ai: "/ai",
      v1: {
        chats: "/api/v1/chats",
        messages: "/api/v1/messages",
        rules: "/api/v1/rules",
        context: "/api/v1/context-engine",
        streaming: "/api/v1/chat",
        tokenUsage: "/api/v1/token-usage",
        chatShare: "/api/v1/chat-share",
      },
    },
  })
);

// Export the configured app
export default app;
