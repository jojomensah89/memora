"use client";

import { useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { DefaultChatTransport, generateId } from "ai";
import { GlobeIcon } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Gl } from "@/components/gl";
import { useUser } from "@/hooks/use-user";
import { fetchModels, type Model } from "@/lib/utils";

const ChatWelcome = () => {
  const [prompt, setPrompt] = useState("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [model, setModel] = useState<string>("gemini-2.0-flash-exp");

  // Generate chatId once to maintain state across re-renders
  const chatId = useMemo(() => generateId(), []);

  const { user, isPending } = useUser();

  // Fetch models from backend
  const { data: modelsData } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
    staleTime: Number.POSITIVE_INFINITY, // Models don't change often
  });

  const models = modelsData || [];

  // Set default model when models are loaded
  useMemo(() => {
    if (models.length > 0) {
      const firstGemini = models.find((m: Model) => m.provider === "GEMINI");
      setModel(
        firstGemini?.modelId || models[0]?.modelId || "gemini-2.0-flash-exp"
      );
    }
  }, [models]);

  const { sendMessage, status } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: "/api/v1/chats", // POST endpoint
      prepareSendMessagesRequest({ messages }) {
        return {
          body: {
            id: chatId,
            messages,
            model,
            useWebSearch,
            attachments: [],
          },
        };
      },
    }),
    onData(message) {
      // Listen for chat-created event
      if (message.type === "new-chat-created") {
        // Update URL without navigation
        globalThis.history.replaceState({}, "", `/chat/${chatId}`);
      }
    },
  });

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="fixed inset-0 z-0">
          <Gl hovering={false} />
        </div>
        <main className="relative z-10 flex min-h-screen flex-col">
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) {
      return;
    }

    sendMessage({
      text: message.text,
      files: message.files,
    });

    setPrompt("");
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* 3D Background - Fixed position behind everything */}
      <div className="fixed inset-0 z-0">
        <Gl hovering={false} />
      </div>

      {/* Main Content - Layered above background */}
      <main className="relative z-10 flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-3xl px-6">
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-bold text-3xl">
                Hi {user?.name || user?.email}, how can I help you today?
              </h1>
            </div>

            {/* Chat Input */}
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
                  onChange={(e) => setPrompt(e.target.value)}
                  value={prompt}
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
                  <PromptInputSpeechButton />
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
                <PromptInputSubmit disabled={!prompt.trim()} status={status} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatWelcome;
