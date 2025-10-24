import { z } from "zod";

/**
 * Context Engine - Input Schemas
 * Zod validation schemas for context operations
 */

export const createContextItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  type: z.enum(["FILE", "URL", "GITHUB_REPO", "DOCUMENT"]),
  content: z.string().min(1, "Content is required"),
  rawContent: z.string().optional(),
  scope: z.enum(["LOCAL", "GLOBAL"]).default("LOCAL"),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional().default([]),
  chatId: z.string().optional(), // Required if scope is LOCAL
});

export const uploadFileSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string(),
  size: z.number().positive(),
  content: z.string(), // Base64 or text content
  chatId: z.string(), // Always LOCAL when uploading
  tags: z.array(z.string()).optional().default([]),
});

export const promoteToGlobalSchema = z.object({
  id: z.string(),
});

export const getContextItemSchema = z.object({
  id: z.string(),
});

export const getContextForChatSchema = z.object({
  chatId: z.string(),
});

export const deleteContextItemSchema = z.object({
  id: z.string(),
});

// Type exports
export type CreateContextItemInput = z.infer<typeof createContextItemSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type PromoteToGlobalInput = z.infer<typeof promoteToGlobalSchema>;
export type GetContextItemInput = z.infer<typeof getContextItemSchema>;
export type GetContextForChatInput = z.infer<typeof getContextForChatSchema>;
export type DeleteContextItemInput = z.infer<typeof deleteContextItemSchema>;
