"use client";

import { useParams } from "next/navigation";
import ChatInterface from "@/components/layout/chat-interface";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;

  return <ChatInterface chatId={chatId} />;
}
