import ChatInterface from "@/components/layout/ChatInterface";

type ChatPageProps = {
  params: {
    chatId: string;
  };
};

export default function ChatPage({ params }: Readonly<ChatPageProps>) {
  return <ChatInterface chatId={params.chatId} />;
}
