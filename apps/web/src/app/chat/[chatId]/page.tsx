"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import ChatInterface from "@/components/layout/chat-interface";
import { useUIStore } from "@/stores/use-ui-store";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { setActiveChatId } = useUIStore();

  useEffect(() => {
    setActiveChatId(chatId);
    return () => {
      setActiveChatId(null);
    };
  }, [chatId, setActiveChatId]);

  return <ChatInterface chatId={chatId} />;
}
