import type { Prisma } from "@memora/db";
import type { UIMessage } from "ai";
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
  validateLength,
  validateMimeType,
  validateRequired,
} from "../../common/utils";
import type {
  AttachmentInput,
  CreateChatInput,
  EnhancePromptInput,
  ForkChatInput,
  ListChatsInput,
} from "./chat.inputs";
import * as ChatRepository from "./chat.repository";
import type {
  CreateChatAttachmentData,
} from "./chat.repository";
import type {
  CreateChatResult,
  EnhancePromptResult,
  ModelDescriptor,
} from "./chat.types";

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

// Optional dependencies to be injected or imported directly if converted to functions
// For now, we'll assume they might be passed or we'll keep the logic simple
let enhancer: PromptEnhancer | undefined;

export function setEnhancer(newEnhancer: PromptEnhancer) {
  enhancer = newEnhancer;
}

export function getAvailableModels(): ModelDescriptor[] {
  return ChatRepository.listModels();
}

export async function createChat(
  userId: string,
  input: CreateChatInput & { chatId?: string }
): Promise<CreateChatResult> {
  const message = input.initialMessage?.trim() ?? "";
  const attachments = input.attachments ?? [];

  if (!message && attachments.length === 0) {
    throw new ValidationError("Provide a message or at least one attachment");
  }

  if (message) {
    validateLength(
      message,
      "Initial message",
      1,
      CHAT_LIMITS.MAX_MESSAGE_LENGTH
    );
  }

  if (attachments.length > 0) {
    validateFileArray(attachments.map(({ size }) => ({ size })));
    for (const attachment of attachments) {
      validateFilename(attachment.name);
      validateFileSize(attachment.size);
      validateMimeType(attachment.mimeType);
    }
  }

  const modelConfig = getModelConfig(input.modelId);
  if (!modelConfig) {
    throw new InvalidModelError("Invalid model selected");
  }

  const modelDescriptor = getAvailableModels().find(
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

  const normalizedAttachments = normalizeAttachments(attachments);

  const chat = await ChatRepository.createChatWithMessage({
    userId,
    title: resolveTitle(message),
    initialMessage: message,
    provider: modelConfig.provider as any,
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
    chatId: input.chatId, // Pass the pre-generated chatId if provided
  });

  const firstMessage = chat.messages[0];
  if (!firstMessage) {
    throw new ValidationError("Initial message creation failed");
  }

  const createdAttachments = await ChatRepository.listAttachmentsByChat(
    chat.id
  );

  return {
    id: chat.id,
    chatId: chat.id,
    messageId: firstMessage.id,
    provider: modelConfig.provider as any,
    modelId: modelConfig.id,
    useWebSearch: input.useWebSearch,
    attachments: createdAttachments,
  };
}

export async function listUserChats(userId: string, input: ListChatsInput) {
  const includeArchived = input.includeArchived ?? false;
  const limit = input.limit ?? PAGINATION_LIMITS.DEFAULT_LIMIT;

  return ChatRepository.findChatsByUser({
    userId,
    includeArchived,
    limit,
    cursor: input.cursor,
  });
}

export async function getChatById(id: string, userId: string) {
  const chat = await ChatRepository.findChatById(id, userId);

  if (!chat) {
    throw new ChatNotFoundError("Chat not found");
  }

  return chat;
}

export async function enhancePrompt(
  userId: string,
  input: EnhancePromptInput
): Promise<EnhancePromptResult> {
  const modelConfig = getModelConfig(input.modelId);
  if (!modelConfig) {
    throw new InvalidModelError("Invalid model selected");
  }

  const modelDescriptor = getAvailableModels().find(
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
    const chat = await ChatRepository.findChatById(
      input.contextChatId,
      userId
    );
    if (!chat) {
      throw new ChatNotFoundError("Context chat not found");
    }
    context = chat.messages;
  }

  if (!enhancer) {
    return {
      enhancedText: input.text,
      modelId: modelConfig.id,
      provider: modelConfig.provider as any,
      useWebSearchApplied:
        Boolean(input.useWebSearch) &&
        Boolean(modelDescriptor?.supportsWebSearch),
    };
  }

  const enhanced = await enhancer.enhance({
    ...input,
    context,
  });

  return {
    enhancedText: enhanced.enhancedText,
    modelId: modelConfig.id,
    provider: modelConfig.provider as any,
    useWebSearchApplied: enhanced.useWebSearchApplied,
    suggestions: enhanced.suggestions,
  };
}

export async function forkChat(userId: string, input: ForkChatInput) {
  const { originalChatId, title, forkedFromMessageId } = input;

  // Verify original chat ownership
  const originalChat = await ChatRepository.findChatById(
    originalChatId,
    userId
  );
  if (!originalChat) {
    throw new ChatNotFoundError("Original chat not found");
  }

  return await ChatRepository.forkChat(
    originalChatId,
    userId,
    title || `Fork of ${originalChat.title}`,
    forkedFromMessageId
  );
}

function resolveTitle(initialMessage: string) {
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

function normalizeAttachments(
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

export async function updateChat(
  userId: string,
  input: { id: string; title?: string; modelId?: string }
) {
  validateRequired(input.id, "Chat ID");

  // Verify ownership
  const chat = await getChatById(input.id, userId);
  if (!chat) {
    throw new ChatNotFoundError("Chat not found");
  }

  return ChatRepository.updateChat(input.id, {
    title: input.title,
    model: input.modelId,
  });
}

export async function saveChatMessages(
  userId: string,
  chatId: string,
  messages: UIMessage[]
) {
  // Verify chat exists and user has permission
  const chat = await getChatById(chatId, userId);
  if (!chat) {
    throw new ChatNotFoundError("Chat not found");
  }

  // Save messages using repository
  return await ChatRepository.saveMessages(chatId, messages);
}

export async function deleteChat(userId: string, chatId: string): Promise<void> {
  // Verify ownership before deletion
  const chat = await ChatRepository.findChatById(chatId, userId);
  if (!chat) {
    throw new ChatNotFoundError("Chat not found");
  }

  return await ChatRepository.deleteChat(chatId, userId);
}
