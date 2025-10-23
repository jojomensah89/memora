import type { AIProvider } from "@prisma/client";

/**
 * Available AI Models Configuration
 */

export type ModelConfig = {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number; // Max tokens
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsVision: boolean;
};

export const AVAILABLE_MODELS: ModelConfig[] = [
  // Claude Models
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "CLAUDE",
    contextWindow: 200_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "CLAUDE",
    contextWindow: 200_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: false,
  },

  // Gemini Models
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash (Experimental)",
    provider: "GEMINI",
    contextWindow: 1_000_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "GEMINI",
    contextWindow: 2_000_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
  },

  // OpenAI Models
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OPENAI",
    contextWindow: 128_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OPENAI",
    contextWindow: 128_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
  },
];

/**
 * Get model configuration
 */
export function getModelConfig(modelId: string): ModelConfig | null {
  return AVAILABLE_MODELS.find((m) => m.id === modelId) || null;
}

/**
 * Get models for a specific provider
 */
export function getModelsByProvider(provider: AIProvider): ModelConfig[] {
  return AVAILABLE_MODELS.filter((m) => m.provider === provider);
}

/**
 * Validate model ID
 */
export function isValidModel(modelId: string): boolean {
  return AVAILABLE_MODELS.some((m) => m.id === modelId);
}
