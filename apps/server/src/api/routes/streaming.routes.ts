/**
 * Streaming Routes
 * Minimal implementation: forward UI messages to the AI model and stream back the response.
 * No validation, persistence, or context/rules.
 */

import { convertToModelMessages, streamText } from "ai";

import { Hono } from "hono";
import {
  getDefaultModel,
  getModelInstance,
  getProviderFromModel,
} from "../lib/ai/provider-factory";
import type { AuthVariables } from "../types/auth.types";
import type { AppContext } from "../types/hono.types";

const app = new Hono<{ Variables: AuthVariables }>();

app.post("/", async (c: AppContext) => {
  const body = await c.req.json();

  const uiMessages = body.messages ?? [];
  const requestedModel = body.model;
  const modelId = requestedModel ?? getDefaultModel("GEMINI");

  const provider = getProviderFromModel(modelId);
  const modelInstance = getModelInstance(provider, modelId);

  const result = streamText({
    model: modelInstance,
    messages: convertToModelMessages(uiMessages),
    // temperature: 0.7,
  });
  return result.toUIMessageStreamResponse();

  // return result.toUIMessageStreamResponse({
  //   originalMessages: uiMessages,
  // });
});

app.get("/models", async (c: AppContext) => {
  const { getAllAvailableModels, checkAPIKeys } = await import(
    "../lib/ai/provider-factory"
  );

  const models = getAllAvailableModels();
  const keys = checkAPIKeys();

  const filtered = models.filter((model) => {
    if (model.provider === "GEMINI") {
      return keys.gemini;
    }
    if (model.provider === "CLAUDE") {
      return keys.claude;
    }
    if (model.provider === "OPENAI") {
      return keys.openai;
    }
    if (model.provider === "OPENROUTER") {
      return keys.openrouter;
    }
    return false;
  });

  return c.json({
    models: filtered,
    default: "gemini-2.0-flash-exp",
  });
});

app.get("/health", async (c: AppContext) => {
  const { checkAPIKeys } = await import("../lib/ai/provider-factory");
  const keys = checkAPIKeys();

  return c.json({
    status: "ok",
    streaming: true,
    providers: keys,
  });
});

export default app;
