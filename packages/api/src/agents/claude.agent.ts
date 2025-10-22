import { anthropic } from "@ai-sdk/anthropic";
import { experimental_createModelAPIAgent as createModelAPIAgent } from "ai";

/**
 * Claude 3.5 Sonnet Agent
 * Configured for intelligent conversations with context and rules support
 */

export const claudeAgent = createModelAPIAgent({
  model: anthropic("claude-3-5-sonnet-20241022"),
  config: {
    maxSteps: 5,
  },
  experimental_toolCallRepair: true,
});

// Export default model configuration
export const CLAUDE_DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

// Alternative Claude models
export const claudeHaikuAgent = createModelAPIAgent({
  model: anthropic("claude-3-5-haiku-20241022"),
  config: {
    maxSteps: 5,
  },
});
