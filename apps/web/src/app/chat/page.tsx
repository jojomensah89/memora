"use client";

import ChatWelcome from "@/components/chat/chat-welcome";
import { Leva } from "leva";

export default function NewChatPage() {
  return (
    <>
      <ChatWelcome />
      <Leva hidden />
    </>
  );
}
