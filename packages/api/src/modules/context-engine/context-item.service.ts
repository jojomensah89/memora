import { BaseService } from "../../common/base";
import { CONTEXT_LIMITS } from "../../common/constants";
import {
  ContextNotFoundError,
  PayloadTooLargeError,
  ValidationError,
} from "../../common/errors";
import {
  estimateTokens,
  validateFilename,
  validateFileSize,
  validateMimeType,
} from "../../common/utils";
import type {
  CreateContextItemInput,
  UploadFileInput,
} from "./context-item.inputs";
import type { ContextItemRepository } from "./context-item.repository";
import type {
  ContextItemWithTags,
  ContextListResult,
} from "./context-item.types";

/**
 * Context Item Service
 * Contains business logic for context management
 */
export class ContextItemService extends BaseService {
  constructor(private repository: ContextItemRepository) {
    super();
  }

  /**
   * Get all context items for user
   */
  async getAll(userId: string): Promise<ContextListResult> {
    const [items, stats] = await Promise.all([
      this.repository.findAllByUser(userId),
      this.repository.getStats(userId),
    ]);

    return { items, stats };
  }

  /**
   * Get context items applicable to a chat (GLOBAL + LOCAL)
   */
  async getForChat(
    chatId: string,
    userId: string
  ): Promise<ContextItemWithTags[]> {
    this.validateRequired(chatId, "Chat ID");
    return this.repository.findForChat(chatId, userId);
  }

  /**
   * Get single context item by ID
   */
  async getById(id: string, userId: string): Promise<ContextItemWithTags> {
    this.validateRequired(id, "Context item ID");

    const item = await this.repository.findById(id, userId);

    if (!item) {
      throw new ContextNotFoundError("Context item not found");
    }

    return item;
  }

  /**
   * Upload file and create LOCAL context item
   */
  async uploadFile(
    userId: string,
    input: UploadFileInput
  ): Promise<ContextItemWithTags> {
    // Validate file
    validateFilename(input.filename);
    validateFileSize(input.size);
    validateMimeType(input.mimeType);

    // Check content size
    if (input.content.length > CONTEXT_LIMITS.MAX_CONTEXT_SIZE) {
      throw new PayloadTooLargeError("File content exceeds maximum size");
    }

    // Estimate tokens
    const tokens = estimateTokens(input.content);

    if (tokens > CONTEXT_LIMITS.MAX_TOKEN_COUNT) {
      throw new ValidationError(
        `File contains too many tokens (${tokens}). Maximum: ${CONTEXT_LIMITS.MAX_TOKEN_COUNT}`
      );
    }

    // Create context item as LOCAL
    const contextItem: CreateContextItemInput = {
      name: input.filename,
      type: "FILE",
      content: input.content,
      scope: "LOCAL", // Files uploaded in chat are always LOCAL
      metadata: {
        mimeType: input.mimeType,
        size: input.size,
        uploadedAt: new Date().toISOString(),
      },
      tags: input.tags,
      chatId: input.chatId,
    };

    return this.repository.create(userId, contextItem);
  }

  /**
   * Promote context item from LOCAL to GLOBAL
   */
  async promoteToGlobal(
    id: string,
    userId: string
  ): Promise<ContextItemWithTags> {
    // Check if exists and belongs to user
    const item = await this.getById(id, userId);

    if (item.scope === "GLOBAL") {
      throw new ValidationError("Context item is already global");
    }

    return this.repository.promoteToGlobal(id, userId);
  }

  // TODO: Implement later
  // - create() - for URL, GitHub, Document
  // - update()
  // - delete()
  // - processFile() - extract text from PDF, etc.
}
