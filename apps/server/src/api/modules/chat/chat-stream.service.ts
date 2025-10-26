import type { AIProvider } from "@prisma/client";
import { BaseService } from "../../common/base";
import { AIProviderError, ValidationError } from "../../common/errors";
import { estimateTokens } from "../../common/utils/token-counter.util";
import type { ContextItem } from "../context-engine/context-item.types";
import type { Rule } from "../rules/rule.types";

export type StreamingChatInput = {
  chatId: string;
  userId: string;
  message: string;
  provider: AIProvider;
  modelId: string;
  useWebSearch?: boolean;
  context?: ContextItem[];
  rules?: Rule[];
  attachments?: Array<{
    type: string;
    data: string;
    name?: string;
    mimeType?: string;
  }>;
};

export type StreamingChatResult = {
  messageId: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
};

export class ChatStreamService extends BaseService {
  async generateResponse(
    input: StreamingChatInput
  ): Promise<StreamingChatResult> {
    const {
      chatId,
      userId,
      message,
      provider,
      modelId,
      context,
      rules,
      attachments,
    } = input;

    try {
      // Get the appropriate AI agent

      // Build system prompt with rules
      const systemPrompt = this.buildSystemPrompt(rules || []);

      // Prepare context for injection
      const contextText = this.prepareContext(context || []);

      // Prepare tools

      // Count tokens
      const inputTokens = estimateTokens(message + systemPrompt + contextText);
      const outputTokens = estimateTokens(result.text);
      const totalTokens = inputTokens + outputTokens;

      // Calculate cost
      const cost = this.calculateCost(
        provider,
        modelId,
        inputTokens,
        outputTokens
      );

      // Create the assistant message
      const newMessageId = await this.createAssistantMessage(
        chatId,
        userId,
        result.text,
        inputTokens,
        outputTokens
      );

      // Track token usage
      await this.trackTokenUsage(userId, {
        provider,
        modelId,
        inputTokens,
        outputTokens,
        chatId,
        messageId: newMessageId,
      });

      return {
        messageId: newMessageId,
        content: result.text,
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
      };
    } catch (error) {
      throw new AIProviderError(`Failed to generate AI response: ${error}`);
    }
  }

  private buildSystemPrompt(rules: Rule[]): string {
    if (rules.length === 0) {
      return "You are a helpful AI assistant.";
    }

    const activeRules = rules.filter((rule) => rule.isActive);

    if (activeRules.length === 0) {
      return "You are a helpful AI assistant.";
    }

    const ruleTexts = activeRules
      .map((rule) => `--- ${rule.name.toUpperCase()} ---\n${rule.content}`)
      .join("\n\n");

    return `You are a helpful AI assistant. Please follow these rules carefully:\n\n${ruleTexts}\n\nIf any rules conflict, prioritize your judgment while being helpful and safe.`;
  }

  private prepareContext(context: ContextItem[]): string {
    if (context.length === 0) {
      return "";
    }

    return context
      .filter((item) => item.isActive)
      .map((item) => {
        if (item.type === "text") {
          return `Context: ${item.name}\n${item.content}`;
        }
        if (item.type === "file") {
          return `File Context: ${item.name}\n${item.content}`;
        }
        return "";
      })
      .filter((text) => text.length > 0)
      .join("\n\n");
  }

  private async createAssistantMessage(
    chatId: string,
    _userId: string,
    content: string,
    inputTokens: number,
    outputTokens: number
  ): Promise<string> {
    try {
      const message = await this.prisma.message.create({
        data: {
          content,
          role: "assistant",
          chatId,
          metadata: {
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
          },
        },
      });

      return message.id;
    } catch (_error) {
      throw new ValidationError("Failed to create assistant message");
    }
  }

  private async trackTokenUsage(
    _userId: string,
    usageData: {
      provider: AIProvider;
      modelId: string;
      inputTokens: number;
      outputTokens: number;
      chatId: string;
      messageId: string;
    }
  ): Promise<void> {
    try {
      await this.prisma.tokenUsage.create({
        data: {
          provider: usageData.provider,
          modelId: usageData.modelId,
          inputTokens: usageData.inputTokens,
          outputTokens: usageData.outputTokens,
          totalTokens: usageData.inputTokens + usageData.outputTokens,
          chatId: usageData.chatId,
          messageId: usageData.messageId,
          cost: this.calculateCost(
            usageData.provider,
            usageData.modelId,
            usageData.inputTokens,
            usageData.outputTokens
          ),
        },
      });
    } catch (_error) {
      // Don't fail the whole operation if token tracking fails
      // TODO: Add proper logging
    }
  }

  private calculateCost(
    _provider: AIProvider,
    _modelId: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    // This would use the cost calculation utility
    // For now, return a simple calculation
    const inputCostPer1K = 0.001; // $0.001 per 1K input tokens
    const outputCostPer1K = 0.002; // $0.002 per 1K output tokens

    return (
      (inputTokens / 1000) * inputCostPer1K +
      (outputTokens / 1000) * outputCostPer1K
    );
  }
}
