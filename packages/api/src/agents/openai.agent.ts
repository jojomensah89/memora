import { openai } from "@ai-sdk/openai";
import { experimental_createModelAPIAgent as createModelAPIAgent } from "ai";

/**
 * OpenAI GPT-4o Agent
 * Configured for intelligent conversations with vision support
 */

export const openaiAgent = createModelAPIAgent({
  model: openai("gpt-4o"),
  config: {
    maxSteps: 5,
  },
  experimental_toolCallRepair: true,
});

// Export default model configuration
export const OPENAI_DEFAULT_MODEL = "gpt-4o";

// Alternative OpenAI models
export const openaiMiniAgent = createModelAPIAgent({
  model: openai("gpt-4o-mini"),
  config: {
    maxSteps: 5,
  },
});
