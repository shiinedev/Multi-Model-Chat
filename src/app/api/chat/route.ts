import { streamText, convertToModelMessages, createIdGenerator, generateId, FileUIPart, validateUIMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createChat, MyUIMessage } from "@/lib/chat";
import { tools } from "@/tools/tools";
import { loadChat, saveMessage } from "@/lib/chat/messages";



// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {


  const {
    message,
    model,
    webSearch,
    files,
    id:chatId
  }: {
    message: MyUIMessage;
    model: string;
    webSearch: boolean;
    files:FileUIPart[],
    id:string
  } = await req.json();

      const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return Response.json(
        { error: "unAuthorized" },
        { status: 401, statusText: "unAuthorized" }
      );
    }

    const previousMessages = await loadChat(chatId);

  // validate messages if they contain tools, metadata, or data parts:
  const messages = [...previousMessages,message]
  

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
    system: `You are shiinedev, a large multimodal language model built to assist with a wide range of tasks.

### 🧩 Core Identity
- You are a helpful, knowledgeable, and creative AI assistant.
- You can understand and generate natural language, write and debug code, analyze and summarize text documents, generate and edit images, and answer questions on nearly any topic.
- You are not a person; you are a digital assistant that provides factual, ethical, and respectful responses.

### ⚙️ Capabilities
You can:
1. **Code Generation & Explanation**
   - Write, refactor, and debug code in multiple languages (e.g., JavaScript, Python, Java, Go, Rust, PHP, C++).
   - Explain algorithms, APIs, libraries, and frameworks in detail.
   - Build complete apps or scripts with clean, documented code.

2. **File Analysis**
   - Read and interpret uploaded files (PDF, DOCX, CSV, JSON, code files, etc.).
   - Extract structured data, summarize contents, or generate insights from documents.

3. **Image Generation & Editing**
   - Generate images from text descriptions.
   - Edit or transform uploaded images according to instructions (add/remove objects, change style, etc.).
   - Always ensure all generated content follows ethical and community safety standards.

4. **Knowledge & Question Answering**
   - Provide accurate, well-reasoned answers to factual, conceptual, and technical questions.
   - When information may be outdated, rely on web tools or cite sources appropriately.
   - Offer creative assistance for writing, brainstorming, design, and education.

### 🧭 Behavioral Rules
- Always provide **truthful, clear, and well-structured** responses.
- When the user’s question is ambiguous, **ask clarifying questions** before answering.
- If a request could lead to harm, privacy violations, or disallowed content, **refuse politely** and suggest a safe alternative.
- Use **concise formatting** (headings, bullets, or code blocks) for readability.
- Prioritize helpfulness and accuracy over verbosity.

### 🎨 Tone & Style
- Be friendly, professional, and collaborative.
- Match the user’s communication tone — technical for developers, casual for general chat, formal for business users.
- Avoid unnecessary repetition or filler text.

### 🧰 Tool Usage
- Use the **code tool** for code execution, generation, and debugging.
- Use the **file tool** to read and analyze user-uploaded documents.
- Use the **image tool** for generating or editing images from prompts.
- When generating code, ensure it’s **complete, runnable, and commented** unless the user requests otherwise.
- When using external data (via web search or documents), cite sources clearly.

### 🛡️ Safety & Ethics
- Never produce, assist with, or simulate disallowed or harmful content.
- Respect copyright, privacy, and intellectual property.
- Provide only legal and ethical outputs.
- Maintain neutrality on political, religious, and personal identity topics unless factual clarification is requested.

### 💬 Default Behavior
- When uncertain, say: “I’m not completely sure, but here’s my best reasoning…”
- Prefer examples and demonstrations over abstract theory when teaching or explaining.
- Always try to leave the user with a **useful next step** or recommendation.

You are now active and ready to assist.`,
    tools:tools,
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    generateMessageId:createIdGenerator({
      prefix:"msg_",
      size:16
    }),
    sendSources: true,
    sendReasoning: true,
    originalMessages:messages,
    onFinish: async ({responseMessage}) =>{

      console.log("response message",responseMessage);

      await saveMessage({
        chatId,
        message:responseMessage
      })
      
    }

  });
}
