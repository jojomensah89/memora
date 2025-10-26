import { z } from "zod";
import { CHAT_LIMITS, PAGINATION_LIMITS } from "../../common/constants";
import { attachmentInputSchema } from "../attachment/attachment.inputs";

export const createMessageInputSchema = z.object({
  content: z.string().trim().min(1).max(CHAT_LIMITS.MAX_MESSAGE_LENGTH),
  role: z.enum(["user", "assistant", "system"]).default("user"),
  chatId: z.string().min(1),
  parentMessageId: z.string().optional(),
  attachments: z.array(attachmentInputSchema).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateMessageInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1)
    .max(CHAT_LIMITS.MAX_MESSAGE_LENGTH)
    .optional(),
  parentMessageId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const getMessageInputSchema = z.object({
  id: z.string().min(1),
});

export const getMessagesByChatInputSchema = z.object({
  chatId: z.string().min(1),
  limit: z
    .number()
    .int()
    .min(PAGINATION_LIMITS.MIN_LIMIT)
    .max(PAGINATION_LIMITS.MAX_LIMIT)
    .optional()
    .default(PAGINATION_LIMITS.DEFAULT_LIMIT),
  cursor: z.string().optional(),
});

export const deleteMessageInputSchema = z.object({
  id: z.string().min(1),
});

export type { AttachmentInput } from "../attachment/attachment.inputs";
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
export type GetMessageInput = z.infer<typeof getMessageInputSchema>;
export type GetMessagesByChatInput = z.infer<
  typeof getMessagesByChatInputSchema
>;
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;
