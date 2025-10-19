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
import { chats } from "@/lib/utils";

type HeaderProps = {
  chatId: number;
};

const Header: React.FC<HeaderProps> = ({ chatId }) => {
  const chat = chats.find((c) => c.id === chatId);
  const chatTitle = chat?.title;

  return (
    <header className="m-1 flex h-10 w-full items-center justify-between">
      {chatTitle && (
        <ButtonGroup>
          <Button variant="ghost">{chatTitle}</Button>
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
                  Star{" "}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckIcon />
                  Rename{" "}
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
      )}
    </header>
  );
};

export default Header;
