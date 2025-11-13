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

const Header: React.FC = () => {
  const params = useParams();
  const chatId = params?.chatId as string | undefined;
  const { data: chat, isLoading } = useChat(chatId);

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
                <DropdownMenuItem variant="destructive">
                  <TrashIcon />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      ) : null}
    </header>
  );
};

export default Header;
