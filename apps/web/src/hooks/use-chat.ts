import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/utils/api-client";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: string;
  updatedAt: string;
  metadata?: any;
  attachments?: any[];
};

type Chat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  provider: string;
  isPinned: boolean;
  isArchived: boolean;
  messages: Message[];
};

export function useChat(chatId: string | undefined) {
  return useQuery<Chat>({
    queryKey: ["chat", chatId],
    queryFn: async () => apiClient.get<Chat>(`/api/chats/${chatId}`),
    enabled: !!chatId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
