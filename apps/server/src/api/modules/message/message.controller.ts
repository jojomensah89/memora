import { handleError } from "../../common/errors";
import type {
  CreateMessageInput,
  DeleteMessageInput,
  GetMessageInput,
  GetMessagesByChatInput,
  UpdateMessageInput,
} from "./message.inputs";
import {
  createMessage as createMessageService,
  deleteMessage as deleteMessageService,
  getMessageById as getMessageByIdService,
  getMessageStatistics as getMessageStatisticsService,
  getMessagesByChat as getMessagesByChatService,
  updateMessage as updateMessageService,
} from "./message.service";

export async function createMessage(userId: string, input: CreateMessageInput) {
  try {
    return await createMessageService(userId, input);
  } catch (error) {
    handleError(error);
  }
}

export async function getMessagesByChat(
  userId: string,
  input: GetMessagesByChatInput
) {
  try {
    return await getMessagesByChatService(userId, input);
  } catch (error) {
    handleError(error);
  }
}

export async function getMessage(userId: string, input: GetMessageInput) {
  try {
    return await getMessageByIdService(userId, input.id);
  } catch (error) {
    handleError(error);
  }
}

export async function updateMessage(
  userId: string,
  messageId: string,
  input: UpdateMessageInput
) {
  try {
    await updateMessageService(userId, messageId, input);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}

export async function deleteMessage(userId: string, input: DeleteMessageInput) {
  try {
    await deleteMessageService(userId, input.id);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}

export async function getMessageStatistics(userId: string, chatId: string) {
  try {
    return await getMessageStatisticsService(userId, chatId);
  } catch (error) {
    handleError(error);
  }
}
