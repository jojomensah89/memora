import { handleError } from "../../common/errors";
import type {
  GetContextForChatInput,
  GetContextItemInput,
  PromoteToGlobalInput,
  UploadFileInput,
} from "./context-item.inputs";
import type { ContextItemService } from "./context-item.service";

/**
 * Context Item Controller
 * Handles requests and orchestrates service calls
 * All errors are caught and handled here
 */
export class ContextItemController {
  constructor(private readonly service: ContextItemService) {}

  /**
   * Get all context items for current user
   */
  async getAll(userId: string) {
    try {
      return await this.service.getAll(userId);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get context items for specific chat
   */
  async getForChat(userId: string, input: GetContextForChatInput) {
    try {
      return await this.service.getForChat(input.chatId, userId);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get single context item by ID
   */
  async getById(userId: string, input: GetContextItemInput) {
    try {
      return await this.service.getById(input.id, userId);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Upload file and create LOCAL context
   */
  async uploadFile(userId: string, input: UploadFileInput) {
    try {
      return await this.service.uploadFile(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Promote LOCAL context to GLOBAL
   */
  async promoteToGlobal(userId: string, input: PromoteToGlobalInput) {
    try {
      return await this.service.promoteToGlobal(input.id, userId);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Create context from URL
   */
  async createFromUrl(userId: string, input: any) {
    try {
      return await this.service.createFromUrl(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Create context from GitHub repository
   */
  async createFromGitHub(userId: string, input: any) {
    try {
      return await this.service.createFromGitHub(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Create context from document
   */
  async createDocument(userId: string, input: any) {
    try {
      return await this.service.createDocument(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Update existing context item
   */
  async update(userId: string, id: string, input: any) {
    try {
      return await this.service.update(userId, id, input);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Delete context item
   */
  async delete(userId: string, id: string) {
    try {
      await this.service.delete(userId, id);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Link context item to chat
   */
  async linkToChat(userId: string, contextId: string, chatId: string) {
    try {
      await this.service.linkToChat(userId, contextId, chatId);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Unlink context item from chat
   */
  async unlinkFromChat(userId: string, contextId: string, chatId: string) {
    try {
      await this.service.unlinkFromChat(userId, contextId, chatId);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }
}
