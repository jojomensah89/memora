import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const contextRouter = router({
  // List all context items
  list: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          type: z.enum(["FILE", "URL", "GITHUB_REPO", "DOCUMENT"]).optional(),
          scope: z.enum(["LOCAL", "GLOBAL", "ORGANIZATION"]).optional(),
          tags: z.array(z.string()).optional(),
          chatId: z.string().optional(), // For checking selection state
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const items = await ctx.db.contextItem.findMany({
        where: {
          userId,
          ...(input?.scope && { scope: input.scope }),
          ...(input?.type && { type: input.type }),
          ...(input?.search && {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              {
                description: { contains: input.search, mode: "insensitive" },
              },
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

      return items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        scope: item.scope,
        tags: item.tags.map((t) => ({ name: t.name, color: t.color })),
        size: item.size,
        tokenCount: item.tokenCount,
        updatedAt: item.updatedAt,
        selected:
          input?.chatId && item.chatLinks
            ? item.chatLinks.some((link) => link.isSelected)
            : false,
      }));
    }),

  // Get single context item
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const item = await ctx.db.contextItem.findFirst({
        where: {
          id: input.id,
          userId,
        },
        include: {
          tags: true,
        },
      });

      if (!item) throw new Error("Context item not found");

      return item;
    }),

  // Create context item
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        type: z.enum(["FILE", "URL", "GITHUB_REPO", "DOCUMENT"]),
        scope: z.enum(["LOCAL", "GLOBAL", "ORGANIZATION"]),
        content: z.string(),
        rawContent: z.string().optional(),
        size: z.number().optional(),
        mimeType: z.string().optional(),
        storageKey: z.string().optional(),
        url: z.string().optional(),
        tokenCount: z.number().optional(),
        tags: z.array(z.string()).optional(),
        chatId: z.string().optional(), // Required for LOCAL scope
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Create context item
      const item = await ctx.db.contextItem.create({
        data: {
          name: input.name,
          description: input.description,
          type: input.type,
          scope: input.scope,
          content: input.content,
          rawContent: input.rawContent,
          size: input.size,
          mimeType: input.mimeType,
          storageKey: input.storageKey,
          url: input.url,
          tokenCount: input.tokenCount,
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

      // Link to chat if LOCAL scope
      if (input.scope === "LOCAL" && input.chatId) {
        await ctx.db.chatContext.create({
          data: {
            chatId: input.chatId,
            contextItemId: item.id,
            isSelected: true,
          },
        });
      }

      return item;
    }),

  // Update context item
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        scope: z.enum(["LOCAL", "GLOBAL", "ORGANIZATION"]).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const item = await ctx.db.contextItem.update({
        where: {
          id: input.id,
          userId,
        },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.scope && { scope: input.scope }),
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

      return item;
    }),

  // Delete context item
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      await ctx.db.contextItem.delete({
        where: {
          id: input.id,
          userId,
        },
      });

      return { success: true };
    }),

  // Link context to chat
  linkToChat: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        contextItemId: z.string(),
        isSelected: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const link = await ctx.db.chatContext.upsert({
        where: {
          chatId_contextItemId: {
            chatId: input.chatId,
            contextItemId: input.contextItemId,
          },
        },
        create: {
          chatId: input.chatId,
          contextItemId: input.contextItemId,
          isSelected: input.isSelected,
        },
        update: {
          isSelected: input.isSelected,
        },
      });

      return link;
    }),

  // Toggle selection in chat
  toggleSelection: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        contextItemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const existing = await ctx.db.chatContext.findUnique({
        where: {
          chatId_contextItemId: {
            chatId: input.chatId,
            contextItemId: input.contextItemId,
          },
        },
      });

      if (existing) {
        // Toggle selected state
        const updated = await ctx.db.chatContext.update({
          where: { id: existing.id },
          data: { isSelected: !existing.isSelected },
        });
        return updated;
      }
      // Create new link (selected by default)
      const created = await ctx.db.chatContext.create({
        data: {
          chatId: input.chatId,
          contextItemId: input.contextItemId,
          isSelected: true,
        },
      });
      return created;
    }),

  // Get selected context for chat (for message sending)
  getSelectedForChat: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const links = await ctx.db.chatContext.findMany({
        where: {
          chatId: input.chatId,
          isSelected: true,
        },
        include: {
          contextItem: {
            include: {
              tags: true,
            },
          },
        },
      });

      return links.map((link) => ({
        id: link.contextItem.id,
        name: link.contextItem.name,
        content: link.contextItem.content,
        tokenCount: link.contextItem.tokenCount,
        tags: link.contextItem.tags.map((t) => t.name),
      }));
    }),

  // Get all tags
  getTags: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const tags = await ctx.db.contextTag.findMany({
      where: { userId },
      select: { name: true, color: true },
    });

    return tags;
  }),
});
