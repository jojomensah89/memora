"use client";
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  ShareIcon,
  TrashIcon,
  VolumeOffIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/hooks/use-chat";
import { useDeleteChat } from "@/hooks/use-delete-chat";

const Header: React.FC = () => {
  const params = useParams();
  const chatId = params?.chatId as string | undefined;
  const { data: chat, isLoading } = useChat(chatId);
  const { mutate: deleteChat, isPending } = useDeleteChat();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteChat = () => {
    if (chatId) {
      deleteChat(chatId);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <header className="m-1 flex h-10 w-full items-center justify-between">
      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : chat?.title ? (
        <ButtonGroup>
          <Button variant="ghost">{chat.title}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="!pl-2" variant="ghost">
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <VolumeOffIcon />
                  Star
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckIcon />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertTriangleIcon />
                  Report Conversation
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <ShareIcon />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyIcon />
                  Copy
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <AlertDialog
                  onOpenChange={setIsDeleteDialogOpen}
                  open={isDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setIsDeleteDialogOpen(true);
                      }}
                      variant="destructive"
                    >
                      <TrashIcon />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{chat.title}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isPending}
                        onClick={handleDeleteChat}
                      >
                        {isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      ) : null}
    </header>
  );
};

export default Header;
