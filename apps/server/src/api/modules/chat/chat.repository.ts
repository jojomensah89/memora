import prisma from "@memora/db";
import type { AIProvider, AttachmentKind, Chat, Prisma } from "@memora/db";
import type { UIMessage } from "ai";
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
  chatId?: string; // Optional pre-generated ID from frontend
};

type FindChatsParams = {
  userId: string;
  includeArchived: boolean;
  limit: number;
  cursor?: string;
};

export async function createChatWithMessage({
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
  chatId,
}: CreateChatWithMessageParams): Promise<ChatWithMessages> {
  try {
    return await prisma.chat.create({
      data: {
        id: chatId, // Use provided chatId or let Prisma generate
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

export async function findChatsByUser({
  userId,
  includeArchived,
  limit,
  cursor,
}: FindChatsParams): Promise<ChatListResult> {
  try {
    const chats = await prisma.chat.findMany({
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

export async function findChatById(
  id: string,
  userId: string
): Promise<ChatWithMessages | null> {
  try {
    return await prisma.chat.findFirst({
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

export async function forkChat(
  originalChatId: string,
  userId: string,
  title: string,
  forkedFromMessageId: string
): Promise<ChatWithMessages> {
  try {
    // Get the original chat and verify ownership
    const originalChat = await findChatById(originalChatId, userId);
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

    const newChat = await prisma.chat.create({
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
            metadata: msg.metadata as Prisma.InputJsonValue,
            attachments: msg.attachments.length
              ? {
                  create: msg.attachments.map((att) => ({
                    kind: att.kind,
                    filename: att.filename,
                    mimeType: att.mimeType,
                    size: att.size,
                    storageKey: att.storageKey,
                    transcription: att.transcription,
                    metadata: att.metadata as Prisma.InputJsonValue,
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

    return newChat as ChatWithMessages;
  } catch (error) {
    throw new DatabaseError("Failed to fork chat", error);
  }
}

export function listModels(): ModelDescriptor[] {
  return AVAILABLE_MODELS.map((model) => ({
    ...model,
    supportsWebSearch: model.provider !== "CLAUDE",
  }));
}

export async function listAttachmentsByChat(chatId: string): Promise<AttachmentMetadata[]> {
  try {
    const attachments = await prisma.attachment.findMany({
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

export async function updateLastActivity(chatId: string): Promise<void> {
  try {
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });
  } catch (error) {
    throw new DatabaseError("Failed to update chat activity", error);
  }
}

export async function updateChat(
  chatId: string,
  data: { title?: string; model?: string }
): Promise<Chat> {
  try {
    return await prisma.chat.update({
      where: { id: chatId },
      data,
    });
  } catch (error) {
    throw new DatabaseError("Failed to update chat", error);
  }
}

export async function saveMessages(chatId: string, messages: UIMessage[]) {
  try {
    // Prepare messages for bulk insert
    const messageData = messages.map((msg) => {
      const content = msg.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");

      return {
        id: msg.id,
        chatId,
        role: msg.role,
        content,
        createdAt: (msg as any).createdAt ? new Date((msg as any).createdAt) : new Date(),
        metadata: {
          parts: msg.parts,
        } as Prisma.InputJsonValue,
      };
    });

    // Bulk insert messages
    await prisma.message.createMany({
      data: messageData,
    });

    // Update chat's last activity
    await updateLastActivity(chatId);
  } catch (error) {
    throw new DatabaseError("Failed to save messages", error);
  }
}

export async function deleteChat(chatId: string, userId: string): Promise<void> {
  try {
    await prisma.chat.delete({
      where: { id: chatId, userId },
    });
  } catch (error) {
    throw new DatabaseError("Failed to delete chat", error);
  }
}
