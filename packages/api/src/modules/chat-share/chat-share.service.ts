import { BaseService } from "../../common/base";
import { ChatNotFoundError, ValidationError } from "../../common/errors";
import type {
  CreateShareInput,
  DeleteShareInput,
  UpdateShareInput,
} from "./chat-share.inputs";
import type { ChatShareRepository } from "./chat-share.repository";
import type { CreateShareResult, SharedChatContent } from "./chat-share.types";

export class ChatShareService extends BaseService {
  constructor(
    private repository: ChatShareRepository,
    private baseUrl = "https://memora.ai/shared"
  ) {
    super();
  }

  async createShare(
    userId: string,
    input: CreateShareInput
  ): Promise<CreateShareResult> {
    const { chatId, expiresAt, isPublic } = input;

    // Validate chat ownership
    await this.validateChatOwnership(chatId, userId);

    // Set default expiration (7 days) if not provided
    const expirationDate = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Validate expiration date
    if (expirationDate <= new Date()) {
      throw new ValidationError("Expiration date must be in the future");
    }

    // Don't allow expiration more than 30 days in the future
    const maxExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    if (expirationDate > maxExpiration) {
      throw new ValidationError(
        "Expiration date cannot be more than 30 days in the future"
      );
    }

    const share = await this.repository.createShare({
      chatId,
      userId,
      expiresAt: expirationDate,
      isPublic,
    });

    return {
      shareId: share.id,
      shareToken: share.token,
      expiresAt: share.expiresAt,
      shareUrl: `${this.baseUrl}/${share.token}`,
    };
  }

  async getSharedChat(token: string): Promise<SharedChatContent> {
    const content = await this.repository.getSharedChatContent(token);

    if (!content) {
      throw new ValidationError("Shared chat not found or expired");
    }

    // Increment view count
    const share = await this.repository.findByToken(token);
    if (share) {
      await this.repository.incrementViewCount(share.id);
    }

    return content;
  }

  async updateShare(userId: string, input: UpdateShareInput) {
    const { id, expiresAt, isPublic } = input;

    // Validate share ownership
    const share = await this.repository.findById(id, userId);
    if (!share) {
      throw new ValidationError("Share not found or access denied");
    }

    const updateData: any = {};

    if (expiresAt !== undefined) {
      const expirationDate = new Date(expiresAt);

      if (expirationDate <= new Date()) {
        throw new ValidationError("Expiration date must be in the future");
      }

      // Don't allow expiration more than 30 days in the future
      const maxExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      if (expirationDate > maxExpiration) {
        throw new ValidationError(
          "Expiration date cannot be more than 30 days in the future"
        );
      }

      updateData.expiresAt = expirationDate;
    }

    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }

    return await this.repository.updateExpiration(
      id,
      userId,
      updateData.expiresAt || share.expiresAt
    );
  }

  async deleteShare(userId: string, input: DeleteShareInput): Promise<void> {
    const { id } = input;

    // Validate share ownership
    const share = await this.repository.findById(id, userId);
    if (!share) {
      throw new ValidationError("Share not found or access denied");
    }

    await this.repository.deleteShare(id, userId);
  }

  async getSharesByUser(userId: string) {
    return await this.repository.getSharesByUser(userId);
  }

  async getShareStatistics(userId: string) {
    return await this.repository.getShareStatistics(userId);
  }

  private async validateChatOwnership(
    chatId: string,
    userId: string
  ): Promise<void> {
    try {
      const chat = await this.prisma.chat.findFirst({
        where: { id: chatId, userId },
      });

      if (!chat) {
        throw new ChatNotFoundError("Chat not found or access denied");
      }
    } catch (error) {
      if (error instanceof ChatNotFoundError) {
        throw error;
      }
      throw new ValidationError("Failed to validate chat ownership");
    }
  }
}
