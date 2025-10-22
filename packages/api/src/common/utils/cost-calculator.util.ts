import type { AIProvider } from "@prisma/client";
import { getModelCost } from "../constants";

/**
 * Cost Calculator Utility
 * Calculates costs for AI provider usage
 */

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  provider: AIProvider;
  model: string;
}

/**
 * Calculate cost for tokens
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  provider: AIProvider,
  model: string
): CostEstimate {
  const costs = getModelCost(provider, model);

  if (!costs) {
    // Unknown model - return zero cost
    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      provider,
      model,
    };
  }

  // Costs are per 1M tokens, convert to actual cost
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    provider,
    model,
  };
}

/**
 * Estimate cost before sending (output tokens unknown)
 * Assumes 1:1 input:output ratio for estimation
 */
export function estimateCost(
  inputTokens: number,
  provider: AIProvider,
  model: string,
  outputRatio = 1.0
): CostEstimate {
  const estimatedOutputTokens = Math.ceil(inputTokens * outputRatio);
  return calculateCost(inputTokens, estimatedOutputTokens, provider, model);
}

/**
 * Format cost as currency string
 */
export function formatCost(cost: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(cost);
}
