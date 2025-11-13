"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { GlobeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { apiClient, queryClient } from "@/utils/api-client";

type CreateChatResponse = {
  id: string;
  chatId: string;
  messageId: string;
  provider: string;
  modelId: string;
  useWebSearch: boolean;
};

type StartInitialStreamInput = {
  chatId: string;
  messageId: string;
  text: string;
  modelId: string;
  useWebSearch: boolean;
};

async function startInitialStream(input: StartInitialStreamInput) {
  try {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    const endpoint = serverUrl ? `${serverUrl}/api/v1/chat` : "/api/v1/chat";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id: input.chatId,
        messages: [
          {
            id: input.messageId,
            role: "user",
            parts: [
              {
                type: "text",
                text: input.text,
              },
            ],
            createdAt: new Date().toISOString(),
          },
        ],
        model: input.modelId,
        webSearch: input.useWebSearch,
      }),
    });

    if (!(response.ok && response.body)) {
      return;
    }

    const reader = response.body.getReader();

    try {
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (_) {
    // Swallow errors to avoid blocking navigation
  }
}

const ChatWelcome = () => {
  const [prompt, setPrompt] = useState("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const router = useRouter();
  const { user, isPending } = useUser();

  // Fetch models from backend
  const { data: modelsData } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
    staleTime: Number.POSITIVE_INFINITY, // Models don't change often
  });

  const models = modelsData || [];
  const [model, setModel] = useState<string>(() => {
    // Default to first Gemini model or the first available model
    const firstGemini = models.find((m: Model) => m.provider === "GEMINI");
    return firstGemini?.modelId || models[0]?.modelId || "gemini-2.0-flash-exp";
  });

  const createChatMutation = useMutation<CreateChatResponse, Error, string>({
    mutationFn: async (initialMessage: string) =>
      apiClient.post<CreateChatResponse>("/api/chats", {
        initialMessage,
        modelId: model,
        useWebSearch,
        attachments: [],
      }),
    onSuccess: (data, variables) => {
      startInitialStream({
        chatId: data.chatId,
        messageId: data.messageId,
        text: variables,
        modelId: data.modelId,
        useWebSearch: data.useWebSearch,
      }).finally(() => {
        queryClient.invalidateQueries({ queryKey: ["chat", data.chatId] });
      });

      router.push(`/chat/${data.chatId}`);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
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
    const text = message.text || "";
    if (text.trim()) {
      createChatMutation.mutate(text);
      setPrompt("");
    }
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
                <PromptInputSubmit
                  disabled={createChatMutation.isPending || !prompt.trim()}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatWelcome;
