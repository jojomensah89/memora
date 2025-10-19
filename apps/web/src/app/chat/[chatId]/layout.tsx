import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import RightSidebar from "@/components/layout/RightSidebar";
import { authClient } from "@/lib/auth-client";

type ChatLayoutProps = {
  children: ReactNode;
  params: {
    chatId: string;
  };
};

export default async function ChatLayout({
  children,
  params,
}: Readonly<ChatLayoutProps>) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session?.data?.user?.id) {
    redirect("/magic");
  }

  return (
    <div className="flex h-screen max-h-screen w-full">
      <div className="flex flex-1 flex-col">
        <Header chatId={Number(params.chatId)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <RightSidebar />
    </div>
  );
}
