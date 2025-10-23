import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { ChatController } from "../modules/chat/chat.controller";
import {
  createChatInputSchema,
  enhancePromptInputSchema,
  forkChatInputSchema,
  getChatInputSchema,
  listChatsInputSchema,
} from "../modules/chat/chat.inputs";
import { ChatRepository } from "../modules/chat/chat.repository";
import { ChatService } from "../modules/chat/chat.service";

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository, {
  async enhance(input) {
    return {
      enhancedText: input.text,
      useWebSearchApplied: input.useWebSearch,
      suggestions: [],
    };
  },
});
const chatController = new ChatController(chatService);

export const chatRouter = router({
  getModels: protectedProcedure.query(() => chatController.getModels()),

  createChat: protectedProcedure
    .input(createChatInputSchema)
    .mutation(async ({ ctx, input }) =>
      chatController.createChat(ctx.session.user.id, input)
    ),

  // Get all chats for the current user
  getAllChats: protectedProcedure
    .input(listChatsInputSchema.optional())
    .query(async ({ ctx, input }) => {
      const parsed = listChatsInputSchema.parse(input ?? {});
      return chatController.listChats(ctx.session.user.id, parsed);
    }),

  getChat: protectedProcedure
    .input(getChatInputSchema)
    .query(async ({ ctx, input }) =>
      chatController.getChat(ctx.session.user.id, input)
    ),

  enhancePrompt: protectedProcedure
    .input(enhancePromptInputSchema)
    .mutation(async ({ ctx, input }) =>
      chatController.enhancePrompt(ctx.session.user.id, input)
    ),

  forkChat: protectedProcedure
    .input(forkChatInputSchema)
    .mutation(async ({ ctx, input }) =>
      chatController.forkChat(ctx.session.user.id, input)
    ),

  generateAIResponse: protectedProcedure
    .input(getChatInputSchema.extend({ message: z.string().min(1) }))
    .mutation(async ({ ctx, input }) =>
      chatController.generateAIResponse(
        ctx.session.user.id,
        input.id,
        input.message
      )
    ),
});
