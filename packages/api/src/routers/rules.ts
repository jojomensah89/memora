import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const rulesRouter = router({
  // List all rules
  list: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          scope: z.enum(["LOCAL", "GLOBAL", "ORGANIZATION"]).optional(),
          isActive: z.boolean().optional(),
          tags: z.array(z.string()).optional(),
          chatId: z.string().optional(), // For checking active state
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) { throw new Error("Unauthorized"); }

      const rules = await ctx.db.rule.findMany({
        where: {
          userId,
          ...(input?.scope && { scope: input.scope }),
          ...(input?.isActive !== undefined && { isActive: input.isActive }),
          ...(input?.search && {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              {
                description: { contains: input.search, mode: "insensitive" },
              },
              { content: { contains: input.search, mode: "insensitive" } },
            ],
          }),
          ...(input?.tags &&
            input.tags.length > 0 && {
              tags: { some: { name: { in: input.tags } } },
            }),
        },
        include: {
          tags: true,
          ...(input?.chatId && {
            chatLinks: {
              where: { chatId: input.chatId },
            },
          }),
        },
        orderBy: { createdAt: "desc" },
      });

      return rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        content: rule.content,
        scope: rule.scope,
        isActive: rule.isActive,
        tags: rule.tags.map((t) => ({ name: t.name, color: t.color })),
        updatedAt: rule.updatedAt,
        activeInChat:
          input?.chatId && rule.chatLinks
            ? rule.chatLinks.some((link) => link.isActive)
            : false,
      }));
    }),

  // Get single rule
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const rule = await ctx.db.rule.findFirst({
        where: {
          id: input.id,
          userId,
        },
        include: {
          tags: true,
        },
      });

      if (!rule) throw new Error("Rule not found");

      return rule;
    }),

  // Create rule
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        content: z.string(),
        scope: z.enum(["LOCAL", "GLOBAL", "ORGANIZATION"]),
        isActive: z.boolean().default(true),
        tags: z.array(z.string()).optional(),
        chatId: z.string().optional(), // Required for LOCAL scope
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Create rule
      const rule = await ctx.db.rule.create({
        data: {
          name: input.name,
          description: input.description,
          content: input.content,
          scope: input.scope,
          isActive: input.isActive,
          userId,
          tags: input.tags
            ? {
                connectOrCreate: input.tags.map((name) => ({
                  where: { userId_name: { userId, name } },
                  create: { name, userId },
                })),
              }
            : undefined,
        },
        include: {
          tags: true,
        },
      });

      // Link to chat if LOCAL scope or if specified
      if (input.chatId) {
        await ctx.db.chatRule.create({
          data: {
            chatId: input.chatId,
            ruleId: rule.id,
            isActive: input.isActive,
          },
        });
      }

      return rule;
    }),

  // Update rule
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        scope: z.enum(["LOCAL", "GLOBAL", "ORGANIZATION"]).optional(),
        isActive: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const rule = await ctx.db.rule.update({
        where: {
          id: input.id,
          userId,
        },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.content && { content: input.content }),
          ...(input.scope && { scope: input.scope }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          ...(input.tags && {
            tags: {
              set: [],
              connectOrCreate: input.tags.map((name) => ({
                where: { userId_name: { userId, name } },
                create: { name, userId },
              })),
            },
          }),
        },
        include: {
          tags: true,
        },
      });

      return rule;
    }),

  // Toggle active status
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const rule = await ctx.db.rule.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!rule) throw new Error("Rule not found");

      const updated = await ctx.db.rule.update({
        where: { id: input.id },
        data: { isActive: !rule.isActive },
      });

      return updated;
    }),

  // Delete rule
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      await ctx.db.rule.delete({
        where: {
          id: input.id,
          userId,
        },
      });

      return { success: true };
    }),

  // Link rule to chat
  linkToChat: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        ruleId: z.string(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const link = await ctx.db.chatRule.upsert({
        where: {
          chatId_ruleId: {
            chatId: input.chatId,
            ruleId: input.ruleId,
          },
        },
        create: {
          chatId: input.chatId,
          ruleId: input.ruleId,
          isActive: input.isActive,
        },
        update: {
          isActive: input.isActive,
        },
      });

      return link;
    }),

  // Toggle active in chat
  toggleActiveInChat: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        ruleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const existing = await ctx.db.chatRule.findUnique({
        where: {
          chatId_ruleId: {
            chatId: input.chatId,
            ruleId: input.ruleId,
          },
        },
      });

      if (existing) {
        // Toggle active state
        const updated = await ctx.db.chatRule.update({
          where: { id: existing.id },
          data: { isActive: !existing.isActive },
        });
        return updated;
      }
      // Create new link (active by default)
      const created = await ctx.db.chatRule.create({
        data: {
          chatId: input.chatId,
          ruleId: input.ruleId,
          isActive: true,
        },
      });
      return created;
    }),

  // Get active rules for chat (for message sending)
  getActiveForChat: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Get global active rules
      const globalRules = await ctx.db.rule.findMany({
        where: {
          userId,
          scope: "GLOBAL",
          isActive: true,
        },
        include: {
          tags: true,
        },
      });

      // Get chat-specific rules
      const chatRules = await ctx.db.chatRule.findMany({
        where: {
          chatId: input.chatId,
          isActive: true,
        },
        include: {
          rule: {
            include: {
              tags: true,
            },
          },
        },
      });

      const allRules = [
        ...globalRules.map((rule) => ({
          id: rule.id,
          name: rule.name,
          content: rule.content,
          tags: rule.tags.map((t) => t.name),
        })),
        ...chatRules.map((link) => ({
          id: link.rule.id,
          name: link.rule.name,
          content: link.rule.content,
          tags: link.rule.tags.map((t) => t.name),
        })),
      ];

      // Remove duplicates
      const uniqueRules = Array.from(
        new Map(allRules.map((rule) => [rule.id, rule])).values()
      );

      return uniqueRules;
    }),

  // Get all tags
  getTags: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const tags = await ctx.db.ruleTag.findMany({
      where: { userId },
      select: { name: true, color: true },
    });

    return tags;
  }),
});
