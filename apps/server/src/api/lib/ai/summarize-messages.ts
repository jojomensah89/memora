import {
  convertToModelMessages,
  generateId,
  generateText,
  pruneMessages,
  type UIMessage,
} from "ai";

export const summarizeMessages = async (
  messages: UIMessage[]
): Promise<string> => {
  // Placeholder implementation for summarization
  // In a real scenario, this would call an AI service to summarize the messages
  const message: UIMessage[] = [];
  const summary = await generateText({
    model: "google/gemini-2.0-flash-exp",
    prompt: "Your task is to summarize the conversation",
    messages: convertToModelMessages(messages),
  });

  message.push({
    id: generateId(),
    role: "system",
    parts: [
      {
        type: "text",
        text: summary.text,
      },
    ],
  });

  const prunedMessages = pruneMessages({
    messages: convertToModelMessages(message),
    emptyMessages: "remove",
    reasoning: "before-last-message",
    toolCalls: "before-last-5-messages",
  });

  const _summarizer = await generateText({
    model: "google/gemini-2.0-flash-exp",
    messages: prunedMessages,
    prepareStep: (_step) => ({
      activeTools: [],
      model: "google/gemini-2.0-flash-exp",
    }),
  });
  return `Summary of messages: ${messages.slice(0, 3).join(", ")}...`;
};
