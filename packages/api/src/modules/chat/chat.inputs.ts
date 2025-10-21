import { z } from "zod";

export const attachmentKindSchema = z.enum(["image", "document"]);

export const attachmentInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  kind: attachmentKindSchema,
  uploadId: z.string().min(1).optional(),
  transcription: z.string().min(1).optional(),
});

export const createChatInputSchema = z.object({
  initialMessage: z.string().trim().min(1).optional().default(""),
  modelId: z.string().min(1),
  useWebSearch: z.boolean().default(false),
  attachments: z.array(attachmentInputSchema).default([]),
});

export const enhancePromptInputSchema = z.object({
  text: z.string().trim().min(1),
  modelId: z.string().min(1),
  useWebSearch: z.boolean().default(false),
  contextChatId: z.string().optional(),
});

export type AttachmentInput = z.infer<typeof attachmentInputSchema>;
export type CreateChatInput = z.infer<typeof createChatInputSchema>;
export type EnhancePromptInput = z.infer<typeof enhancePromptInputSchema>;
