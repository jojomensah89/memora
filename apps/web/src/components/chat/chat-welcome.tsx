"use client";

import { AlertCircle, ArrowUpIcon, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

import { Separator } from "@/components/ui/separator";

const UNAUTHORIZED_STATUS = 401;
const AUTH_ERROR_REDIRECT_DELAY_MS = 2000;

type ChatWelcomeProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

const ChatWelcome: React.FC<ChatWelcomeProps> = ({ user }) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createChat = async (prompt: string) => {
    const response = await fetch("/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initialMessage: prompt.trim(),
      }),
    });

    if (response.status === UNAUTHORIZED_STATUS) {
      throw new Error("You're not authenticated. Redirecting to login...");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to create chat: ${response.statusText}`
      );
    }

    const data = await response.json();
    const { chatId } = data;

    if (!chatId) {
      throw new Error("No chat ID returned from server");
    }

    return chatId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const chatId = await createChat(message);
      router.push(`/chat/${chatId}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create chat. Please try again.";
      setError(errorMessage);

      // If it's an auth error, help user re-authenticate
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("authentication")
      ) {
        setTimeout(() => router.push("/magic"), AUTH_ERROR_REDIRECT_DELAY_MS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    {
      title: "Help me write code",
      icon: "💻",
    },
    {
      title: "Explain a complex topic",
      icon: "📚",
    },
    {
      title: "Create content",
      icon: "✍️",
    },
    {
      title: "Solve a problem",
      icon: "🔧",
    },
  ];

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-3xl px-6">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-bold text-4xl text-[#1677ff]">
              Hi {user.name || user.email}, how can I help you today?
            </h1>
            <p className="text-lg text-muted-foreground">
              Start a conversation with Memora and get AI-powered assistance
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/10">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Chat Input */}
          <Card className="mb-8 p-4 shadow-lg">
            <form className="w-full" onSubmit={handleSubmit}>
              <div className="flex items-end space-x-2">
                <InputGroup>
                  <InputGroupTextarea placeholder="Ask, Search or Chat..." />
                  <InputGroupAddon align="block-end">
                    <InputGroupButton
                      className="rounded-full"
                      size="icon-xs"
                      variant="outline"
                    >
                      {/* <IconPlus /> */}
                    </InputGroupButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <InputGroupButton variant="ghost">
                          Auto
                        </InputGroupButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="[--radius:0.95rem]"
                        side="top"
                      >
                        <DropdownMenuItem>Auto</DropdownMenuItem>
                        <DropdownMenuItem>Agent</DropdownMenuItem>
                        <DropdownMenuItem>Manual</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <InputGroupText className="ml-auto">
                      52% used
                    </InputGroupText>
                    <Separator className="!h-4" orientation="vertical" />
                    <InputGroupButton
                      className="rounded-full"
                      disabled
                      size="icon-xs"
                      variant="default"
                    >
                      <ArrowUpIcon />
                      <span className="sr-only">Send</span>
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <Button
                  className="h-10 w-10 flex-shrink-0 bg-[#1677ff] hover:bg-[#1066e6]"
                  disabled={!message.trim() || isLoading}
                  size="icon"
                  type="submit"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Example Prompts */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {examplePrompts.map((prompt) => (
              <Button
                className="flex items-center space-x-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent"
                key={prompt.title}
                onClick={() => handlePromptClick(prompt.title)}
              >
                <span className="text-2xl">{prompt.icon}</span>
                <span className="font-medium">{prompt.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatWelcome;
