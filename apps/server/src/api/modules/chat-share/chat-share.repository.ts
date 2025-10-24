import type { ChatShare } from "@prisma/client";
import { BaseRepository } from "../../common/base";
import { DatabaseError } from "../../common/errors";
import type { ChatShareWithChat, SharedChatContent } from "./chat-share.types";

export class ChatShareRepository extends BaseRepository<ChatShareWithChat> {
  async createShare({
    chatId,
    userId,
    expiresAt,
    isPublic,
  }: {
    chatId: string;
    userId: string;
    expiresAt: Date;
    isPublic: boolean;
  }): Promise<ChatShare> {
    try {
      // Generate a unique token
      const token = this.generateShareToken();

      return await this.prisma.chatShare.create({
        data: {
          chatId,
          userId,
          token,
          expiresAt,
          isPublic,
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to create chat share", error);
    }
  }

  async findByToken(token: string): Promise<ChatShareWithChat | null> {
    try {
      const share = await this.prisma.chatShare.findFirst({
        where: { token },
        include: {
          chat: {
            include: {
              messages: {
                orderBy: { createdAt: "asc" },
                include: {
                  attachments: true,
                },
              },
            },
          },
        },
      });

      // Check if share is expired
      if (share && share.expiresAt < new Date()) {
        return null;
      }

      return share;
    } catch (error) {
      throw new DatabaseError("Failed to find chat share", error);
    }
  }

  async findById(id: string, userId: string): Promise<ChatShare | null> {
    try {
      return await this.prisma.chatShare.findFirst({
        where: { id, userId },
      });
    } catch (error) {
      throw new DatabaseError("Failed to find chat share", error);
    }
  }

  async updateExpiration(
    id: string,
    userId: string,
    expiresAt: Date
  ): Promise<ChatShare> {
    try {
      return await this.prisma.chatShare.update({
        where: { id, userId },
        data: { expiresAt },
      });
    } catch (error) {
      throw new DatabaseError("Failed to update share expiration", error);
    }
  }

  async deleteShare(id: string, userId: string): Promise<void> {
    try {
      await this.prisma.chatShare.deleteMany({
        where: { id, userId },
      });
    } catch (error) {
      throw new DatabaseError("Failed to delete chat share", error);
    }
  }

  async incrementViewCount(id: string): Promise<void> {
    try {
      await this.prisma.chatShare.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
          lastViewedAt: new Date(),
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to increment view count", error);
    }
  }

  async getSharesByUser(userId: string): Promise<ChatShare[]> {
    try {
      return await this.prisma.chatShare.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          chat: {
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to get user shares", error);
    }
  }

  async getShareStatistics(userId: string): Promise<{
    totalShares: number;
    activeShares: number;
    expiredShares: number;
    totalViews: number;
  }> {
    try {
      const shares = await this.prisma.chatShare.findMany({
        where: { userId },
        select: {
          expiresAt: true,
          viewCount: true,
        },
      });

      const now = new Date();
      const stats = {
        totalShares: shares.length,
        activeShares: shares.filter((share) => share.expiresAt > now).length,
        expiredShares: shares.filter((share) => share.expiresAt <= now).length,
        totalViews: shares.reduce((sum, share) => sum + share.viewCount, 0),
      };

      return stats;
    } catch (error) {
      throw new DatabaseError("Failed to get share statistics", error);
    }
  }

  private generateShareToken(): string {
    // Generate a random 12-character alphanumeric token
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 12; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  async getSharedChatContent(token: string): Promise<SharedChatContent | null> {
    try {
      const share = await this.findByToken(token);

      if (!share) {
        return null;
      }

      // Format the shared content
      return {
        id: share.chat.id,
        title: share.chat.title,
        createdAt: share.chat.createdAt,
        messages: share.chat.messages.map((message) => ({
          id: message.id,
          content: message.content,
          role: message.role,
          createdAt: message.createdAt,
          attachments: message.attachments.map((att) => ({
            id: att.id,
            kind: att.kind,
            filename: att.filename,
            mimeType: att.mimeType,
            size: att.size,
          })),
        })),
      };
    } catch (error) {
      throw new DatabaseError("Failed to get shared chat content", error);
    }
  }
}
