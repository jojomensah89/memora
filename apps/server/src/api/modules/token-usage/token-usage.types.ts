import type { AIProvider } from "@prisma/client";

export type TokenUsageEntry = {
  id: string;
  provider: AIProvider;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  createdAt: Date;
  chatId: string;
  messageId: string;
};

export type TokenUsageStatistics = {
  totalTokens: number;
  totalCost: number;
  totalMessages: number;
  averageTokensPerMessage: number;
  averageCostPerMessage: number;
  providerStats: Array<{
    provider: AIProvider;
    totalTokens: number;
    totalCost: number;
    messageCount: number;
  }>;
  modelStats: Array<{
    modelId: string;
    provider: AIProvider;
    totalTokens: number;
    totalCost: number;
    messageCount: number;
  }>;
};

export type TokenUsageOverTime = Array<{
  date: string;
  tokens: number;
  cost: number;
  messageCount: number;
}>;

export type CreateTokenUsageData = {
  provider: AIProvider;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  chatId: string;
  messageId: string;
};

export type TokenUsageFilters = {
  startDate?: string;
  endDate?: string;
  provider?: AIProvider;
  modelId?: string;
  chatId?: string;
};
