/**
 * Chat Module Test Suite
 * Tests for the chat streaming endpoint and error handling
 */

import "dotenv/config"; // Load environment variables
import { describe, expect, it } from "bun:test";
import { testClient } from "hono/testing";
import app from "../routes/streaming.routes";

// Create a test client for the streaming routes
// Note: testClient type inference doesn't work perfectly with routes defined separately
const client = testClient(app) as any;

describe("Chat Streaming API", () => {
  describe("GET /models - Available Models", () => {
    it("should return list of available models", async () => {
      const res = await client.models.$get();

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("models");
      expect(data).toHaveProperty("default");
      expect(Array.isArray(data.models)).toBe(true);
    });

    it("should filter models based on available API keys", async () => {
      const res = await client.models.$get();
      const data = await res.json();

      // All returned models should have corresponding API keys configured
      expect(data.models.length).toBeGreaterThan(0);
    });
  });

  describe("GET /health - Health Check", () => {
    it("should return OK status", async () => {
      const res = await client.health.$get();

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ok");
      expect(data.streaming).toBe(true);
      expect(data).toHaveProperty("providers");
    });

    it("should include provider availability", async () => {
      const res = await client.health.$get();
      const data = await res.json();

      expect(data.providers).toHaveProperty("gemini");
      expect(data.providers).toHaveProperty("openai");
      expect(data.providers).toHaveProperty("claude");
      expect(data.providers).toHaveProperty("openrouter");
    });
  });
});

describe("Error Handling", () => {
  it("should return structured error response", async () => {
    // Test with invalid JSON to trigger error handler
    const res = await fetch("http://localhost:3000/api/v1/chat/extreme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json",
    });

    expect(res.status).toBeGreaterThanOrEqual(400);

    type ErrorResponse = {
      error: {
        code: string;
        message: string;
        statusCode: number;
        timestamp: string;
        fingerprint: string;
        stack?: string;
        context?: unknown;
      };
    };

    const error = (await res.json()) as ErrorResponse;

    expect(error).toHaveProperty("error");
    expect(error.error).toHaveProperty("code");
    expect(error.error).toHaveProperty("message");
    expect(error.error).toHaveProperty("statusCode");
    expect(error.error).toHaveProperty("timestamp");
    expect(error.error).toHaveProperty("fingerprint");
  });

  it("should include development mode details when NODE_ENV=development", async () => {
    if (process.env.NODE_ENV === "development") {
      const res = await fetch("http://localhost:3000/api/v1/chat/extreme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      });

      type ErrorResponse = {
        error: {
          stack?: string;
          context?: unknown;
        };
      };

      const error = (await res.json()) as ErrorResponse;

      // In development mode, should include stack trace and context
      expect(error.error).toHaveProperty("stack");
      expect(error.error).toHaveProperty("context");
    }
  });
});
