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

type ChatsResponse = {
  data: Chat[];
  cursor: string | null;
  hasMore: boolean;
};

export function useChats(limit = 20) {
  return useQuery<ChatsResponse>({
    queryKey: ["chats", limit],
    queryFn: async () =>
      apiClient.get<ChatsResponse>(`/api/chats?limit=${limit}`),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
