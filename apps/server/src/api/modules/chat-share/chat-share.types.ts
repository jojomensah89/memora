import type { Attachment, Chat, ChatShare, Message } from "@prisma/client";

export type ChatShareWithChat = ChatShare & {
  chat: Chat & {
    messages: (Message & {
      attachments: Attachment[];
    })[];
  };
};

export type CreateShareResult = {
  shareId: string;
  shareToken: string;
  expiresAt: Date;
  shareUrl: string;
};

export type SharedChatContent = {
  id: string;
  title: string;
  createdAt: Date;
  messages: {
    id: string;
    content: string;
    role: "user" | "assistant" | "system";
    createdAt: Date;
    attachments: {
      id: string;
      kind: string;
      filename: string;
      mimeType: string;
      size: number;
    }[];
  }[];
};

export type ShareStatistics = {
  totalShares: number;
  activeShares: number;
  expiredShares: number;
  totalViews: number;
};
