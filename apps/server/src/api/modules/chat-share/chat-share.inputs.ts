import { z } from "zod";

export const createShareInputSchema = z.object({
  chatId: z.string().min(1),
  expiresAt: z.string().datetime().optional(),
  isPublic: z.boolean().default(true),
});

export const updateShareInputSchema = z.object({
  id: z.string().min(1),
  expiresAt: z.string().datetime().optional(),
  isPublic: z.boolean().optional(),
});

export const getShareInputSchema = z.object({
  id: z.string().min(1),
});

export const deleteShareInputSchema = z.object({
  id: z.string().min(1),
});

export const getSharedChatInputSchema = z.object({
  token: z.string().min(12).max(12),
});

export type CreateShareInput = z.infer<typeof createShareInputSchema>;
export type UpdateShareInput = z.infer<typeof updateShareInputSchema>;
export type GetShareInput = z.infer<typeof getShareInputSchema>;
export type DeleteShareInput = z.infer<typeof deleteShareInputSchema>;
export type GetSharedChatInput = z.infer<typeof getSharedChatInputSchema>;
