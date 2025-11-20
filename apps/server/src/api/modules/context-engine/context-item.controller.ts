import { handleError } from "../../common/errors";
import type {
  GetContextForChatInput,
  GetContextItemInput,
  PromoteToGlobalInput,
  UploadFileInput,
} from "./context-item.inputs";
import {
  createContextFromGitHub,
  createContextFromUrl,
  createDocumentContext,
  deleteContext,
  getChatContextItems,
  getContextItem,
  getContextItems,
  linkContext,
  promoteContextToGlobal,
  unlinkContext,
  updateContext,
  uploadFileContext,
} from "./context-item.service";

/**
 * Get all context items for current user
 */
export async function getAllContextItems(userId: string) {
  try {
    return await getContextItems(userId);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get context items for specific chat
 */
export async function getContextForChat(
  userId: string,
  input: GetContextForChatInput
) {
  try {
    return await getChatContextItems(input.chatId, userId);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get single context item by ID
 */
export async function getContextById(
  userId: string,
  input: GetContextItemInput
) {
  try {
    return await getContextItem(input.id, userId);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Upload file and create LOCAL context
 */
export async function uploadFile(userId: string, input: UploadFileInput) {
  try {
    return await uploadFileContext(userId, input);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Promote LOCAL context to GLOBAL
 */
export async function promoteToGlobal(
  userId: string,
  input: PromoteToGlobalInput
) {
  try {
    return await promoteContextToGlobal(input.id, userId);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Create context from URL
 */
export async function createFromUrl(userId: string, input: any) {
  try {
    return await createContextFromUrl(userId, input);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Create context from GitHub repository
 */
export async function createFromGitHub(userId: string, input: any) {
  try {
    return await createContextFromGitHub(userId, input);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Create context from document
 */
export async function createDocument(userId: string, input: any) {
  try {
    return await createDocumentContext(userId, input);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Update existing context item
 */
export async function update(userId: string, id: string, input: any) {
  try {
    return await updateContext(userId, id, input);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Delete context item
 */
export async function deleteItem(userId: string, id: string) {
  try {
    await deleteContext(userId, id);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}

/**
 * Link context item to chat
 */
export async function linkToChat(
  userId: string,
  contextId: string,
  chatId: string
) {
  try {
    await linkContext(userId, contextId, chatId);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}

/**
 * Unlink context item from chat
 */
export async function unlinkFromChat(
  userId: string,
  contextId: string,
  chatId: string
) {
  try {
    await unlinkContext(userId, contextId, chatId);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}
