/**
 * AI Provider Pricing (per 1M tokens)
 * Updated as of 2025 - verify with provider docs
 */

export const COST_CONSTANTS = {
  TOKENS_PER_MILLION: 1_000_000,
} as const;

export const AI_PROVIDER_COSTS = {
  CLAUDE: {
    "claude-3-5-sonnet-20241022": {
      input: 3.0, // $3 per 1M input tokens
      output: 15.0, // $15 per 1M output tokens
    },
    "claude-3-5-haiku-20241022": {
      input: 0.8,
      output: 4.0,
    },
    "claude-3-opus-20240229": {
      input: 15.0,
      output: 75.0,
    },
  },
  GEMINI: {
    "gemini-2.0-flash-exp": {
      input: 0.0, // Free during preview
      output: 0.0,
    },
    "gemini-1.5-pro": {
      input: 1.25,
      output: 5.0,
    },
    "gemini-1.5-flash": {
      input: 0.075,
      output: 0.3,
    },
  },
  OPENAI: {
    "gpt-4o": {
      input: 2.5,
      output: 10.0,
    },
    "gpt-4o-mini": {
      input: 0.15,
      output: 0.6,
    },
    "gpt-4-turbo": {
      input: 10.0,
      output: 30.0,
    },
  },
} as const;

/**
 * Get cost for a specific model
 */
export function getModelCost(
  provider: keyof typeof AI_PROVIDER_COSTS,
  model: string
): { input: number; output: number } | null {
  const providerCosts = AI_PROVIDER_COSTS[provider];
  if (!providerCosts) {
    return null;
  }

  const modelCosts = providerCosts[model as keyof typeof providerCosts];
  return modelCosts || null;
}
