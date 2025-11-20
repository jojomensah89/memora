import type { UIMessage } from "ai";
import { handleError } from "../../common/errors";
import type {
  CreateChatInput,
  EnhancePromptInput,
  ForkChatInput,
  GetChatInput,
  ListChatsInput,
} from "./chat.inputs";
import * as ChatService from "./chat.service";

export async function createChat(userId: string, input: CreateChatInput) {
  try {
    return await ChatService.createChat(userId, input);
  } catch (error) {
    handleError(error);
  }
}

export async function listChats(userId: string, input: ListChatsInput) {
  try {
    return await ChatService.listUserChats(userId, input);
  } catch (error) {
    handleError(error);
  }
}

export async function getChat(userId: string, input: GetChatInput) {
  try {
    return await ChatService.getChatById(input.id, userId);
  } catch (error) {
    handleError(error);
  }
}

export function getModels() {
  try {
    return ChatService.getAvailableModels();
  } catch (error) {
    handleError(error);
  }
}

export async function enhancePrompt(userId: string, input: EnhancePromptInput) {
  try {
    return await ChatService.enhancePrompt(userId, input);
  } catch (error) {
    handleError(error);
  }
}

export async function forkChat(userId: string, input: ForkChatInput) {
  try {
    return await ChatService.forkChat(userId, input);
  } catch (error) {
    handleError(error);
  }
}

export async function generateAIResponse(userId: string, chatId: string, message: string) {
  try {
    return await ChatService.generateAIResponse(userId, chatId, message);
  } catch (error) {
    handleError(error);
  }
}

export async function updateChatMessages(
  userId: string,
  chatId: string,
  messages: UIMessage[]
) {
  try {
    return await ChatService.saveChatMessages(userId, chatId, messages);
  } catch (error) {
    handleError(error);
  }
}

export async function updateChat(
  userId: string,
  input: { id: string; title?: string; modelId?: string }
) {
  try {
    return await ChatService.updateChat(userId, input);
  } catch (error) {
    handleError(error);
  }
}

export async function deleteChat(userId: string, chatId: string) {
  try {
    return await ChatService.deleteChat(userId, chatId);
  } catch (error) {
    handleError(error);
  }
}
