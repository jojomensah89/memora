import { BaseRepository } from "../../common/base";
import { DatabaseError } from "../../common/errors";
import type { CreateRuleInput } from "./rule.inputs";
import type { RuleStats, RuleWithTags } from "./rule.types";

/**
 * Rule Repository
 * Handles all database operations for rules
 */
export class RuleRepository extends BaseRepository<RuleWithTags> {
  /**
   * Get all rules for a user
   */
  async findAllByUser(userId: string): Promise<RuleWithTags[]> {
    try {
      return await this.prisma.rule.findMany({
        where: { userId },
        include: { tags: true },
        orderBy: [{ scope: "desc" }, { createdAt: "desc" }],
      });
    } catch (error) {
      throw new DatabaseError("Failed to fetch rules", error);
    }
  }

  /**
   * Get rules for a specific chat (GLOBAL + LOCAL)
   */
  async findForChat(chatId: string, userId: string): Promise<RuleWithTags[]> {
    try {
      // Get GLOBAL active rules + chat-specific LOCAL active rules
      const [globalRules, chatRules] = await Promise.all([
        // Global rules (available everywhere)
        this.prisma.rule.findMany({
          where: {
            userId,
            scope: "GLOBAL",
            isActive: true,
          },
          include: { tags: true },
          orderBy: { createdAt: "desc" },
        }),

        // Local rules linked to this chat
        this.prisma.rule.findMany({
          where: {
            userId,
            chatLinks: {
              some: {
                chatId,
                isActive: true,
              },
            },
          },
          include: { tags: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return [...globalRules, ...chatRules];
    } catch (error) {
      throw new DatabaseError("Failed to fetch chat rules", error);
    }
  }

  /**
   * Get single rule by ID
   */
  async findById(id: string, userId: string): Promise<RuleWithTags | null> {
    try {
      return await this.prisma.rule.findFirst({
        where: { id, userId },
        include: { tags: true },
      });
    } catch (error) {
      throw new DatabaseError("Failed to fetch rule", error);
    }
  }

  /**
   * Create a new rule
   */
  async create(userId: string, data: CreateRuleInput): Promise<RuleWithTags> {
    try {
      return await this.prisma.rule.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          content: data.content,
          scope: data.scope,
          isActive: data.isActive,
          tags: data.tags?.length
            ? {
                create: data.tags.map((tag) => ({ name: tag })),
              }
            : undefined,
        },
        include: { tags: true },
      });
    } catch (error) {
      throw new DatabaseError("Failed to create rule", error);
    }
  }

  /**
   * Get statistics about user's rules
   */
  async getStats(userId: string): Promise<RuleStats> {
    try {
      const rules = await this.prisma.rule.findMany({
        where: { userId },
        select: { scope: true, isActive: true },
      });

      return {
        total: rules.length,
        global: rules.filter((r: { scope: string }) => r.scope === "GLOBAL")
          .length,
        local: rules.filter((r: { scope: string }) => r.scope === "LOCAL")
          .length,
        active: rules.filter((r: { isActive: boolean }) => r.isActive).length,
        inactive: rules.filter((r: { isActive: boolean }) => !r.isActive)
          .length,
      };
    } catch (error) {
      throw new DatabaseError("Failed to get rule stats", error);
    }
  }

  /**
   * Update an existing rule
   */
  async update(
    id: string,
    userId: string,
    data: Partial<CreateRuleInput>
  ): Promise<RuleWithTags> {
    try {
      // Handle tags update
      const updateData: any = {
        ...data,
      };

      // Remove tags from main update as they need special handling
      delete updateData.tags;

      return await this.prisma.rule.update({
        where: { id, userId },
        data: updateData,
        include: { tags: true },
      });
    } catch (error) {
      throw new DatabaseError("Failed to update rule", error);
    }
  }

  /**
   * Delete a rule
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.prisma.rule.deleteMany({
        where: { id, userId },
      });
    } catch (error) {
      throw new DatabaseError("Failed to delete rule", error);
    }
  }

  /**
   * Toggle rule active status
   */
  async toggleActive(id: string, userId: string): Promise<RuleWithTags> {
    try {
      const rule = await this.prisma.rule.findFirst({
        where: { id, userId },
        select: { isActive: true },
      });

      if (!rule) {
        throw new Error("Rule not found");
      }

      return await this.prisma.rule.update({
        where: { id, userId },
        data: { isActive: !rule.isActive },
        include: { tags: true },
      });
    } catch (error) {
      throw new DatabaseError("Failed to toggle rule", error);
    }
  }

  /**
   * Link rule to a chat (for LOCAL rules)
   */
  async linkToChat(
    ruleId: string,
    chatId: string,
    userId: string
  ): Promise<void> {
    try {
      // Verify rule belongs to user
      const rule = await this.prisma.rule.findFirst({
        where: { id: ruleId, userId },
      });

      if (!rule) {
        throw new Error("Rule not found");
      }

      if (rule.scope !== "LOCAL") {
        throw new Error("Only LOCAL rules can be linked to chats");
      }

      await this.prisma.chatRuleLink.create({
        data: {
          ruleId,
          chatId,
          isActive: true,
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to link rule to chat", error);
    }
  }

  /**
   * Unlink rule from a chat
   */
  async unlinkFromChat(
    ruleId: string,
    chatId: string,
    userId: string
  ): Promise<void> {
    try {
      await this.prisma.chatRuleLink.deleteMany({
        where: {
          ruleId,
          chatId,
          rule: { userId },
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to unlink rule from chat", error);
    }
  }
}
