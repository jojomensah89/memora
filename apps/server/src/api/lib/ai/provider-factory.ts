/**
 * AI Provider Factory
 * Creates model instances for different AI providers
 */

import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { InvalidModelError } from "../../common/errors";

export type AIProvider = "CLAUDE" | "GEMINI" | "OPENAI";

/**
 * Model configurations for each provider
 */
const MODEL_CONFIG = {
  CLAUDE: {
    prefix: "claude",
    defaultModel: "claude-3-5-sonnet-20241022",
    models: [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-opus-4-20250514",
    ],
  },
  GEMINI: {
    prefix: "gemini",
    defaultModel: "gemini-2.0-flash-exp",
    models: [
      "gemini-2.0-flash-exp",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest",
    ],
  },
  OPENAI: {
    prefix: "gpt",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
} as const;

/**
 * Get AI model instance for streaming
 */
export function getModelInstance(
  provider: AIProvider,
  modelId: string
): LanguageModel {
  switch (provider) {
    case "CLAUDE":
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new InvalidModelError("ANTHROPIC_API_KEY is not configured");
      }
      return anthropic(modelId);

    case "GEMINI":
      if (!process.env.GOOGLE_API_KEY) {
        throw new InvalidModelError("GOOGLE_API_KEY is not configured");
      }
      return google(modelId);

    case "OPENAI":
      if (!process.env.OPENAI_API_KEY) {
        throw new InvalidModelError("OPENAI_API_KEY is not configured");
      }
      return openai(modelId);

    default:
      throw new InvalidModelError(`Unsupported provider: ${provider}`);
  }
}

/**
 * Determine provider from model ID
 */
export function getProviderFromModel(modelId: string): AIProvider {
  if (modelId.startsWith("claude")) {
    return "CLAUDE";
  }
  if (modelId.startsWith("gemini")) {
    return "GEMINI";
  }
  if (modelId.startsWith("gpt")) {
    return "OPENAI";
  }

  throw new InvalidModelError(
    `Cannot determine provider for model: ${modelId}`
  );
}

/**
 * Validate model ID for a provider
 */
export function validateModel(provider: AIProvider, modelId: string): boolean {
  const config = MODEL_CONFIG[provider];
  return config.models.includes(modelId as never);
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: AIProvider): string {
  return MODEL_CONFIG[provider].defaultModel;
}

/**
 * Get all available models for a provider
 */
export function getAvailableModels(provider: AIProvider): string[] {
  return [...MODEL_CONFIG[provider].models];
}

/**
 * Get all available models across all providers
 */
export function getAllAvailableModels(): Array<{
  provider: AIProvider;
  modelId: string;
  name: string;
}> {
  return [
    // Claude models
    {
      provider: "CLAUDE",
      modelId: "claude-opus-4-20250514",
      name: "Claude 4 Opus",
    },
    {
      provider: "CLAUDE",
      modelId: "claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet",
    },
    {
      provider: "CLAUDE",
      modelId: "claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku",
    },
    {
      provider: "CLAUDE",
      modelId: "claude-3-opus-20240229",
      name: "Claude 3 Opus",
    },
    // Gemini models
    {
      provider: "GEMINI",
      modelId: "gemini-2.0-flash-exp",
      name: "Gemini 2.0 Flash (Experimental)",
    },
    {
      provider: "GEMINI",
      modelId: "gemini-1.5-pro-latest",
      name: "Gemini 1.5 Pro",
    },
    {
      provider: "GEMINI",
      modelId: "gemini-1.5-flash-latest",
      name: "Gemini 1.5 Flash",
    },
    // OpenAI models
    { provider: "OPENAI", modelId: "gpt-4o", name: "GPT-4o" },
    { provider: "OPENAI", modelId: "gpt-4o-mini", name: "GPT-4o Mini" },
    { provider: "OPENAI", modelId: "gpt-4-turbo", name: "GPT-4 Turbo" },
    {
      provider: "OPENAI",
      modelId: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
    },
  ];
}

/**
 * Check if API keys are configured
 */
export function checkAPIKeys(): {
  claude: boolean;
  gemini: boolean;
  openai: boolean;
} {
  return {
    claude: Boolean(process.env.ANTHROPIC_API_KEY),
    gemini: Boolean(process.env.GOOGLE_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
  };
}
