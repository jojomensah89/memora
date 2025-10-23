"use client";

import { useParams } from "next/navigation";
import ChatWelcome from "@/components/chat/chat-welcome";
import { useUser } from "@/hooks/use-user";
import { trpc } from "@/utils/trpc";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { user } = useUser();

  const { data: chat, isLoading } = trpc.chat.getChat.useQuery({
    id: chatId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!chat) {
    return <div>Chat not found</div>;
  }

  return <ChatWelcome initialMessages={chat.messages} user={user} />;
}
