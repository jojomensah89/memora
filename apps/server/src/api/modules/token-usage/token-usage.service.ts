import { BaseService } from "../../common/base";
import { ChatNotFoundError } from "../../common/errors";
import type {
  CreateTokenUsageInput,
  GetTokenUsageByChatInput,
  GetTokenUsageOverTimeInput,
  GetTokenUsageStatsInput,
} from "./token-usage.inputs";
import type { TokenUsageRepository } from "./token-usage.repository";

export class TokenUsageService extends BaseService {
  private readonly repository: TokenUsageRepository;

  constructor(repository: TokenUsageRepository) {
    super();
    this.repository = repository;
  }

  async create(input: {
    userId: string;
    provider: string;
    modelId: string;
    inputTokens: number;
    outputTokens: number;
    chatId: string;
  }): Promise<void> {
    // Simplified create method for streaming (no validation for performance)
    await this.repository.createTokenUsage({
      provider: input.provider as never,
      modelId: input.modelId,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      chatId: input.chatId,
      messageId: undefined,
    });
  }

  async trackTokenUsage(userId: string, input: CreateTokenUsageInput) {
    const { provider, modelId, inputTokens, outputTokens, chatId, messageId } =
      input;

    // Validate chat ownership
    await this.validateChatOwnership(chatId, userId);

    return await this.repository.createTokenUsage({
      provider,
      modelId,
      inputTokens,
      outputTokens,
      chatId,
      messageId,
    });
  }

  async getUsageStatistics(userId: string, filters: GetTokenUsageStatsInput) {
    return await this.repository.getUsageByUser(userId, filters);
  }

  async getUsageOverTime(userId: string, filters: GetTokenUsageOverTimeInput) {
    return await this.repository.getUsageOverTime(userId, filters);
  }

  async getUsageByChat(userId: string, input: GetTokenUsageByChatInput) {
    const { chatId } = input;

    // Validate chat ownership
    await this.validateChatOwnership(chatId, userId);

    return await this.repository.getUsageByChat(userId, chatId);
  }

  private async validateChatOwnership(
    chatId: string,
    userId: string
  ): Promise<void> {
    try {
      const chat = await this.prisma.chat.findFirst({
        where: { id: chatId, userId },
      });

      if (!chat) {
        throw new ChatNotFoundError("Chat not found or access denied");
      }
    } catch (error) {
      if (error instanceof ChatNotFoundError) {
        throw error;
      }
      throw new ChatNotFoundError("Failed to validate chat ownership");
    }
  }
}
