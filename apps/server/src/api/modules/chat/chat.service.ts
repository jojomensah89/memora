import type { Prisma } from "@prisma/client";
import { BaseService } from "../../common/base";
import {
  CHAT_LIMITS,
  FILE_LIMITS,
  PAGINATION_LIMITS,
} from "../../common/constants";
import { getModelConfig } from "../../common/constants/models.constants";
import {
  ChatNotFoundError,
  InvalidModelError,
  PayloadTooLargeError,
  ValidationError,
} from "../../common/errors";
import {
  validateFileArray,
  validateFilename,
  validateFileSize,
  validateMimeType,
} from "../../common/utils";
import type { ContextItem } from "../context-engine/context-item.types";
import type { Rule } from "../rules/rule.types";
import type {
  AttachmentInput,
  CreateChatInput,
  EnhancePromptInput,
  ForkChatInput,
  ListChatsInput,
} from "./chat.inputs";
import type {
  ChatRepository,
  CreateChatAttachmentData,
} from "./chat.repository";
import type {
  CreateChatResult,
  EnhancePromptResult,
  ModelDescriptor,
} from "./chat.types";
import { ChatStreamService } from "./chat-stream.service";

type PromptEnhancerResult = Pick<
  EnhancePromptResult,
  "enhancedText" | "useWebSearchApplied" | "suggestions"
>;

type PromptEnhancer = {
  enhance: (
    input: EnhancePromptInput & {
      context?: unknown;
    }
  ) => Promise<PromptEnhancerResult>;
};

export class ChatService extends BaseService {
  constructor(
    private readonly repository: ChatRepository,
    private readonly enhancer?: PromptEnhancer,
    private readonly contextService?: any,
    private readonly rulesService?: any
  ) {
    super();
  }

  getAvailableModels(): ModelDescriptor[] {
    return this.repository.listModels();
  }

  async createChat(
    userId: string,
    input: CreateChatInput
  ): Promise<CreateChatResult> {
    const message = input.initialMessage?.trim() ?? "";
    const attachments = input.attachments ?? [];

    if (!message && attachments.length === 0) {
      throw new ValidationError("Provide a message or at least one attachment");
    }

    if (message) {
      this.validateLength(
        message,
        "Initial message",
        1,
        CHAT_LIMITS.MAX_MESSAGE_LENGTH
      );
    }

    if (attachments.length > 0) {
      validateFileArray(attachments.map(({ size }) => ({ size })));
      attachments.forEach((attachment) => {
        validateFilename(attachment.name);
        validateFileSize(attachment.size);
        validateMimeType(attachment.mimeType);
      });
    }

    const modelConfig = getModelConfig(input.modelId);
    if (!modelConfig) {
      throw new InvalidModelError("Invalid model selected");
    }

    const modelDescriptor = this.getAvailableModels().find(
      (item) => item.id === modelConfig.id
    );

    if (
      input.useWebSearch &&
      modelDescriptor &&
      !modelDescriptor.supportsWebSearch
    ) {
      throw new ValidationError("Selected model does not support web search");
    }

    const totalSize = attachments.reduce((sum, item) => sum + item.size, 0);
    if (totalSize > FILE_LIMITS.MAX_TOTAL_ATTACHMENT_SIZE) {
      throw new PayloadTooLargeError("Attachments exceed maximum total size");
    }

    const normalizedAttachments = this.normalizeAttachments(attachments);

    const chat = await this.repository.createChatWithMessage({
      userId,
      title: this.resolveTitle(message),
      initialMessage: message,
      provider: modelConfig.provider,
      modelId: modelConfig.id,
      useWebSearch: input.useWebSearch,
      parentId: input.parentId,
      forkedFromMessageId: input.forkedFromMessageId,
      attachments: normalizedAttachments,
      metadata: {
        modelId: modelConfig.id,
        provider: modelConfig.provider,
        useWebSearch: input.useWebSearch,
        contextWindow: modelConfig.contextWindow,
        parentId: input.parentId,
        forkedFromMessageId: input.forkedFromMessageId,
      } as Prisma.InputJsonValue,
    });

    const firstMessage = chat.messages[0];
    if (!firstMessage) {
      throw new ValidationError("Initial message creation failed");
    }

    const createdAttachments = await this.repository.listAttachmentsByChat(
      chat.id
    );

    return {
      id: chat.id,
      chatId: chat.id,
      messageId: firstMessage.id,
      provider: modelConfig.provider,
      modelId: modelConfig.id,
      useWebSearch: input.useWebSearch,
      attachments: createdAttachments,
    };
  }

  async listUserChats(userId: string, input: ListChatsInput) {
    const includeArchived = input.includeArchived ?? false;
    const limit = input.limit ?? PAGINATION_LIMITS.DEFAULT_LIMIT;

    return this.repository.findChatsByUser({
      userId,
      includeArchived,
      limit,
      cursor: input.cursor,
    });
  }

  async getChatById(id: string, userId: string) {
    const chat = await this.repository.findChatById(id, userId);

    if (!chat) {
      throw new ChatNotFoundError("Chat not found");
    }

    return chat;
  }

  async enhancePrompt(
    userId: string,
    input: EnhancePromptInput
  ): Promise<EnhancePromptResult> {
    const modelConfig = getModelConfig(input.modelId);
    if (!modelConfig) {
      throw new InvalidModelError("Invalid model selected");
    }

    const modelDescriptor = this.getAvailableModels().find(
      (item) => item.id === modelConfig.id
    );

    if (
      input.useWebSearch &&
      modelDescriptor &&
      !modelDescriptor.supportsWebSearch
    ) {
      throw new ValidationError("Selected model does not support web search");
    }

    let context: unknown;
    if (input.contextChatId) {
      const chat = await this.repository.findChatById(
        input.contextChatId,
        userId
      );
      if (!chat) {
        throw new ChatNotFoundError("Context chat not found");
      }
      context = chat.messages;
    }

    if (!this.enhancer) {
      return {
        enhancedText: input.text,
        modelId: modelConfig.id,
        provider: modelConfig.provider,
        useWebSearchApplied:
          Boolean(input.useWebSearch) &&
          Boolean(modelDescriptor?.supportsWebSearch),
      };
    }

    const enhanced = await this.enhancer.enhance({
      ...input,
      context,
    });

    return {
      enhancedText: enhanced.enhancedText,
      modelId: modelConfig.id,
      provider: modelConfig.provider,
      useWebSearchApplied: enhanced.useWebSearchApplied,
      suggestions: enhanced.suggestions,
    };
  }

  async forkChat(userId: string, input: ForkChatInput) {
    const { originalChatId, title, forkedFromMessageId } = input;

    // Verify original chat ownership
    const originalChat = await this.repository.findChatById(
      originalChatId,
      userId
    );
    if (!originalChat) {
      throw new ChatNotFoundError("Original chat not found");
    }

    return await this.repository.forkChat(
      originalChatId,
      userId,
      title || `Fork of ${originalChat.title}`,
      forkedFromMessageId
    );
  }

  async generateAIResponse(
    userId: string,
    chatId: string,
    message: string
  ): Promise<any> {
    // Get chat details
    const chat = await this.repository.findChatById(chatId, userId);
    if (!chat) {
      throw new ChatNotFoundError("Chat not found");
    }

    // Get context and rules for the chat
    const context = await this.getContextForChat(chatId);
    const rules = await this.getRulesForChat(chatId);

    const streamService = new ChatStreamService();

    return await streamService.generateResponse({
      chatId,
      userId,
      message,
      provider: chat.provider,
      modelId: chat.model,
      context,
      rules,
    });
  }

  private async getContextForChat(_chatId: string): Promise<ContextItem[]> {
    if (!this.contextService) {
      return [];
    }

    try {
      // This would call the contextEngine service to get relevant context
      // Integration would depend on the actual contextEngine service interface
      return []; // Placeholder
    } catch (_error) {
      // TODO: Add proper logging instead of console
      return [];
    }
  }

  private async getRulesForChat(_chatId: string): Promise<Rule[]> {
    if (!this.rulesService) {
      return [];
    }

    try {
      // This would call the rules service to get relevant rules
      // Integration would depend on the actual rules service interface
      return []; // Placeholder
    } catch (_error) {
      // TODO: Add proper logging instead of console
      return [];
    }
  }

  private resolveTitle(initialMessage: string) {
    if (!initialMessage) {
      return "Untitled Chat";
    }
    const trimmed = initialMessage.trim();
    if (!trimmed) {
      return "Untitled Chat";
    }
    if (trimmed.length > CHAT_LIMITS.MAX_TITLE_LENGTH) {
      return `${trimmed.substring(0, CHAT_LIMITS.MAX_TITLE_LENGTH)}...`;
    }
    return trimmed;
  }

  private normalizeAttachments(
    attachments: AttachmentInput[]
  ): CreateChatAttachmentData[] {
    if (attachments.length === 0) {
      return [];
    }

    return attachments.map((attachment) => {
      const storageKey =
        attachment.storageKey ??
        (attachment.uploadId
          ? `${attachment.uploadId}/${attachment.name}`
          : undefined);

      if (!storageKey) {
        throw new ValidationError("Missing storage reference for attachment");
      }

      return {
        kind: attachment.kind,
        filename: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        storageKey,
        transcription: attachment.transcription ?? null,
        metadata: attachment.metadata as Prisma.InputJsonValue | undefined,
      } satisfies CreateChatAttachmentData;
    });
  }

  async updateChat(
    userId: string,
    input: { id: string; title?: string; modelId?: string }
  ) {
    this.validateRequired(input.id, "Chat ID");

    // Verify ownership
    const chat = await this.getChatById(input.id, userId);
    if (!chat) {
      throw new ChatNotFoundError("Chat not found");
    }

    return this.repository.updateChat(input.id, {
      title: input.title,
      model: input.modelId,
    });
  }
}
