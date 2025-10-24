import type { AIProvider, AttachmentKind, Chat, Prisma } from "@prisma/client";
import { BaseRepository } from "../../common/base";
import { AVAILABLE_MODELS } from "../../common/constants";
import { DatabaseError } from "../../common/errors";
import type {
  AttachmentMetadata,
  ChatListItem,
  ChatListResult,
  ChatWithMessages,
  ModelDescriptor,
} from "./chat.types";

export type CreateChatAttachmentData = {
  kind: AttachmentKind;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  transcription?: string | null;
  metadata?: Prisma.InputJsonValue;
};

type CreateChatWithMessageParams = {
  userId: string;
  title: string;
  initialMessage: string;
  provider: AIProvider;
  modelId: string;
  useWebSearch: boolean;
  parentId?: string;
  forkedFromMessageId?: string;
  attachments: CreateChatAttachmentData[];
  metadata?: Prisma.InputJsonValue;
};

type FindChatsParams = {
  userId: string;
  includeArchived: boolean;
  limit: number;
  cursor?: string;
};

export class ChatRepository extends BaseRepository<ChatWithMessages> {
  async createChatWithMessage({
    userId,
    title,
    initialMessage,
    provider,
    modelId,
    useWebSearch,
    parentId,
    forkedFromMessageId,
    attachments,
    metadata,
  }: CreateChatWithMessageParams): Promise<ChatWithMessages> {
    try {
      return await this.prisma.chat.create({
        data: {
          userId,
          title,
          provider,
          model: modelId,
          parentId,
          forkedFromMessageId,
          metadata:
            metadata ??
            ({
              modelId,
              provider,
              useWebSearch,
              parentId,
              forkedFromMessageId,
            } as Prisma.InputJsonValue),
          messages: {
            create: {
              content: initialMessage,
              role: "user",
              metadata: {
                modelId,
                provider,
                useWebSearch,
                parentId,
                forkedFromMessageId,
              } as Prisma.InputJsonValue,
              parentMessageId: forkedFromMessageId,
              attachments: attachments.length
                ? {
                    create: attachments.map((attachment) => ({
                      kind: attachment.kind,
                      filename: attachment.filename,
                      mimeType: attachment.mimeType,
                      size: attachment.size,
                      storageKey: attachment.storageKey,
                      transcription: attachment.transcription,
                      metadata: attachment.metadata,
                    })),
                  }
                : undefined,
            },
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              attachments: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to create chat", error);
    }
  }

  async findChatsByUser({
    userId,
    includeArchived,
    limit,
    cursor,
  }: FindChatsParams): Promise<ChatListResult> {
    try {
      const chats = await this.prisma.chat.findMany({
        where: {
          userId,
          isArchived: includeArchived ? undefined : false,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: {
              attachments: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (chats.length > limit) {
        const nextItem = chats.pop();
        nextCursor = nextItem?.id;
      }

      const items: ChatListItem[] = chats.map((chat) => {
        const { messages, _count, ...chatData } = chat;
        return {
          ...(chatData as Chat),
          lastMessage: messages[0] ?? null,
          messageCount: _count.messages,
        };
      });

      return { chats: items, nextCursor };
    } catch (error) {
      throw new DatabaseError("Failed to fetch chats", error);
    }
  }

  async findChatById(
    id: string,
    userId: string
  ): Promise<ChatWithMessages | null> {
    try {
      return await this.prisma.chat.findFirst({
        where: { id, userId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              attachments: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to fetch chat", error);
    }
  }

  async forkChat(
    originalChatId: string,
    userId: string,
    title: string,
    forkedFromMessageId: string
  ): Promise<ChatWithMessages> {
    try {
      // Get the original chat and verify ownership
      const originalChat = await this.findChatById(originalChatId, userId);
      if (!originalChat) {
        throw new Error("Original chat not found");
      }

      // Get the message to fork from
      const forkFromMessage = originalChat.messages.find(
        (msg) => msg.id === forkedFromMessageId
      );
      if (!forkFromMessage) {
        throw new Error("Fork message not found");
      }

      // Create new chat with forked messages up to the fork point
      const forkedMessages = originalChat.messages.filter(
        (msg) => msg.createdAt <= forkFromMessage.createdAt
      );

      const newChat = await this.prisma.chat.create({
        data: {
          userId,
          title: title || `Fork of ${originalChat.title}`,
          provider: originalChat.provider,
          model: originalChat.model,
          parentId: originalChatId,
          forkedFromMessageId,
          metadata: {
            modelId: originalChat.model,
            provider: originalChat.provider,
            parentId: originalChatId,
            forkedFromMessageId,
          } as Prisma.InputJsonValue,
          messages: {
            create: forkedMessages.map((msg) => ({
              content: msg.content,
              role: msg.role,
              metadata: msg.metadata,
              parentMessageId: msg.parentMessageId,
              attachments: msg.attachments.length
                ? {
                    create: msg.attachments.map((att) => ({
                      kind: att.kind,
                      filename: att.filename,
                      mimeType: att.mimeType,
                      size: att.size,
                      storageKey: att.storageKey,
                      transcription: att.transcription,
                      metadata: att.metadata,
                    })),
                  }
                : undefined,
            })),
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              attachments: true,
            },
          },
        },
      });

      return newChat;
    } catch (error) {
      throw new DatabaseError("Failed to fork chat", error);
    }
  }

  listModels(): ModelDescriptor[] {
    return AVAILABLE_MODELS.map((model) => ({
      ...model,
      supportsWebSearch: model.provider !== "CLAUDE",
    }));
  }

  async listAttachmentsByChat(chatId: string): Promise<AttachmentMetadata[]> {
    try {
      const attachments = await this.prisma.attachment.findMany({
        where: { message: { chatId } },
        orderBy: { createdAt: "asc" },
      });

      return attachments.map((attachment) => ({
        id: attachment.id,
        kind: attachment.kind,
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        size: attachment.size,
        storageKey: attachment.storageKey,
        transcription: attachment.transcription,
        metadata:
          attachment.metadata &&
          typeof attachment.metadata === "object" &&
          !Array.isArray(attachment.metadata)
            ? (attachment.metadata as Record<string, unknown>)
            : undefined,
      }));
    } catch (error) {
      throw new DatabaseError("Failed to fetch attachments", error);
    }
  }

  async updateLastActivity(chatId: string): Promise<void> {
    try {
      await this.prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });
    } catch (error) {
      throw new DatabaseError("Failed to update chat activity", error);
    }
  }

  async updateChat(
    chatId: string,
    data: { title?: string; model?: string }
  ): Promise<Chat> {
    try {
      return await this.prisma.chat.update({
        where: { id: chatId },
        data,
      });
    } catch (error) {
      throw new DatabaseError("Failed to update chat", error);
    }
  }
}
