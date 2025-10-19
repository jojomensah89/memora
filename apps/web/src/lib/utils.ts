import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export type Chat = {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  status: "active" | "idle";
};
export const chats: Chat[] = [
  {
    id: 1,
    title: "Project Alpha",
    lastMessage: "Let's schedule a meeting for next week.",
    timestamp: "2024-06-20T10:30:00Z",
    unread: 2,
    avatar: "/avatars/project-alpha.png",
    status: "active",
  },
  {
    id: 2,
    title: "Marketing Team",
    lastMessage: "The new campaign is live!",
    timestamp: "2024-06-19T14:15:00Z",
    unread: 0,
    avatar: "/avatars/marketing-team.png",
    status: "idle",
  },
];
