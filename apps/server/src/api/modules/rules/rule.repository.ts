import prisma from "@memora/db";
import { DatabaseError } from "../../common/errors";
import type { CreateRuleInput } from "./rule.inputs";
import type { RuleStats, RuleWithTags } from "./rule.types";

async function findRulesByUser(userId: string) {
  try {
    return await prisma.rule.findMany({
      where: { userId },
      include: { tags: true },
      orderBy: [{ scope: "desc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    throw new DatabaseError("Failed to fetch rules", error);
  }
}

async function findRulesForChat(
  chatId: string,
  userId: string
): Promise<RuleWithTags[]> {
  try {
    // Get GLOBAL active rules + chat-specific LOCAL active rules
    const [globalRules, chatRules] = await Promise.all([
      // Global rules (available everywhere)
      prisma.rule.findMany({
        where: {
          userId,
          scope: "GLOBAL",
          isActive: true,
        },
        include: { tags: true },
        orderBy: { createdAt: "desc" },
      }),

      // Local rules linked to this chat
      prisma.rule.findMany({
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

async function findRuleById(
  id: string,
  userId: string
): Promise<RuleWithTags | null> {
  try {
    return (await prisma.rule.findFirst({
      where: { id, userId },
      include: { tags: true },
    })) as unknown as RuleWithTags;
  } catch (error) {
    throw new DatabaseError("Failed to fetch rule", error);
  }
}

/**
 * Create a new rule
 */
async function createRule(
  userId: string,
  data: CreateRuleInput
): Promise<RuleWithTags> {
  try {
    return (await prisma.rule.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        content: data.content,
        scope: data.scope,
        isActive: data.isActive,
        tags: data.tags?.length
          ? {
              create: data.tags.map((tag) => ({ name: tag, userId })),
            }
          : undefined,
      },
      include: { tags: true },
    })) as unknown as RuleWithTags;
  } catch (error) {
    throw new DatabaseError("Failed to create rule", error);
  }
}

/**
 * Get statistics about user's rules
 */
async function getRuleStats(userId: string): Promise<RuleStats> {
  try {
    const rules = await prisma.rule.findMany({
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

/**
 * Update an existing rule
 */
async function updateRule(
  id: string,
  userId: string,
  data: Partial<CreateRuleInput>
): Promise<RuleWithTags> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tags: _tags, ...updateData } = data;

    return (await prisma.rule.update({
      where: { id, userId },
      data: updateData,
      include: { tags: true },
    })) as unknown as RuleWithTags;
  } catch (error) {
    throw new DatabaseError("Failed to update rule", error);
  }
}

/**
 * Delete a rule
 */
async function deleteRule(id: string, userId: string): Promise<void> {
  try {
    await prisma.rule.deleteMany({
      where: { id, userId },
    });
  } catch (error) {
    throw new DatabaseError("Failed to delete rule", error);
  }
}

/**
 * Toggle rule active status
 */
async function toggleRuleActive(
  id: string,
  userId: string
): Promise<RuleWithTags> {
  try {
    const rule = await prisma.rule.findFirst({
      where: { id, userId },
      select: { isActive: true },
    });

    if (!rule) {
      throw new Error("Rule not found");
    }

    return (await prisma.rule.update({
      where: { id, userId },
      data: { isActive: !rule.isActive },
      include: { tags: true },
    })) as unknown as RuleWithTags;
  } catch (error) {
    throw new DatabaseError("Failed to toggle rule", error);
  }
}

/**
 * Link rule to a chat (for LOCAL rules)
 */
async function linkRuleToChat(
  ruleId: string,
  chatId: string,
  userId: string
): Promise<void> {
  try {
    // Verify rule belongs to user
    const rule = await prisma.rule.findFirst({
      where: { id: ruleId, userId },
    });

    if (!rule) {
      throw new Error("Rule not found");
    }

    if (rule.scope !== "LOCAL") {
      throw new Error("Only LOCAL rules can be linked to chats");
    }

    await prisma.chatRule.create({
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
async function unlinkRuleFromChat(
  ruleId: string,
  chatId: string,
  userId: string
): Promise<void> {
  try {
    await prisma.chatRule.deleteMany({
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

async function validateChatOwnership(
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

export {
  findRulesByUser,
  findRulesForChat,
  findRuleById,
  createRule,
  getRuleStats,
  updateRule,
  deleteRule,
  toggleRuleActive,
  linkRuleToChat,
  unlinkRuleFromChat,
  validateChatOwnership,
};
