import { z } from "zod";
import { CHAT_LIMITS, PAGINATION_LIMITS } from "../../common/constants";
import { attachmentInputSchema } from "../attachment/attachment.inputs";

export const createChatInputSchema = z.object({
  initialMessage: z
    .string()
    .trim()
    .max(CHAT_LIMITS.MAX_MESSAGE_LENGTH)
    .optional()
    .default(""),
  modelId: z.string().min(1),
  useWebSearch: z.boolean().default(false),
  parentId: z.string().optional(),
  forkedFromMessageId: z.string().optional(),
  attachments: z.array(attachmentInputSchema).default([]),
});

export const forkChatInputSchema = z.object({
  originalChatId: z.string().min(1),
  title: z.string().min(1).max(CHAT_LIMITS.MAX_TITLE_LENGTH).optional(),
  forkedFromMessageId: z.string().min(1),
});

export const listChatsInputSchema = z.object({
  includeArchived: z.boolean().optional().default(false),
  limit: z
    .number()
    .int()
    .min(PAGINATION_LIMITS.MIN_LIMIT)
    .max(PAGINATION_LIMITS.MAX_LIMIT)
    .optional()
    .default(PAGINATION_LIMITS.DEFAULT_LIMIT),
  cursor: z.string().optional(),
});

export const getChatInputSchema = z.object({
  id: z.string().min(1),
});

export const enhancePromptInputSchema = z.object({
  text: z.string().trim().min(1),
  modelId: z.string().min(1),
  useWebSearch: z.boolean().default(false),
  contextChatId: z.string().optional(),
});

export type { AttachmentInput } from "../attachment/attachment.inputs";
export type CreateChatInput = z.infer<typeof createChatInputSchema>;
export type ForkChatInput = z.infer<typeof forkChatInputSchema>;
export type ListChatsInput = z.infer<typeof listChatsInputSchema>;
export type GetChatInput = z.infer<typeof getChatInputSchema>;
export type EnhancePromptInput = z.infer<typeof enhancePromptInputSchema>;
