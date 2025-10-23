import type { Prisma } from "@prisma/client";
import { BaseService } from "../../common/base";
import { CHAT_LIMITS } from "../../common/constants";
import {
  ChatNotFoundError,
  MessageNotFoundError,
  ValidationError,
} from "../../common/errors";
import {
  validateFileArray,
  validateFilename,
  validateFileSize,
  validateMimeType,
} from "../../common/utils";
import { countTokens } from "../../common/utils/token-counter.util";
import type {
  AttachmentInput,
  CreateMessageInput,
  GetMessagesByChatInput,
  UpdateMessageInput,
} from "./message.inputs";
import type { MessageRepository } from "./message.repository";
import type {
  CreateMessageResult,
  MessageListItem,
  MessageListResult,
  MessageStatistics,
} from "./message.types";

export class MessageService extends BaseService {
  constructor(private repository: MessageRepository) {
    super();
  }

  async createMessage(
    userId: string,
    input: CreateMessageInput
  ): Promise<CreateMessageResult> {
    const { content, role, chatId, parentMessageId, attachments, metadata } =
      input;

    // Validate content length
    this.validateLength(content, "Message", 1, CHAT_LIMITS.MAX_MESSAGE_LENGTH);

    // Validate attachments if provided
    const normalizedAttachments = this.normalizeAttachments(attachments);

    // Check if chat exists and belongs to user
    await this.validateChatOwnership(chatId, userId);

    // Create the message
    const message = await this.repository.createMessageWithAttachments({
      content,
      role,
      chatId,
      parentMessageId,
      metadata,
      attachments: normalizedAttachments,
    });

    // Count tokens for the message
    const tokenCount = countTokens(content);

    // Update token count in metadata if we have token information
    if (tokenCount > 0) {
      await this.repository.updateTokenCount(message.id, tokenCount);
    }

    return {
      id: message.id,
      messageId: message.id,
      content: message.content,
      role: message.role,
      createdAt: message.createdAt,
      tokenCount: tokenCount > 0 ? tokenCount : undefined,
      attachments: message.attachments.map((att) => ({
        id: att.id,
        kind: att.kind,
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.size,
        storageKey: att.storageKey,
      })),
    };
  }

  async getMessagesByChat(
    userId: string,
    { chatId, limit, cursor }: GetMessagesByChatInput
  ): Promise<MessageListResult> {
    await this.validateChatOwnership(chatId, userId);

    return this.repository.getMessagesByChatId(chatId, userId, limit, cursor);
  }

  async getMessageById(
    userId: string,
    messageId: string
  ): Promise<MessageListItem> {
    const message = await this.repository.getMessageById(messageId, userId);

    if (!message) {
      throw new MessageNotFoundError("Message not found");
    }

    // Validate that the chat belongs to the user
    await this.validateChatOwnership(message.chatId, userId);

    return {
      ...message,
      chatId: message.chatId,
      chatTitle: message.chatId, // We'll fetch title in repository if needed
    };
  }

  async updateMessage(
    userId: string,
    messageId: string,
    input: UpdateMessageInput
  ): Promise<void> {
    // Validate message exists and belongs to user
    const existingMessage = await this.repository.getMessageById(
      messageId,
      userId
    );
    if (!existingMessage) {
      throw new MessageNotFoundError("Message not found");
    }

    await this.validateChatOwnership(existingMessage.chatId, userId);

    // Validate content if provided
    if (input.content) {
      this.validateLength(
        input.content,
        "Message",
        1,
        CHAT_LIMITS.MAX_MESSAGE_LENGTH
      );
    }

    await this.repository.updateMessage(messageId, userId, input);
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    // Validate message exists and belongs to user
    const existingMessage = await this.repository.getMessageById(
      messageId,
      userId
    );
    if (!existingMessage) {
      throw new MessageNotFoundError("Message not found");
    }

    await this.validateChatOwnership(existingMessage.chatId, userId);

    await this.repository.deleteMessage(messageId, userId);
  }

  async getMessageStatistics(
    userId: string,
    chatId: string
  ): Promise<MessageStatistics> {
    await this.validateChatOwnership(chatId, userId);

    const stats = await this.repository.getMessageStatisticsForChat(
      chatId,
      userId
    );
    const averageTokensPerMessage =
      stats.totalMessages > 0
        ? Math.round(stats.totalTokens / stats.totalMessages)
        : 0;

    return {
      ...stats,
      averageTokensPerMessage,
    };
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
      throw new ValidationError("Failed to validate chat ownership");
    }
  }

  private normalizeAttachments(attachments: AttachmentInput[]) {
    if (attachments.length === 0) {
      return [];
    }

    // Validate total file size
    validateFileArray(attachments.map(({ size }) => ({ size })));

    return attachments.map((attachment) => {
      const storageKey =
        attachment.storageKey ??
        (attachment.uploadId
          ? `${attachment.uploadId}/${attachment.name}`
          : undefined);

      if (!storageKey) {
        throw new ValidationError("Missing storage reference for attachment");
      }

      // Validate individual attachment
      validateFilename(attachment.name);
      validateFileSize(attachment.size);
      validateMimeType(attachment.mimeType);

      return {
        kind: attachment.kind,
        filename: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        storageKey,
        transcription: attachment.transcription ?? null,
        metadata: attachment.metadata as Prisma.InputJsonObject | undefined,
      };
    });
  }
}
