import type { AIProvider } from "@prisma/client";

/**
 * Token Calculator Interface
 * Contract for estimating tokens and costs
 */

export type TokenEstimate = {
  tokens: number;
  cost: number; // USD
  provider: AIProvider;
  model: string;
};

export type ITokenCalculator = {
  /**
   * Estimate tokens for text
   */
  estimateTokens(text: string, model?: string): number;

  /**
   * Calculate cost for tokens
   */
  calculateCost(tokens: number, provider: AIProvider, model: string): number;

  /**
   * Get full estimate (tokens + cost)
   */
  getEstimate(text: string, provider: AIProvider, model: string): TokenEstimate;
};
