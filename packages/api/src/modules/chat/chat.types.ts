import type {
  AIProvider,
  Attachment,
  AttachmentKind,
  Chat,
  Message,
} from "@prisma/client";
import type { ModelConfig } from "../../common/constants/models.constants";

export type ChatMessageWithAttachments = Message & {
  attachments: Attachment[];
};

export type ChatWithMessages = Chat & {
  messages: ChatMessageWithAttachments[];
};

export type ChatListItem = Chat & {
  lastMessage?: ChatMessageWithAttachments | null;
  messageCount: number;
};

export type AttachmentMetadata = {
  id: string;
  kind: AttachmentKind;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url?: string;
  transcription?: string | null;
  metadata?: Record<string, unknown>;
};

export type ModelDescriptor = ModelConfig & {
  supportsWebSearch: boolean;
};

export type CreateChatResult = {
  id: string;
  chatId: string;
  messageId: string;
  provider: AIProvider;
  modelId: string;
  useWebSearch: boolean;
  attachments: AttachmentMetadata[];
};

export type ChatListResult = {
  chats: ChatListItem[];
  nextCursor?: string;
};

export type EnhancePromptResult = {
  enhancedText: string;
  modelId: string;
  provider: AIProvider;
  useWebSearchApplied: boolean;
  suggestions?: string[];
};
