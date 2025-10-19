"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { chats } from "@/lib/utils";
import { queryClient } from "@/utils/trpc";
import LeftSidebar from "./layout/LeftSidebar";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <LeftSidebar chats={chats} />
          <SidebarInset />
          {children}
        </SidebarProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
