import ChatInterface from "@/components/layout/chat-interface";

type ChatPageProps = {
  params: Promise<{
    chatId: string;
  }>;
};

export default async function ChatPage({ params }: Readonly<ChatPageProps>) {
  const { chatId } = await params;

  return <ChatInterface chatId={chatId} />;
}
