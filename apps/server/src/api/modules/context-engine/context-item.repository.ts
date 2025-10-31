import { BaseRepository } from "../../common/base";
import { DatabaseError } from "../../common/errors";
import type { CreateContextItemInput } from "./context-item.inputs";
import type { ContextItemWithTags, ContextStats } from "./context-item.types";

/**
 * Context Item Repository
 * Handles all database operations for context items
 */
export class ContextItemRepository extends BaseRepository<ContextItemWithTags> {
  /**
   * Get all context items for a user
   */
  async findAllByUser(userId: string): Promise<ContextItemWithTags[]> {
    try {
      return await this.prisma.contextItem.findMany({
        where: { userId },
        include: { tags: true },
        orderBy: [{ scope: "desc" }, { createdAt: "desc" }],
      });
    } catch (error) {
      throw new DatabaseError("Failed to fetch context items", error);
    }
  }

  /**
   * Get context items for a specific chat (GLOBAL + LOCAL)
   */
  async findForChat(
    chatId: string,
    userId: string
  ): Promise<ContextItemWithTags[]> {
    try {
      // Get GLOBAL items + chat-specific LOCAL items
      const [globalItems, chatItems] = await Promise.all([
        // Global items (available everywhere)
        this.prisma.contextItem.findMany({
          where: {
            userId,
            scope: "GLOBAL",
          },
          include: { tags: true },
          orderBy: { createdAt: "desc" },
        }),

        // Local items linked to this chat
        this.prisma.contextItem.findMany({
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

      return [...globalItems, ...chatItems];
    } catch (error) {
      throw new DatabaseError("Failed to fetch chat context items", error);
    }
  }

  /**
   * Get single context item by ID
   */
  async findById(
    id: string,
    userId: string
  ): Promise<ContextItemWithTags | null> {
    try {
      return await this.prisma.contextItem.findFirst({
        where: { id, userId },
        include: { tags: true },
      });
    } catch (error) {
      throw new DatabaseError("Failed to fetch context item", error);
    }
  }

  /**
   * Create a new context item
   */
  async create(
    userId: string,
    data: CreateContextItemInput
  ): Promise<ContextItemWithTags> {
    try {
      return await this.prisma.contextItem.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          type: data.type,
          content: data.content,
          rawContent: data.rawContent,
          size: data.size,
          scope: data.scope,
          metadata: data.metadata as any,
          tags: data.tags?.length
            ? {
                create: data.tags.map((tag) => ({ name: tag })),
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
      });
    } catch (error) {
      throw new DatabaseError("Failed to create context item", error);
    }
  }

  /**
   * Promote context item from LOCAL to GLOBAL
   */
  async promoteToGlobal(
    id: string,
    userId: string
  ): Promise<ContextItemWithTags> {
    try {
      return await this.prisma.contextItem.update({
        where: { id, userId },
        data: { scope: "GLOBAL" },
        include: { tags: true },
      });
    } catch (error) {
      throw new DatabaseError("Failed to promote context item", error);
    }
  }

  /**
   * Get statistics about user's context items
   */
  async getStats(userId: string): Promise<ContextStats> {
    try {
      const items = await this.prisma.contextItem.findMany({
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
  async update(
    id: string,
    userId: string,
    data: Partial<CreateContextItemInput>
  ): Promise<ContextItemWithTags> {
    try {
      // Remove chat links from main update as they need special handling
      const updateData: any = { ...data };
      updateData.chatId = undefined;
      updateData.tags = undefined;

      return await this.prisma.contextItem.update({
        where: { id, userId },
        data: updateData,
        include: { tags: true },
      });
    } catch (error) {
      throw new DatabaseError("Failed to update context item", error);
    }
  }

  /**
   * Delete a context item
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prisma.contextItem.deleteMany({
        where: { id, userId },
      });
    } catch (error) {
      throw new DatabaseError("Failed to delete context item", error);
    }
  }

  /**
   * Link context item to a chat (for LOCAL context items)
   */
  async linkToChat(
    contextId: string,
    chatId: string,
    userId: string
  ): Promise<void> {
    try {
      // Verify context item belongs to user
      const context = await this.prisma.contextItem.findFirst({
        where: { id: contextId, userId },
      });

      if (!context) {
        throw new Error("Context item not found");
      }

      if (context.scope !== "LOCAL") {
        throw new Error("Only LOCAL context items can be linked to chats");
      }

      await this.prisma.chatContextLink.create({
        data: {
          contextId,
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
  async unlinkFromChat(
    contextId: string,
    chatId: string,
    userId: string
  ): Promise<void> {
    try {
      await this.prisma.chatContextLink.deleteMany({
        where: {
          contextId,
          chatId,
          context: { userId },
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to unlink context item from chat", error);
    }
  }
}
