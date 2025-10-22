"use client";

import { Leva } from "leva";
import ChatWelcome from "@/components/chat/chat-welcome";

export default function NewChatPage() {
  return (
    <>
      <ChatWelcome />
      <Leva hidden />
    </>
  );
}
