"use client";

import { useMutation } from "@tanstack/react-query";
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
import { models } from "@/lib/utils";
import { apiClient } from "@/utils/api-client";

const ChatWelcome = () => {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<string>(models[0].id);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const router = useRouter();
  const user = useUser();

  const createChatMutation = useMutation({
    mutationFn: async (initialMessage: string) =>
      apiClient.post<{ id: string }>("/api/chats", {
        initialMessage,
        modelId: model,
        useWebSearch,
        attachments: [],
      }),
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
    },
  });

  const handleSubmit = (value: string) => {
    if (value.trim()) {
      createChatMutation.mutate(value);
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
              onValueChange={(value) => setPrompt(value)}
            >
              <PromptInputBody>
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputTextarea />
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
                          key={modelItem.id}
                          value={modelItem.id}
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
