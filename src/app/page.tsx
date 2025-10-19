import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { AppSidebar } from "@/components/app-sedibar";
import Chat from "@/components/Chat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import { auth } from "@/lib/auth";
import { getChatById, getChatsByUserId, MyUIMessage } from "@/lib/chat";
import { loadChatMessage } from "@/lib/chat/messages";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home(props: {
  searchParams: Promise<{ chatId?: string }>;
}) {

   const searchParams = await props.searchParams;
  const chatIdFromSearchParams = searchParams.chatId ?? "";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const chats = await getChatsByUserId(session.user.id);

   let messages: MyUIMessage[] = []

  if(chatIdFromSearchParams){
     messages = await loadChatMessage(chatIdFromSearchParams);
  }

  const chat = await getChatById(chatIdFromSearchParams);
  
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
          <SiteHeader title={chat?.title ?? ""} />
          <Chat initialMessages={messages} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
