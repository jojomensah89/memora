"use client";

import { BookUser, FileText, MessageSquare, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import { useChats } from "@/hooks/use-chats";
import { useDeleteChat } from "@/hooks/use-delete-chat";
import { useUser } from "@/hooks/use-user";
import { useUIStore } from "@/stores/use-ui-store";
import { NavUser } from "../nav-user";

const LeftSidebar: React.FC = () => {
  const { setActiveChatId, activeChatId } = useUIStore();
  const router = useRouter();
  const { user, isPending } = useUser();
  const { data: chatsData, isLoading: chatsLoading } = useChats();
  const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat();
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const handleNewChat = () => {
    setActiveChatId(null);
    router.push("/chat");
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    router.push(`/chat/${chatId}`);
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      setChatToDelete(null);
    }
  };

  return (
    <>
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

          <div className="mt-2 group-data-[state=collapsed]:hidden">
            <SidebarGroupLabel className="mx-1">Recents</SidebarGroupLabel>

            <SidebarMenu className="p-1">
              <ScrollArea className="h-full">
                {(() => {
                  if (chatsLoading) {
                    return (
                      <div className="px-3 py-2 text-muted-foreground text-xs">
                        Loading chats...
                      </div>
                    );
                  }
                  if (chatsData?.data && chatsData.data.length > 0) {
                    return chatsData.data.map((chat) => (
                      <SidebarMenuItem
                        className="group/item relative"
                        key={chat.id}
                      >
                        <SidebarMenuButton
                          className="w-full cursor-pointer justify-start pr-8"
                          isActive={activeChatId === chat.id}
                          onClick={() => handleChatSelect(chat.id)}
                        >
                          <span className="truncate group-data-[state=collapsed]:hidden">
                            {chat.title}
                          </span>
                        </SidebarMenuButton>
                        <Button
                          className="-translate-y-1/2 absolute top-1/2 right-1 h-6 w-6 opacity-0 transition-opacity group-hover/item:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChatToDelete(chat.id);
                          }}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </SidebarMenuItem>
                    ));
                  }
                  return (
                    <div className="px-3 py-2 text-muted-foreground text-xs">
                      No chats yet
                    </div>
                  );
                })()}
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

      <AlertDialog
        onOpenChange={(open) => !open && setChatToDelete(null)}
        open={!!chatToDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LeftSidebar;
