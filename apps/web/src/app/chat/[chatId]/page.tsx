'use client';

import { trpc } from '@/utils/trpc';
import { useParams } from 'next/navigation';
import ChatWelcome from '@/components/chat/chat-welcome';
import { useUser } from '@/hooks/use-user';

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

  return <ChatWelcome user={user} initialMessages={chat.messages} />;
}