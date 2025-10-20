import prisma from "@memora/db";
import type { AttachmentKind, Prisma } from "@prisma/client";
import type {
  AttachmentMetadata,
  ModelDescriptor,
} from "./chat.types";

type CreateChatWithMessageParams = {
  userId: string;
  title: string;
  initialMessage: string;
  modelId: string;
  useWebSearch: boolean;
  attachments: {
    kind: AttachmentKind;
    filename: string;
    mimeType: string;
    size: number;
    storageKey: string;
    transcription?: string | null;
    metadata?: Prisma.InputJsonValue;
  }[];
};

type FindChatsParams = {
  userId: string;
  includeArchived: boolean;
  limit: number;
  cursor?: string;
};

export class ChatRepository {
  createChatWithMessage({
    userId,
    title,
    initialMessage,
    modelId,
    useWebSearch,
    attachments,
  }: CreateChatWithMessageParams) {
    return prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: {
          title,
          userId,
          metadata: {
            modelId,
            useWebSearch,
          },
          messages: {
            create: {
              content: initialMessage,
              role: "user",
              metadata: {
                modelId,
              },
            },
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      const firstMessage = chat.messages[0];

      if (!firstMessage) {
        throw new Error("Failed to create initial message for chat");
      }

      if (attachments.length > 0) {
        await tx.attachment.createMany({
          data: attachments.map((attachment) => ({
            ...attachment,
            messageId: firstMessage.id,
          })),
        });
      }

      return chat;
    });
  }

  async findChatsByUser({
    userId,
    includeArchived,
    limit,
    cursor,
  }: FindChatsParams) {
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

    return { chats, nextCursor };
  }

  findChatById(id: string, userId: string) {
    return prisma.chat.findUnique({
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
  }

  listModels(): ModelDescriptor[] {
    // TODO: Move to persistent storage or configuration service
    return [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        provider: "openai",
        supportsWebSearch: true,
      },
      {
        id: "claude-opus-4-20250514",
        name: "Claude 4 Opus",
        provider: "anthropic",
        supportsWebSearch: false,
      },
    ];
  }

  async listAttachmentsByChat(chatId: string): Promise<AttachmentMetadata[]> {
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
      transcription: attachment.transcription,
      url: undefined,
    }));
  }
}
