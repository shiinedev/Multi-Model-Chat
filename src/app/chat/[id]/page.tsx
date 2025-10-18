import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { AppSidebar } from "@/components/app-sedibar";
import Chat from "@/components/Chat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import { auth } from "@/lib/auth";
import { getChatsByUserId } from "@/lib/chat";
import { loadChat } from "@/lib/chat/messages";
import { UIMessage } from "ai";
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

  const messages: UIMessage[] = await loadChat(id);

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
        <div className="flex flex-1 flex-col h-screen">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <PromptInputProvider>
              <Chat userId={session.user.id} chatId={id} initialMessages={messages} />
            </PromptInputProvider>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatPage;
