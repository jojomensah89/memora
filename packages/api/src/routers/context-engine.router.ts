import { protectedProcedure, router } from "../index";
import { z } from "zod";
import { ContextItemController } from "../modules/context-engine/context-item.controller";
import { createDocumentInputSchema } from "../modules/context-engine/context-item.inputs";
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

  /**
   * Create context from URL
   */
  createFromUrl: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(1000).optional(),
      url: z.string().url(),
      chatId: z.string().min(1).optional(),
    }))
    .mutation(async ({ ctx, input }) =>
      contextController.createFromUrl(ctx.session.user.id, input)
    ),

  /**
   * Create context from GitHub repository
   */
  createFromGitHub: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(1000).optional(),
      repoUrl: z.string().url(),
      branch: z.string().optional(),
      filePaths: z.array(z.string()).optional(),
      chatId: z.string().min(1).optional(),
    }))
    .mutation(async ({ ctx, input }) =>
      contextController.createFromGitHub(ctx.session.user.id, input)
    ),

  /**
   * Create context from document
   */
  createDocument: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(1000).optional(),
      content: z.string().min(1),
      chatId: z.string().min(1).optional(),
    }))
    .mutation(async ({ ctx, input }) =>
      contextController.createDocument(ctx.session.user.id, input)
    ),

  /**
   * Update existing context item
   */
  update: protectedProcedure
    .input(getContextItemSchema.extend({ data: createDocumentInputSchema.partial() }))
    .mutation(async ({ ctx, input }) =>
      contextController.update(ctx.session.user.id, input.id, input.data)
    ),

  /**
   * Delete context item
   */
  delete: protectedProcedure
    .input(getContextItemSchema)
    .mutation(async ({ ctx, input }) =>
      contextController.delete(ctx.session.user.id, input.id)
    ),

  /**
   * Link context item to chat
   */
  linkToChat: protectedProcedure
    .input(z.object({
      contextId: z.string().min(1),
      chatId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) =>
      contextController.linkToChat(ctx.session.user.id, input.contextId, input.chatId)
    ),

  /**
   * Unlink context item from chat
   */
  unlinkFromChat: protectedProcedure
    .input(z.object({
      contextId: z.string().min(1),
      chatId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) =>
      contextController.unlinkFromChat(ctx.session.user.id, input.contextId, input.chatId)
    ),
});
