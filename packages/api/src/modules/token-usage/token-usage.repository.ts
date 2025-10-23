import type { Prisma, TokenUsage as PrismaTokenUsage } from "@prisma/client";
import { BaseRepository } from "../../common/base";
import { DatabaseError } from "../../common/errors";
import type {
  CreateTokenUsageData,
  TokenUsageEntry,
  TokenUsageFilters,
  TokenUsageOverTime,
  TokenUsageStatistics,
} from "./token-usage.types";

export class TokenUsageRepository extends BaseRepository<PrismaTokenUsage> {
  async createTokenUsage(data: CreateTokenUsageData): Promise<TokenUsageEntry> {
    try {
      const costs = await this.calculateCost(
        data.provider,
        data.modelId,
        data.inputTokens,
        data.outputTokens
      );

      return await this.prisma.tokenUsage.create({
        data: {
          provider: data.provider,
          modelId: data.modelId,
          inputTokens: data.inputTokens,
          outputTokens: data.outputTokens,
          totalTokens: data.inputTokens + data.outputTokens,
          cost: costs.totalCost,
          chatId: data.chatId,
          messageId: data.messageId,
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to create token usage entry", error);
    }
  }

  async getUsageByUser(
    userId: string,
    filters: TokenUsageFilters = {}
  ): Promise<TokenUsageStatistics> {
    try {
      const whereClause = this.buildWhereClause(userId, filters);

      // Get all usage data for user with filters
      const usageData = await this.prisma.tokenUsage.findMany({
        where: whereClause,
        select: {
          provider: true,
          modelId: true,
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
          cost: true,
          chatId: true,
          messageId: true,
          createdAt: true,
        },
      });

      if (usageData.length === 0) {
        return this.getEmptyStatistics();
      }

      // Calculate overall statistics
      const totalTokens = usageData.reduce(
        (sum, entry) => sum + entry.totalTokens,
        0
      );
      const totalCost = usageData.reduce((sum, entry) => sum + entry.cost, 0);
      const totalMessages = usageData.length;

      // Group by provider
      const providerStats = this.groupByProvider(usageData);

      // Group by model
      const modelStats = this.groupByModel(usageData);

      return {
        totalTokens,
        totalCost,
        totalMessages,
        averageTokensPerMessage: Math.round(totalTokens / totalMessages),
        averageCostPerMessage: totalCost / totalMessages,
        providerStats,
        modelStats,
      };
    } catch (error) {
      throw new DatabaseError("Failed to get token usage statistics", error);
    }
  }

  async getUsageOverTime(
    userId: string,
    filters: TokenUsageFilters = {}
  ): Promise<TokenUsageOverTime> {
    try {
      const whereClause = this.buildWhereClause(userId, filters);

      // Group by date
      const usageByDate = await this.prisma.tokenUsage.groupBy({
        by: ["createdAt"],
        where: whereClause,
        _sum: {
          totalTokens: true,
          cost: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Format the data for charts
      return usageByDate.map((entry) => ({
        date: entry.createdAt.toISOString().split("T")[0], // YYYY-MM-DD format
        tokens: entry._sum.totalTokens || 0,
        cost: entry._sum.cost || 0,
        messageCount: entry._count.id,
      }));
    } catch (error) {
      throw new DatabaseError("Failed to get usage over time", error);
    }
  }

  async getUsageByChat(
    userId: string,
    chatId: string
  ): Promise<{
    chatId: string;
    totalTokens: number;
    totalCost: number;
    messageCount: number;
    entries: TokenUsageEntry[];
  }> {
    try {
      const entries = await this.prisma.tokenUsage.findMany({
        where: {
          chatId,
          chat: { userId },
        },
        orderBy: { createdAt: "asc" },
      });

      if (entries.length === 0) {
        return {
          chatId,
          totalTokens: 0,
          totalCost: 0,
          messageCount: 0,
          entries: [],
        };
      }

      const totalTokens = entries.reduce(
        (sum, entry) => sum + entry.totalTokens,
        0
      );
      const totalCost = entries.reduce((sum, entry) => sum + entry.cost, 0);

      return {
        chatId,
        totalTokens,
        totalCost,
        messageCount: entries.length,
        entries: entries.map((entry) => ({
          ...entry,
          ...entry,
        })),
      };
    } catch (error) {
      throw new DatabaseError("Failed to get usage by chat", error);
    }
  }

  private buildWhereClause(
    userId: string,
    filters: TokenUsageFilters
  ): Prisma.TokenUsageWhereInput {
    const whereClause: Prisma.TokenUsageWhereInput = {
      chat: { userId },
    };

    if (filters.startDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: new Date(filters.endDate),
      };
    }

    if (filters.provider) {
      whereClause.provider = filters.provider;
    }

    if (filters.modelId) {
      whereClause.modelId = filters.modelId;
    }

    if (filters.chatId) {
      whereClause.chatId = filters.chatId;
    }

    return whereClause;
  }

  private getEmptyStatistics(): TokenUsageStatistics {
    return {
      totalTokens: 0,
      totalCost: 0,
      totalMessages: 0,
      averageTokensPerMessage: 0,
      averageCostPerMessage: 0,
      providerStats: [],
      modelStats: [],
    };
  }

  private groupByProvider(
    usageData: any[]
  ): TokenUsageStatistics["providerStats"] {
    const grouped = usageData.reduce(
      (acc, entry) => {
        const key = entry.provider;
        if (!acc[key]) {
          acc[key] = {
            provider: key,
            totalTokens: 0,
            totalCost: 0,
            messageCount: 0,
          };
        }
        acc[key].totalTokens += entry.totalTokens;
        acc[key].totalCost += entry.cost;
        acc[key].messageCount += 1;
        return acc;
      },
      {} as Record<string, TokenUsageStatistics["providerStats"][0]>
    );

    return Object.values(grouped);
  }

  private groupByModel(usageData: any[]): TokenUsageStatistics["modelStats"] {
    const grouped = usageData.reduce(
      (acc, entry) => {
        const key = entry.modelId;
        if (!acc[key]) {
          acc[key] = {
            modelId: entry.modelId,
            provider: entry.provider,
            totalTokens: 0,
            totalCost: 0,
            messageCount: 0,
          };
        }
        acc[key].totalTokens += entry.totalTokens;
        acc[key].totalCost += entry.cost;
        acc[key].messageCount += 1;
        return acc;
      },
      {} as Record<string, TokenUsageStatistics["modelStats"][0]>
    );

    return Object.values(grouped);
  }

  private async calculateCost(
    provider: AIProvider,
    modelId: string,
    inputTokens: number,
    outputTokens: number
  ): Promise<{ inputCost: number; outputCost: number; totalCost: number }> {
    // Get the provider costs from constants
    const { AI_PROVIDER_COSTS } = await import(
      "../../common/constants/costs.constants"
    );
    const providerCost = AI_PROVIDER_COSTS[provider];

    if (!providerCost) {
      return { inputCost: 0, outputCost: 0, totalCost: 0 };
    }

    const modelCost = providerCost.models[modelId];
    if (!modelCost) {
      return { inputCost: 0, outputCost: 0, totalCost: 0 };
    }

    const inputCost = (inputTokens / 1000) * modelCost.inputCostPer1K;
    const outputCost = (outputTokens / 1000) * modelCost.outputCostPer1K;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }
}
