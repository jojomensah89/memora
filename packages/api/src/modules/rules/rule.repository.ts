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
          // TODO: Handle tags creation
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
        global: rules.filter((r) => r.scope === "GLOBAL").length,
        local: rules.filter((r) => r.scope === "LOCAL").length,
        active: rules.filter((r) => r.isActive).length,
        inactive: rules.filter((r) => !r.isActive).length,
      };
    } catch (error) {
      throw new DatabaseError("Failed to get rule stats", error);
    }
  }

  // TODO: Implement later
  // - update()
  // - delete()
  // - toggleActive()
  // - linkToChat()
  // - unlinkFromChat()
}
