import type { Attachment, Message, Prisma } from "@prisma/client";

export type MessageWithAttachments = Message & {
  attachments: Attachment[];
};

export type MessageListItem = MessageWithAttachments & {
  chatId: string;
  chatTitle: string;
};

export type MessageListResult = {
  messages: MessageListItem[];
  nextCursor?: string;
};

export type CreateMessageData = {
  content: string;
  role: "user" | "assistant" | "system";
  chatId: string;
  parentMessageId?: string;
  metadata?: Prisma.InputJsonValue;
};

export type UpdateMessageData = Partial<CreateMessageData>;

export type CreateMessageResult = {
  id: string;
  messageId: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: Date;
  tokenCount?: number;
  attachments: {
    id: string;
    kind: string;
    filename: string;
    mimeType: string;
    size: number;
    storageKey: string;
  }[];
};

export type MessageStatistics = {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  systemMessages: number;
  totalTokens: number;
  averageTokensPerMessage: number;
};
