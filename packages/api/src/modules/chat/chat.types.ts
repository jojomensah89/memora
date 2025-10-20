import type { AttachmentKind } from "@prisma/client";

export type AttachmentMetadata = {
  id: string;
  kind: AttachmentKind;
  filename: string;
  mimeType: string;
  size: number;
  url?: string;
  transcription?: string | null;
};

export type ModelDescriptor = {
  id: string;
  name: string;
  provider: string;
  supportsWebSearch: boolean;
};

export type CreateChatResult = {
  chatId: string;
  messageId: string;
  modelId: string;
  useWebSearch: boolean;
  attachments: AttachmentMetadata[];
};

export type EnhancePromptResult = {
  enhancedText: string;
  modelId: string;
  useWebSearchApplied: boolean;
  suggestions?: string[];
};
