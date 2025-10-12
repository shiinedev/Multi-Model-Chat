import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import Chat from "@/components/Chat";


export default function Home() {
  return (
    <PromptInputProvider>
         <Chat />
    </PromptInputProvider>

  );
}
