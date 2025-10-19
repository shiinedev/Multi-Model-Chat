import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { AppSidebar } from "@/components/app-sedibar";
import Chat from "@/components/Chat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import { auth } from "@/lib/auth";
import { getChatsByUserId } from "@/lib/chat";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // const chatId = await createChat(session?.user.id);

  const chats = await getChatsByUserId(session.user.id);

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
          <Chat userId={session.user.id} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
