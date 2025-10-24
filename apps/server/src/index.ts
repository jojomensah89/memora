import "dotenv/config";
import { google } from "@ai-sdk/google";
import { auth } from "@memora/auth";
import { convertToModelMessages, streamText } from "ai";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { createApp as createApiApp } from "./api/app";

// Create the main API app
const apiApp = createApiApp();

// Create the server app
const app = new Hono();

// Apply global middleware to server app
app.use(logger());

// Mount API app
app.route("/", apiApp);

// AI streaming endpoint (separate from REST endpoints)
app.post("/ai", async (c) => {
  const body = await c.req.json();
  const uiMessages = body.messages || [];
  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(uiMessages),
  });

  return result.toUIMessageStreamResponse();
});

// Auth routes (public) - Better Auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Root endpoint with API information
app.get("/", (c) =>
  c.json({
    name: "Memora AI Server",
    status: "running",
    version: "1.0.0",
    endpoints: {
      api: "/api",
      health: "/api/health",
      auth: "/api/auth",
      ai: "/ai",
    },
  })
);

export default app;
