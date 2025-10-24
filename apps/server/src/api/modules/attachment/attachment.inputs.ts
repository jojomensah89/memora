import { z } from "zod";
import { FILE_LIMITS } from "../../common/constants";

export const attachmentKindSchema = z.enum(["image", "document"]);

export const attachmentInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(FILE_LIMITS.MAX_FILENAME_LENGTH),
  mimeType: z.string().min(1),
  size: z.number().int().positive().max(FILE_LIMITS.MAX_FILE_SIZE),
  kind: attachmentKindSchema,
  uploadId: z.string().min(1).optional(),
  storageKey: z.string().min(1).optional(),
  transcription: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AttachmentInput = z.infer<typeof attachmentInputSchema>;
