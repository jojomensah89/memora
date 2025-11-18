"use client";
import { useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import { GlobeIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { useChat as useChatData } from "@/hooks/use-chat";
import { fetchModels, type Model } from "@/lib/utils";

type ChatInterfaceProps = {
  chatId: string;
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId }) => {
  // Fetch chat data including messages
  const { data: chatData, isLoading } = useChatData(chatId);

  // const { messages, status, sendMessage } = useChat({ id: chatId });

  // Convert backend messages to AI SDK format
  const initialMessages = useMemo<UIMessage[]>(() => {
    if (!chatData?.messages) {
      return [];
    }

    return chatData.messages.map((msg) => {
      const message: UIMessage = {
        id: msg.id,
        role: msg.role,
        parts: [
          {
            type: "text",
            text: msg.content,
          },
        ],
      };

      return message;
    });
  }, [chatData]);

  // Fetch models from backend
  const { data: modelsData } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
    staleTime: Number.POSITIVE_INFINITY, // Models don't change often
  });

  const models = modelsData || [];
  const defaultModel = useMemo(() => {
    const firstGemini = models.find((m: Model) => m.provider === "GEMINI");
    return firstGemini?.modelId || models[0]?.modelId || "gemini-2.0-flash-exp";
  }, [models]);

  const transportApi = useMemo(
    () => `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat`,
    []
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chatData) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Unable to load chat.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatPanel
      chatId={chatId}
      defaultModel={defaultModel}
      initialMessages={initialMessages}
      key={`${chatId}-${chatData.updatedAt ?? "initial"}`}
      models={models}
      transportApi={transportApi}
    />
  );
};

export default ChatInterface;

type ChatPanelProps = {
  chatId: string;
  initialMessages: UIMessage[];
  models: Model[];
  defaultModel: string;
  transportApi: string;
};

const ChatPanel: React.FC<ChatPanelProps> = ({
  chatId,
  initialMessages,
  models,
  defaultModel,
  transportApi,
}) => {
  const [text, setText] = useState<string>("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [model, setModel] = useState<string>(defaultModel);

  useEffect(() => {
    if (!models.find((item) => item.modelId === model)) {
      setModel(defaultModel);
    }
  }, [defaultModel, model, models]);

  const { messages, status, sendMessage, error } = useChat({
    id: chatId,
    initialMessages,
    transport: new DefaultChatTransport({
      api: transportApi,
      credentials: "include",
    }),
  });

  // // Auto-trigger streaming if last message is from user (first navigation)
  // useEffect(() => {
  //   const lastMessage = initialMessages.at(-1);

  //   // If we just navigated here and last message is user, trigger AI response
  //   if (
  //     lastMessage?.role === "user" &&
  //     messages.length === initialMessages.length &&
  //     initialMessages.length > 0
  //   ) {
  //     const userText =
  //       lastMessage.parts.find((part) => part.type === "text")?.text || "";

  //     // Trigger the AI response automatically
  //     sendMessage(
  //       {
  //         text: userText,
  //       },
  //       {
  //         body: {
  //           model: defaultModel,
  //           webSearch: false,
  //         },
  //       }
  //     );
  //   }
  // }, [initialMessages, messages.length, defaultModel, sendMessage]); // Only trigger on initial mount

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model,
          webSearch: useWebSearch,
        },
      }
    );
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative mx-auto my-2 size-full h-full max-w-4xl p-6">
        <div className="flex h-full flex-col">
          <Conversation>
            <ConversationContent>
              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))}

              {/* Show error message if streaming fails */}
              {error && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="rounded-md border border-destructive/20 p-2 text-destructive">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <span className="font-medium">Error</span>
                      </div>
                      <div className="text-sm opacity-90">
                        {error.message ||
                          "Failed to generate response. Please try again."}
                      </div>
                      {error.message?.includes("quota") && (
                        <div className="mt-2 text-xs opacity-75">
                          Tip: You may need to wait for your API quota to reset
                          or use a different model.
                        </div>
                      )}
                    </div>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <PromptInput
            className="mt-4"
            globalDrop
            multiple
            onSubmit={handleSubmit}
          >
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                ref={textareaRef}
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputSpeechButton
                  onTranscriptionChange={setText}
                  textareaRef={textareaRef}
                />
                <PromptInputButton
                  onClick={() => setUseWebSearch(!useWebSearch)}
                  variant={useWebSearch ? "default" : "ghost"}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
                <PromptInputModelSelect
                  onValueChange={(value) => {
                    setModel(value);
                  }}
                  value={model}
                >
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {models.map((modelItem) => (
                      <PromptInputModelSelectItem
                        key={modelItem.modelId}
                        value={modelItem.modelId}
                      >
                        {modelItem.name}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputTools>
              <PromptInputSubmit disabled={!(text || status)} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};
