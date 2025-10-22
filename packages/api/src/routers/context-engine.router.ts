import { router, protectedProcedure } from "../index";
import { ContextItemRepository } from "../modules/context-engine/context-item.repository";
import { ContextItemService } from "../modules/context-engine/context-item.service";
import { ContextItemController } from "../modules/context-engine/context-item.controller";
import {
  getContextItemSchema,
  getContextForChatSchema,
  uploadFileSchema,
  promoteToGlobalSchema,
} from "../modules/context-engine/context-item.inputs";

/**
 * Context Engine Router
 * tRPC endpoints for context management
 */

// Initialize dependencies
const contextRepository = new ContextItemRepository();
const contextService = new ContextItemService(contextRepository);
const contextController = new ContextItemController(contextService);

export const contextEngineRouter = router({
  /**
   * Get all context items for current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return contextController.getAll(ctx.session.user.id);
  }),

  /**
   * Get context items for specific chat (GLOBAL + LOCAL)
   */
  getForChat: protectedProcedure
    .input(getContextForChatSchema)
    .query(async ({ ctx, input }) => {
      return contextController.getForChat(ctx.session.user.id, input);
    }),

  /**
   * Get single context item by ID
   */
  getById: protectedProcedure
    .input(getContextItemSchema)
    .query(async ({ ctx, input }) => {
      return contextController.getById(ctx.session.user.id, input);
    }),

  /**
   * Upload file and create LOCAL context
   */
  uploadFile: protectedProcedure
    .input(uploadFileSchema)
    .mutation(async ({ ctx, input }) => {
      return contextController.uploadFile(ctx.session.user.id, input);
    }),

  /**
   * Promote LOCAL context to GLOBAL
   */
  promoteToGlobal: protectedProcedure
    .input(promoteToGlobalSchema)
    .mutation(async ({ ctx, input }) => {
      return contextController.promoteToGlobal(ctx.session.user.id, input);
    }),

  // TODO: Add later
  // createFromUrl: protectedProcedure.input(createFromUrlSchema).mutation(...),
  // createFromGitHub: protectedProcedure.input(createFromGitHubSchema).mutation(...),
  // update: protectedProcedure.input(updateContextItemSchema).mutation(...),
  // delete: protectedProcedure.input(deleteContextItemSchema).mutation(...),
});
