import { google } from "@ai-sdk/google";
import { experimental_createModelAPIAgent as createModelAPIAgent } from "ai";

/**
 * Gemini 2.0 Flash Agent
 * Configured for fast, intelligent conversations with extended context window
 */

export const geminiAgent = createModelAPIAgent({
  model: google("gemini-2.0-flash-exp"),
  config: {
    maxSteps: 5,
  },
  experimental_toolCallRepair: true,
});

// Export default model configuration
export const GEMINI_DEFAULT_MODEL = "gemini-2.0-flash-exp";

// Alternative Gemini models
export const geminiProAgent = createModelAPIAgent({
  model: google("gemini-1.5-pro"),
  config: {
    maxSteps: 5,
  },
});

export const geminiFlashAgent = createModelAPIAgent({
  model: google("gemini-1.5-flash"),
  config: {
    maxSteps: 5,
  },
});
