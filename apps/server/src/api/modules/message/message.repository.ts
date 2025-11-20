import  prisma  from "@memora/db";
import type { Prisma } from "@memora/db";
import { DatabaseError } from "../../common/errors";
import type {
  CreateMessageData,
  MessageListItem,
  MessageListResult,
  MessageWithAttachments,
} from "./message.types";

export type CreateMessageAttachmentData = {
  kind: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  transcription?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function createMessage({
  content,
  role,
  chatId,
  metadata,
}: CreateMessageData): Promise<MessageWithAttachments> {
  try {
    return await prisma.message.create({
      data: {
        content,
        role,
        chatId,
        metadata,
      },
      include: {
        attachments: true,
      },
    });
  } catch (error) {
    throw new DatabaseError("Failed to create message", error);
  }
}

export async function createMessageWithAttachments({
  content,
  role,
  chatId,
  metadata,
  attachments,
}: CreateMessageData & {
  attachments: CreateMessageAttachmentData[];
}): Promise<MessageWithAttachments> {
  try {
    return await prisma.message.create({
      data: {
        content,
        role,
        chatId,
        metadata,
        attachments: attachments.length
          ? {
              create: attachments.map((attachment) => ({
                kind: attachment.kind as any,
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
      include: {
        attachments: true,
      },
    });
  } catch (error) {
    throw new DatabaseError(
      "Failed to create message with attachments",
      error
    );
  }
}

export async function getMessagesByChatId(
  chatId: string,
  userId: string,
  limit = 50,
  cursor?: string
): Promise<MessageListResult> {
  try {
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        chat: { userId },
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "asc" },
      include: {
        attachments: true,
        chat: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    let nextCursor: string | undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    const items: MessageListItem[] = messages.map((message) => ({
      ...message,
      chatId: message.chatId,
      chatTitle: message.chat.title,
    }));

    return { messages: items, nextCursor };
  } catch (error) {
    throw new DatabaseError("Failed to fetch messages", error);
  }
}

export async function getMessageById(
  id: string,
  userId: string
): Promise<MessageWithAttachments | null> {
  try {
    return await prisma.message.findFirst({
      where: {
        id,
        chat: { userId },
      },
      include: {
        attachments: true,
      },
    });
  } catch (error) {
    throw new DatabaseError("Failed to fetch message", error);
  }
}

export async function updateMessage(
  id: string,
  userId: string,
  data: Partial<CreateMessageData>
): Promise<MessageWithAttachments> {
  try {
    const message = await prisma.message.updateMany({
      where: {
        id,
        chat: { userId },
      },
      data,
    });

    if (message.count === 0) {
      throw new Error("Message not found or update failed");
    }

    return await getMessageById(id, userId).then((msg) => {
      if (!msg) {
        throw new Error("Failed to retrieve updated message");
      }
      return msg;
    });
  } catch (error) {
    throw new DatabaseError("Failed to update message", error);
  }
}

export async function deleteMessage(id: string, userId: string): Promise<void> {
  try {
    const result = await prisma.message.deleteMany({
      where: {
        id,
        chat: { userId },
      },
    });

    if (result.count === 0) {
      throw new Error("Message not found or deletion failed");
    }
  } catch (error) {
    throw new DatabaseError("Failed to delete message", error);
  }
}

export async function updateTokenCount(id: string, tokenCount: number): Promise<void> {
  try {
    await prisma.message.update({
      where: { id },
      data: {
        metadata: {
          tokenCount,
        } as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    throw new DatabaseError("Failed to update message token count", error);
  }
}

export async function getMessageStatisticsForChat(
  chatId: string,
  userId: string
): Promise<{
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  systemMessages: number;
  totalTokens: number;
}> {
  try {
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        chat: { userId },
      },
      select: {
        role: true,
        metadata: true,
      },
    });

    const stats = {
      totalMessages: messages.length,
      userMessages: messages.filter((m: { role: string }) => m.role === "user").length,
      assistantMessages: messages.filter((m: { role: string }) => m.role === "assistant")
        .length,
      systemMessages: messages.filter((m: { role: string }) => m.role === "system").length,
      totalTokens: 0,
    };

    stats.totalTokens = messages.reduce((sum: number, message: { metadata: Prisma.JsonValue }) => {
      const tokenCount =
        message.metadata &&
        typeof message.metadata === "object" &&
        !Array.isArray(message.metadata) &&
        "tokenCount" in message.metadata
          ? Number((message.metadata as { tokenCount: number }).tokenCount) ||
            0
          : 0;
      return sum + tokenCount;
    }, 0);

    return stats;
  } catch (error) {
    throw new DatabaseError("Failed to get message statistics", error);
  }
}

export async function validateChatOwnership(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
    });
    return !!chat;
  } catch (error) {
    throw new DatabaseError("Failed to validate chat ownership", error);
  }
}
