import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { AppSidebar } from "@/components/app-sedibar";
import Chat from "@/components/Chat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import { auth } from "@/lib/auth";
import { getChatsByUserId, MyUIMessage } from "@/lib/chat";
import { loadChatMessage } from "@/lib/chat/messages";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

interface chatProps {
  params: Promise<{ id: string }>;
}

const ChatPage = async ({ params }: chatProps) => {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const chats = await getChatsByUserId(session.user.id);
  if (!chats) {
    redirect("/");
  }

  const messages: MyUIMessage[] = await loadChatMessage(id);

  console.log("chat messages",messages);
  
   

  return (
     <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }>
      <AppSidebar chats={chats} />
      <SidebarInset>
        <div className="h-screen flex flex-col w-full">
          <SiteHeader />
          <Chat initialMessages={messages} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatPage;
