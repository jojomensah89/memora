import prisma from "@memora/db";
import { DatabaseError } from "../../common/errors";
import type { CreateContextItemInput } from "./context-item.inputs";
import type { ContextItemWithTags, ContextStats } from "./context-item.types";

/**
 * Get all context items for a user
 */
export async function findContextItemsByUser(
  userId: string
): Promise<ContextItemWithTags[]> {
  try {
    return (await prisma.contextItem.findMany({
      where: { userId },
      include: { tags: true },
      orderBy: [{ scope: "desc" }, { createdAt: "desc" }],
    })) as unknown as ContextItemWithTags[];
  } catch (error) {
    throw new DatabaseError("Failed to fetch context items", error);
  }
}

/**
 * Get context items for a specific chat (GLOBAL + LOCAL)
 */
export async function findContextItemsForChat(
  chatId: string,
  userId: string
): Promise<ContextItemWithTags[]> {
  try {
    // Get GLOBAL items + chat-specific LOCAL items
    const [globalItems, chatItems] = await Promise.all([
      // Global items (available everywhere)
      prisma.contextItem.findMany({
        where: {
          userId,
          scope: "GLOBAL",
        },
        include: { tags: true },
        orderBy: { createdAt: "desc" },
      }),

      // Local items linked to this chat
      prisma.contextItem.findMany({
        where: {
          userId,
          chatLinks: {
            some: {
              chatId,
              isSelected: true,
            },
          },
        },
        include: { tags: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return [...globalItems, ...chatItems] as unknown as ContextItemWithTags[];
  } catch (error) {
    throw new DatabaseError("Failed to fetch chat context items", error);
  }
}

/**
 * Get single context item by ID
 */
export async function findContextItemById(
  id: string,
  userId: string
): Promise<ContextItemWithTags | null> {
  try {
    return (await prisma.contextItem.findFirst({
      where: { id, userId },
      include: { tags: true },
    })) as unknown as ContextItemWithTags;
  } catch (error) {
    throw new DatabaseError("Failed to fetch context item", error);
  }
}

/**
 * Create a new context item
 */
export async function createContextItem(
  userId: string,
  data: CreateContextItemInput
): Promise<ContextItemWithTags> {
  try {
    return (await prisma.contextItem.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        type: data.type,
        content: data.content,
        rawContent: data.rawContent,
        size: data.size,
        mimeType: data.mimeType,
        url: data.url,
        scope: data.scope,
        tags: data.tags?.length
          ? {
              create: data.tags.map((tag) => ({ name: tag, userId })),
            }
          : undefined,
        chatLinks:
          data.chatId && data.scope === "LOCAL"
            ? {
                create: {
                  chatId: data.chatId,
                  isSelected: true,
                },
              }
            : undefined,
      },
      include: { tags: true },
    })) as unknown as ContextItemWithTags;
  } catch (error) {
    throw new DatabaseError("Failed to create context item", error);
  }
}

/**
 * Promote context item from LOCAL to GLOBAL
 */
export async function promoteContextItemToGlobal(
  id: string,
  userId: string
): Promise<ContextItemWithTags> {
  try {
    return (await prisma.contextItem.update({
      where: { id, userId },
      data: { scope: "GLOBAL" },
      include: { tags: true },
    })) as unknown as ContextItemWithTags;
  } catch (error) {
    throw new DatabaseError("Failed to promote context item", error);
  }
}

/**
 * Get statistics about user's context items
 */
export async function getContextStats(userId: string): Promise<ContextStats> {
  try {
    const items = await prisma.contextItem.findMany({
      where: { userId },
      select: { scope: true, type: true, tokens: true, size: true },
    });

    const byType: Record<string, number> = {
      FILE: 0,
      URL: 0,
      GITHUB_REPO: 0,
      DOCUMENT: 0,
    };

    let totalTokens = 0;
    let totalSize = 0;

    for (const item of items) {
      byType[item.type] = (byType[item.type] || 0) + 1;
      totalTokens += item.tokens || 0;
      totalSize += item.size || 0;
    }

    return {
      total: items.length,
      global: items.filter((i) => i.scope === "GLOBAL").length,
      local: items.filter((i) => i.scope === "LOCAL").length,
      byType: byType as any,
      totalTokens,
      totalSize,
    };
  } catch (error) {
    throw new DatabaseError("Failed to get context stats", error);
  }
}

/**
 * Update an existing context item
 */
export async function updateContextItem(
  id: string,
  userId: string,
  data: Partial<CreateContextItemInput>
): Promise<ContextItemWithTags> {
  try {
    // Remove chat links from main update as they need special handling
    const updateData: any = { ...data };
    updateData.chatId = undefined;
    updateData.tags = undefined;
    updateData.metadata = undefined; // Not in DB

    return (await prisma.contextItem.update({
      where: { id, userId },
      data: updateData,
      include: { tags: true },
    })) as unknown as ContextItemWithTags;
  } catch (error) {
    throw new DatabaseError("Failed to update context item", error);
  }
}

/**
 * Delete a context item
 */
export async function deleteContextItem(
  id: string,
  userId: string
): Promise<void> {
  try {
    await prisma.contextItem.deleteMany({
      where: { id, userId },
    });
  } catch (error) {
    throw new DatabaseError("Failed to delete context item", error);
  }
}

/**
 * Link context item to a chat (for LOCAL context items)
 */
export async function linkContextToChat(
  contextId: string,
  chatId: string,
  userId: string
): Promise<void> {
  try {
    // Verify context item belongs to user
    const context = await prisma.contextItem.findFirst({
      where: { id: contextId, userId },
    });

    if (!context) {
      throw new Error("Context item not found");
    }

    if (context.scope !== "LOCAL") {
      throw new Error("Only LOCAL context items can be linked to chats");
    }

    await prisma.chatContext.create({
      data: {
        contextItemId: contextId,
        chatId,
        isSelected: true,
      },
    });
  } catch (error) {
    throw new DatabaseError("Failed to link context item to chat", error);
  }
}

/**
 * Unlink context item from a chat
 */
export async function unlinkContextFromChat(
  contextId: string,
  chatId: string,
  userId: string
): Promise<void> {
  try {
    await prisma.chatContext.deleteMany({
      where: {
        contextItemId: contextId,
        chatId,
        contextItem: { userId },
      },
    });
  } catch (error) {
    throw new DatabaseError("Failed to unlink context item from chat", error);
  }
}

export async function validateChatOwnership(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });
    return !!chat;
  } catch (error) {
    throw new DatabaseError("Failed to validate chat ownership", error);
  }
}
