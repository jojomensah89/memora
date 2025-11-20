"use client";

import { useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { DefaultChatTransport, generateId } from "ai";
import { GlobeIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

import { fetchModels } from "@/lib/utils";

const ChatWelcome = () => {
  const [prompt, setPrompt] = useState("");
  const [webSearch, setUseWebSearch] = useState<boolean>(false);
  const [userSelectedModel, setUserSelectedModel] = useState<
    string | undefined
  >(undefined);

  // Generate chatId once to maintain state across re-renders
  const chatId = generateId();

  const { user, isPending } = useUser();

  // Fetch models from backend
  const { data: modelsData } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const models = modelsData || [];

  // Auto-select first model when models load
  useEffect(() => {
    if (modelsData && modelsData.length > 0 && !userSelectedModel) {
      setUserSelectedModel(modelsData[0].modelId);
    }
  }, [modelsData, userSelectedModel]);

  // Pure derived state with nullish coalescing
  const currentModel = userSelectedModel ?? "";

  // For initial testing, use the Next.js API route directly
  const apiEndpoint = useMemo(
    () => `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat`,
    []
  );
  const { sendMessage, status } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: apiEndpoint,
      prepareSendMessagesRequest({ messages, body }) {
        return {
          body: {
            id: chatId,
            messages,
            model: currentModel,
            webSearch,
            ...body,
          },
        };
      },
    }),
    onData(message) {
      // Listen for chat-created event
      if (message.type === "data-new-chat-created") {
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
                    onClick={() => setUseWebSearch(!webSearch)}
                    variant={webSearch ? "default" : "ghost"}
                  >
                    <GlobeIcon size={16} />
                    <span>Search</span>
                  </PromptInputButton>
                  <PromptInputModelSelect
                    onValueChange={(value) => {
                      setUserSelectedModel(value);
                    }}
                    value={currentModel}
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
