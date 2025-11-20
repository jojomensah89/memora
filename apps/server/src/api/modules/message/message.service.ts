import type { Prisma } from "@memora/db";
import { CHAT_LIMITS } from "../../common/constants";
import {
  ChatNotFoundError,
  NotFoundError,
  ValidationError,
} from "../../common/errors";
import {
  validateFileArray,
  validateFilename,
  validateFileSize,
  validateLength,
  validateMimeType,
} from "../../common/utils";
import { estimateTokens as countTokens } from "../../common/utils/token-counter.util";
import type {
  AttachmentInput,
  CreateMessageInput,
  GetMessagesByChatInput,
  UpdateMessageInput,
} from "./message.inputs";
import {
  createMessageWithAttachments,
  deleteMessage as deleteMessageRepo,
  getMessageById as getMessageByIdRepo,
  getMessageStatisticsForChat,
  getMessagesByChatId,
  updateMessage as updateMessageRepo,
  updateTokenCount,
  validateChatOwnership as validateChatOwnershipRepo,
} from "./message.repository";
import type {
  CreateMessageResult,
  MessageListItem,
  MessageListResult,
  MessageStatistics,
} from "./message.types";

export async function create(input: {
  chatId: string;
  userId: string;
  content: string;
  role: "user" | "assistant" | "system" | "tool";
}): Promise<{ id: string }> {
  // Simplified create method for streaming
  const message = await createMessageWithAttachments({
    content: input.content,
    role: input.role as any, // Cast to any to support 'tool' role if DB doesn't strictly enforce it yet or if types are outdated
    chatId: input.chatId,
    metadata: undefined,
    attachments: [],
  });

  return { id: message.id };
}

export async function createMessage(
  userId: string,
  input: CreateMessageInput
): Promise<CreateMessageResult> {
  const { content, role, chatId, attachments, metadata } =
    input;

  // Validate content length
  validateLength(content, "Message", 1, CHAT_LIMITS.MAX_MESSAGE_LENGTH);

  // Validate attachments if provided
  const normalizedAttachments = normalizeAttachments(attachments);

  // Check if chat exists and belongs to user
  await validateChatOwnership(chatId, userId);

  // Create the message
  const message = await createMessageWithAttachments({
    content,
    role,
    chatId,
    metadata: metadata as Prisma.InputJsonValue,
    attachments: normalizedAttachments,
  });

  // Count tokens for the message
  const tokenCount = countTokens(content);

  // Update token count in metadata if we have token information
  if (tokenCount > 0) {
    await updateTokenCount(message.id, tokenCount);
  }

  return {
    id: message.id,
    messageId: message.id,
    content: message.content,
    role: message.role as any,
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

export async function getMessagesByChat(
  userId: string,
  { chatId, limit, cursor }: GetMessagesByChatInput
): Promise<MessageListResult> {
  await validateChatOwnership(chatId, userId);

  return getMessagesByChatId(chatId, userId, limit, cursor);
}

export async function getMessageById(
  userId: string,
  messageId: string
): Promise<MessageListItem> {
  const message = await getMessageByIdRepo(messageId, userId);

  if (!message) {
    throw new NotFoundError("Message not found");
  }

  // Validate that the chat belongs to the user
  await validateChatOwnership(message.chatId, userId);

  return {
    ...message,
    chatId: message.chatId,
    chatTitle: message.chatId, // We'll fetch title in repository if needed
  };
}

export async function updateMessage(
  userId: string,
  messageId: string,
  input: UpdateMessageInput
): Promise<void> {
  // Validate message exists and belongs to user
  const existingMessage = await getMessageByIdRepo(
    messageId,
    userId
  );
  if (!existingMessage) {
    throw new NotFoundError("Message not found");
  }

  await validateChatOwnership(existingMessage.chatId, userId);

  // Validate content if provided
  if (input.content) {
    validateLength(
      input.content,
      "Message",
      1,
      CHAT_LIMITS.MAX_MESSAGE_LENGTH
    );
  }

  await updateMessageRepo(messageId, userId, {
    ...input,
    metadata: input.metadata as Prisma.InputJsonValue,
  });
}

export async function deleteMessage(userId: string, messageId: string): Promise<void> {
  // Validate message exists and belongs to user
  const existingMessage = await getMessageByIdRepo(
    messageId,
    userId
  );
  if (!existingMessage) {
    throw new NotFoundError("Message not found");
  }

  await validateChatOwnership(existingMessage.chatId, userId);

  await deleteMessageRepo(messageId, userId);
}

export async function getMessageStatistics(
  userId: string,
  chatId: string
): Promise<MessageStatistics> {
  await validateChatOwnership(chatId, userId);

  const stats = await getMessageStatisticsForChat(
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

async function validateChatOwnership(
  chatId: string,
  userId: string
): Promise<void> {
  const hasOwnership = await validateChatOwnershipRepo(
    chatId,
    userId
  );

  if (!hasOwnership) {
    throw new ChatNotFoundError("Chat not found or access denied");
  }
}

function normalizeAttachments(attachments: AttachmentInput[]) {
  if (!attachments || attachments.length === 0) {
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
