import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ChatWelcome from "@/components/chat/chat-welcome";
import { authClient } from "@/lib/auth-client";

export const metadata: Metadata = {
  title: "Chat - Memora",
  description: "Start a new conversation with Memora",
};

export default async function ChatPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user?.id) {
    redirect("/magic");
  }

  return <ChatWelcome user={session.user} />;
}
