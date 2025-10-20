"use client";

import { useChat } from "@ai-sdk/react";
import { GlobeIcon } from "lucide-react";
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
import { models } from "@/lib/utils";

type ChatWelcomeProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};


const ChatWelcome: React.FC<ChatWelcomeProps> = ({ user }) => {
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>(models[0].id);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const { messages, status, sendMessage } = useChat();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-3xl px-6">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-bold text-3xl">
              Hi {user.name || user.email}, how can I help you today?
            </h1>
          </div>

          {/* Chat Input */}
          <PromptInput className="mt-4" globalDrop multiple onSubmit={() => {}}>
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
                <PromptInputButton variant={useWebSearch ? "default" : "ghost"}>
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
              <PromptInputSubmit disabled={!(text || status)} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </main>
    </div>
  );
};

export default ChatWelcome;
