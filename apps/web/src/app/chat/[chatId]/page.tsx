"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import ChatInterface from "@/components/layout/chat-interface";
import { useUser } from "@/hooks/use-user";
import { apiClient } from "@/utils/api-client";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { user } = useUser();

  const { data: chat, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => apiClient.get(`/api/chats/${chatId}`),
    enabled: !!chatId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!chat) {
    return <div>Chat not found</div>;
  }

  return <ChatInterface initialMessages={chat.messages} user={user} />;
}
