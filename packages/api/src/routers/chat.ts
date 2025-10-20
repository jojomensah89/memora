import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { ChatController } from "../modules/chat/chat.controller";
import { ChatRepository } from "../modules/chat/chat.repository";
import { ChatService } from "../modules/chat/chat.service";
import {
  createChatInputSchema,
  enhancePromptInputSchema,
} from "../modules/chat/chat.inputs";

const chatRepository = new ChatRepository();
const chatService = new ChatService(
  chatRepository,
  {
    async resolveStorageKey(uploadId, filename) {
      // TODO: integrate actual storage service
      return `${uploadId}/${filename}`;
    },
  },
  {
    async enhance(input) {
      // TODO: integrate with AI provider
      return {
        enhancedText: input.text,
        modelId: input.modelId,
        useWebSearchApplied: input.useWebSearch,
      };
    },
  }
);
const chatController = new ChatController(chatService);

const CHAT_LIST_DEFAULT_LIMIT = 50;
const CHAT_LIST_MAX_LIMIT = 100;

export const chatRouter = router({
  getModels: protectedProcedure.query(() => chatController.getModels()),

  createChat: protectedProcedure
    .input(createChatInputSchema)
    .mutation(async ({ ctx, input }) =>
      chatController.createChat({
        userId: ctx.session.user.id,
        input,
      })
    ),

  // Get all chats for the current user
  getAllChats: protectedProcedure
    .input(
      z
        .object({
          includeArchived: z.boolean().optional().default(false),
          limit: z
            .number()
            .min(1)
            .max(CHAT_LIST_MAX_LIMIT)
            .optional()
            .default(CHAT_LIST_DEFAULT_LIMIT),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? CHAT_LIST_DEFAULT_LIMIT;
      const cursor = input?.cursor;

      return await chatController.listChats({
        userId: ctx.session.user.id,
        includeArchived: input?.includeArchived ?? false,
        limit,
        cursor,
      });
    }),

  getChat: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) =>
      chatController.getChat({
        id: input.id,
        userId: ctx.session.user.id,
      })
    ),

  enhancePrompt: protectedProcedure
    .input(enhancePromptInputSchema)
    .mutation(async ({ ctx, input }) =>
      chatController.enhancePrompt({
        userId: ctx.session.user.id,
        input,
      })
    ),
});
