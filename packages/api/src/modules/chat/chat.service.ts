import { TRPCError } from "@trpc/server";
import type { AttachmentKind } from "@prisma/client";
import type { ChatRepository } from "./chat.repository";
import type {
  AttachmentInput,
  CreateChatInput,
  EnhancePromptInput,
} from "./chat.inputs";
import type {
  CreateChatResult,
  EnhancePromptResult,
  ModelDescriptor,
} from "./chat.types";

const DEFAULT_TITLE_LENGTH = 50;
const MAX_ATTACHMENTS = 10;
const MAX_TOTAL_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB TODO move to config

type StorageAdapter = {
  resolveStorageKey: (uploadId: string, filename: string) => Promise<string>;
};

type PromptEnhancer = {
  enhance: (
    input: EnhancePromptInput & {
      context?: unknown;
    }
  ) => Promise<EnhancePromptResult>;
};

export class ChatService {
  private readonly repository: ChatRepository;
  private readonly storageAdapter: StorageAdapter;
  private readonly enhancer: PromptEnhancer;

  constructor(
    repository: ChatRepository,
    storageAdapter: StorageAdapter,
    enhancer: PromptEnhancer
  ) {
    this.repository = repository;
    this.storageAdapter = storageAdapter;
    this.enhancer = enhancer;
  }

  getAvailableModels(): ModelDescriptor[] {
    return this.repository.listModels();
  }

  private assertModelSupportsWebSearch(
    modelId: string,
    useWebSearch: boolean
  ) {
    if (!useWebSearch) {
      return;
    }
    const model = this.repository
      .listModels()
      .find((item) => item.id === modelId);
    if (!model || !model.supportsWebSearch) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Selected model does not support web search",
      });
    }
  }

  async createChat(
    userId: string,
    { initialMessage, modelId, useWebSearch, attachments }: CreateChatInput
  ): Promise<CreateChatResult> {
    const trimmedMessage = initialMessage?.trim() ?? "";
    if (!trimmedMessage && attachments.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Provide a message or at least one attachment",
      });
    }

    this.assertModelSupportsWebSearch(modelId, useWebSearch);

    if (attachments.length > MAX_ATTACHMENTS) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Too many attachments (max ${MAX_ATTACHMENTS})`,
      });
    }

    const totalSize = attachments.reduce((sum, item) => sum + item.size, 0);
    if (totalSize > MAX_TOTAL_ATTACHMENT_SIZE) {
      throw new TRPCError({
        code: "PAYLOAD_TOO_LARGE",
        message: "Attachments exceed maximum total size",
      });
    }

    const normalizedAttachments = await this.normalizeAttachments(attachments);

    try {
      const chat = await this.repository.createChatWithMessage({
        userId,
        title: this.resolveTitle(trimmedMessage),
        initialMessage: trimmedMessage,
        modelId,
        useWebSearch,
        attachments: normalizedAttachments,
      });

      const firstMessage = chat.messages[0];
      if (!firstMessage) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Initial message creation failed",
        });
      }

      const createdAttachments = await this.repository.listAttachmentsByChat(
        chat.id
      );

      return {
        chatId: chat.id,
        messageId: firstMessage.id,
        modelId,
        useWebSearch,
        attachments: createdAttachments,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create chat",
        cause: error,
      });
    }
  }

  async enhancePrompt(
    userId: string,
    input: EnhancePromptInput
  ): Promise<EnhancePromptResult> {
    this.assertModelSupportsWebSearch(input.modelId, input.useWebSearch);

    const contextMessages = input.contextChatId
      ? await this.repository.findChatById(input.contextChatId, userId)
      : null;

    try {
      return await this.enhancer.enhance({
        ...input,
        context: contextMessages ?? undefined,
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to enhance prompt",
        cause: error,
      });
    }
  }

  async listUserChats(
    userId: string,
    includeArchived: boolean,
    limit: number,
    cursor?: string
  ) {
    try {
      return await this.repository.findChatsByUser({
        userId,
        includeArchived,
        limit,
        cursor,
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch chats",
        cause: error,
      });
    }
  }

  getChatById(id: string, userId: string) {
    return this.repository.findChatById(id, userId);
  }

  private resolveTitle(initialMessage: string | undefined) {
    if (!initialMessage) {
      return "Untitled Chat";
    }
    const trimmed = initialMessage.trim();
    if (!trimmed) {
      return "Untitled Chat";
    }
    return trimmed.length > DEFAULT_TITLE_LENGTH
      ? `${trimmed.substring(0, DEFAULT_TITLE_LENGTH)}...`
      : trimmed;
  }

  private async normalizeAttachments(
    attachments: AttachmentInput[]
  ): Promise<
    {
      kind: AttachmentKind;
      filename: string;
      mimeType: string;
      size: number;
      storageKey: string;
      transcription?: string | null;
      metadata?: unknown;
    }[]
  > {
    return Promise.all(
      attachments.map(async (attachment) => {
        if (!attachment.uploadId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing upload reference for attachment",
          });
        }

        const storageKey = await this.storageAdapter.resolveStorageKey(
          attachment.uploadId,
          attachment.name
        );

        return {
          kind: attachment.kind,
          filename: attachment.name,
          mimeType: attachment.mimeType,
          size: attachment.size,
          storageKey,
          transcription: attachment.transcription ?? null,
        };
      })
    );
  }
}
