import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@/components/layout/header";
import RightSidebar from "@/components/layout/right-sidebar";
import { authClient } from "@/lib/auth-client";

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <Header chatId={1} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <RightSidebar />
    </div>
  );
}
