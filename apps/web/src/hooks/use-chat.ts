import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/utils/api-client";

type Chat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  provider: string;
  isPinned: boolean;
  isArchived: boolean;
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
