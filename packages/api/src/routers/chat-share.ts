import { protectedProcedure, publicProcedure, router } from "../index";
import { ChatShareController } from "../modules/chat-share/chat-share.controller";
import {
  createShareInputSchema,
  deleteShareInputSchema,
  getSharedChatInputSchema,
  updateShareInputSchema,
} from "../modules/chat-share/chat-share.inputs";
import { ChatShareRepository } from "../modules/chat-share/chat-share.repository";
import { ChatShareService } from "../modules/chat-share/chat-share.service";

const chatShareRepository = new ChatShareRepository();
const chatShareService = new ChatShareService(chatShareRepository);
const chatShareController = new ChatShareController(chatShareService);

export const chatShareRouter = router({
  // Create a new share (protected)
  create: protectedProcedure
    .input(createShareInputSchema)
    .mutation(async ({ ctx, input }) =>
      chatShareController.createShare(ctx.session.user.id, input)
    ),

  // Get shared chat content (public - no auth required)
  getByToken: publicProcedure
    .input(getSharedChatInputSchema)
    .query(async ({ input }) => chatShareController.getSharedChat(input)),

  // Update share settings (protected)
  update: protectedProcedure
    .input(updateShareInputSchema)
    .mutation(async ({ ctx, input }) =>
      chatShareController.updateShare(ctx.session.user.id, input)
    ),

  // Delete share (protected)
  delete: protectedProcedure
    .input(deleteShareInputSchema)
    .mutation(async ({ ctx, input }) =>
      chatShareController.deleteShare(ctx.session.user.id, input)
    ),

  // Get all shares for user (protected)
  getByUser: protectedProcedure.query(async ({ ctx }) =>
    chatShareController.getSharesByUser(ctx.session.user.id)
  ),

  // Get share statistics for user (protected)
  getStatistics: protectedProcedure.query(async ({ ctx }) =>
    chatShareController.getShareStatistics(ctx.session.user.id)
  ),
});
