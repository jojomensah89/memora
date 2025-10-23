import { handleError } from "../../common/errors";
import type {
  CreateShareInput,
  DeleteShareInput,
  GetSharedChatInput,
  UpdateShareInput,
} from "./chat-share.inputs";
import type { ChatShareService } from "./chat-share.service";

export class ChatShareController {
  constructor(private service: ChatShareService) {}

  async createShare(userId: string, input: CreateShareInput) {
    try {
      return await this.service.createShare(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async getSharedChat(input: GetSharedChatInput) {
    try {
      return await this.service.getSharedChat(input.token);
    } catch (error) {
      handleError(error);
    }
  }

  async updateShare(userId: string, input: UpdateShareInput) {
    try {
      return await this.service.updateShare(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async deleteShare(userId: string, input: DeleteShareInput) {
    try {
      await this.service.deleteShare(userId, input);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }

  async getSharesByUser(userId: string) {
    try {
      return await this.service.getSharesByUser(userId);
    } catch (error) {
      handleError(error);
    }
  }

  async getShareStatistics(userId: string) {
    try {
      return await this.service.getShareStatistics(userId);
    } catch (error) {
      handleError(error);
    }
  }
}
