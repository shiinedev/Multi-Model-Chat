import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import Chat from "@/components/Chat";
import { auth } from "@/lib/auth";
import { createChat, MyUIMessage } from "@/lib/chat";
import { loadChat } from "@/lib/chat/messages";
import { UIMessage } from "ai";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });


  if(!session){
    redirect("/login")
  }

  const chatId = await createChat(session?.user.id);

  const messages:MyUIMessage[] = await loadChat(chatId);


  return (
    <PromptInputProvider>
      <Chat chatId={chatId} initialMessages={messages} />
    </PromptInputProvider>
  );
}
