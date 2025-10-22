import { protectedProcedure, router } from "../index";
import { ContextItemController } from "../modules/context-engine/context-item.controller";
import {
  getContextForChatSchema,
  getContextItemSchema,
  promoteToGlobalSchema,
  uploadFileSchema,
} from "../modules/context-engine/context-item.inputs";
import { ContextItemRepository } from "../modules/context-engine/context-item.repository";
import { ContextItemService } from "../modules/context-engine/context-item.service";

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
  getAll: protectedProcedure.query(async ({ ctx }) =>
    contextController.getAll(ctx.session.user.id)
  ),

  /**
   * Get context items for specific chat (GLOBAL + LOCAL)
   */
  getForChat: protectedProcedure
    .input(getContextForChatSchema)
    .query(async ({ ctx, input }) =>
      contextController.getForChat(ctx.session.user.id, input)
    ),

  /**
   * Get single context item by ID
   */
  getById: protectedProcedure
    .input(getContextItemSchema)
    .query(async ({ ctx, input }) =>
      contextController.getById(ctx.session.user.id, input)
    ),

  /**
   * Upload file and create LOCAL context
   */
  uploadFile: protectedProcedure
    .input(uploadFileSchema)
    .mutation(async ({ ctx, input }) =>
      contextController.uploadFile(ctx.session.user.id, input)
    ),

  /**
   * Promote LOCAL context to GLOBAL
   */
  promoteToGlobal: protectedProcedure
    .input(promoteToGlobalSchema)
    .mutation(async ({ ctx, input }) =>
      contextController.promoteToGlobal(ctx.session.user.id, input)
    ),

  // TODO: Add later
  // createFromUrl: protectedProcedure.input(createFromUrlSchema).mutation(...),
  // createFromGitHub: protectedProcedure.input(createFromGitHubSchema).mutation(...),
  // update: protectedProcedure.input(updateContextItemSchema).mutation(...),
  // delete: protectedProcedure.input(deleteContextItemSchema).mutation(...),
});
