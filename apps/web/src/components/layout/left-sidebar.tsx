"use client";

import { BookUser, FileText, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";
import { useUIStore } from "@/stores/use-ui-store";
import { NavUser } from "../nav-user";

type Chat = {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  status: "active" | "idle";
};

type LeftSidebarProps = {
  chats: Chat[];
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({ chats }) => {
  const { setActiveChatId, activeChatId } = useUIStore();
  const router = useRouter();
  const { user, isPending } = useUser();

  const handleNewChat = () => {
    // Navigate to new chat
    setActiveChatId(null);
    router.push("/chat");
  };

  const handleChatSelect = (chatId: number) => {
    setActiveChatId(chatId);
    // Navigate to specific chat
    router.push(`/chat/${chatId}`);
  };

  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader className="border-b p-1">
        <div className="flex cursor-pointer items-center p-1">
          <SidebarTrigger className="cursor-pointer" />
          <Link className="flex items-center" href="/">
            <span className="ml-2 font-semibold group-data-[state=collapsed]:hidden">
              Memora
            </span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="p-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              className="cursor-pointer"
              onClick={handleNewChat}
              tooltip="New Chat"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="group-data-[state=collapsed]:hidden">
                New Chat
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-pointer" tooltip="Chats">
              <MessageSquare className="mr-2 h-4 w-4" />
              <span className="text-sm group-data-[state=collapsed]:hidden">
                Chats
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="cursor-pointer"
              tooltip="Rules"
            >
              <Link href="/rules">
                <FileText className="mr-2 h-4 w-4" />
                <span className="text-sm group-data-[state=collapsed]:hidden">
                  Rules
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="cursor-pointer"
              tooltip="Context Library"
            >
              <Link href="/context">
                <BookUser className="mr-2 h-4 w-4" />
                <span className="text-sm group-data-[state=collapsed]:hidden">
                  Context Library
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-2">
          <SidebarGroupLabel className="mx-1"> Recents</SidebarGroupLabel>

          <SidebarMenu className="p-1">
            <ScrollArea className="h-full">
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    asChild
                    className="w-full cursor-pointer justify-start"
                    isActive={activeChatId === chat.id}
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <span className="truncate group-data-[state=collapsed]:hidden">
                      {chat.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </ScrollArea>
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter>
        {isPending ? (
          <div className="flex items-center gap-2 p-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <div className="text-muted-foreground text-sm">Loading...</div>
          </div>
        ) : (
          user && <NavUser user={user} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default LeftSidebar;
