import { protectedProcedure, router } from "../index";
import { MessageController } from "../modules/message/message.controller";
import {
  createMessageInputSchema,
  deleteMessageInputSchema,
  getMessageInputSchema,
  getMessagesByChatInputSchema,
  updateMessageInputSchema,
} from "../modules/message/message.inputs";
import { MessageRepository } from "../modules/message/message.repository";
import { MessageService } from "../modules/message/message.service";

const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService);

export const messageRouter = router({
  // Create a new message
  create: protectedProcedure
    .input(createMessageInputSchema)
    .mutation(async ({ ctx, input }) =>
      messageController.createMessage(ctx.session.user.id, input)
    ),

  // Get all messages for a chat
  getByChat: protectedProcedure
    .input(getMessagesByChatInputSchema)
    .query(async ({ ctx, input }) =>
      messageController.getMessagesByChat(ctx.session.user.id, input)
    ),

  // Get a single message
  getById: protectedProcedure
    .input(getMessageInputSchema)
    .query(async ({ ctx, input }) =>
      messageController.getMessage(ctx.session.user.id, input)
    ),

  // Update a message
  update: protectedProcedure
    .input(
      updateMessageInputSchema.extend({
        messageId: getMessageInputSchema.shape.id,
      })
    )
    .mutation(async ({ ctx, input }) =>
      messageController.updateMessage(
        ctx.session.user.id,
        input.messageId,
        input
      )
    ),

  // Delete a message
  delete: protectedProcedure
    .input(deleteMessageInputSchema)
    .mutation(async ({ ctx, input }) =>
      messageController.deleteMessage(ctx.session.user.id, input)
    ),

  // Get message statistics for a chat
  getStatistics: protectedProcedure
    .input(getMessageInputSchema.shape.id)
    .query(async ({ ctx, input }) =>
      messageController.getMessageStatistics(ctx.session.user.id, input)
    ),
});
