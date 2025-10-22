import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { AIProvider } from "@prisma/client";
import { experimental_createModelAPIAgent as createModelAPIAgent } from "ai";
import { InvalidModelError } from "../common/errors";

/**
 * Agent Factory
 * Creates AI agents based on provider and model
 */

export class AgentFactory {
  /**
   * Get agent for specific provider and model
   */
  static getAgent(provider: AIProvider, model: string) {
    switch (provider) {
      case "CLAUDE":
        return createModelAPIAgent({
          model: anthropic(model),
          config: { maxSteps: 5 },
          experimental_toolCallRepair: true,
        });

      case "GEMINI":
        return createModelAPIAgent({
          model: google(model),
          config: { maxSteps: 5 },
          experimental_toolCallRepair: true,
        });

      case "OPENAI":
        return createModelAPIAgent({
          model: openai(model),
          config: { maxSteps: 5 },
          experimental_toolCallRepair: true,
        });

      default:
        throw new InvalidModelError(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Get default agent for provider
   */
  static getDefaultAgent(provider: AIProvider) {
    const defaultModels = {
      CLAUDE: "claude-3-5-sonnet-20241022",
      GEMINI: "gemini-2.0-flash-exp",
      OPENAI: "gpt-4o",
    };

    const model = defaultModels[provider];
    if (!model) {
      throw new InvalidModelError(`No default model for provider: ${provider}`);
    }

    return AgentFactory.getAgent(provider, model);
  }
}

// Re-export individual agents for direct use
export { claudeAgent, claudeHaikuAgent } from "./claude.agent";
export { geminiAgent, geminiFlashAgent, geminiProAgent } from "./gemini.agent";
export { openaiAgent, openaiMiniAgent } from "./openai.agent";
