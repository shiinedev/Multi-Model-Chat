import { messages, messageParts } from "@/db/schema";
import { db } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { UIMessage } from "ai";
import fs from "fs";
import path from "path";

export const saveMessage = async (
  message: UIMessage,
  userId: string,
  chatId: string
) => {
  if (!(userId || chatId)) {
    return "chatId and userId are required";
  }

  await db.insert(messages).values({
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    chatId: chatId,
    userId: userId,
  });

  // save message parts

  const clearParts = message.parts.filter((part) => part.type !== "step-start");

  for (const part of clearParts) {
    let fileUrl = part.type === "file" && part.url;

    const partId = nanoid();

    if (part.type === "file" && part.url.startsWith("data:")) {
      const base64Data = part.url.split(",")[1];
      const filePath = path.join("uploads", part?.filename!!);
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      fileUrl = `/uploads/${part.filename}`;
    }

    await db.insert(messageParts).values({
      id: crypto.randomUUID(),
      messageId: message.id,
      type: part.type,
      text: part.type === "text" as const ? part.text : "",
      filename: part.type === "file" as const ? part.filename : "unknown",
      mediaType: part.type === "file" ? part.mediaType : undefined,
      url: fileUrl || "",
    });
  }

  return { success: true, chatId: chatId };
};



export async function loadChatMessages(
  chatId: string,
  userId: string
): Promise<UIMessage[]> {
  const msgs = await db
    .select()
    .from(messages)
    .where(and(eq(messages.chatId, chatId), eq(messages.userId, userId)))
    .orderBy(messages.createdAt);

  const parts = await db.select().from(messageParts);

  const uiMessages: UIMessage[] = msgs.map((m) => ({
    id: m.id,
    role:
      m.role === "user" || m.role === "assistant" || m.role === "system"
        ? m.role
        : "user",
    parts: parts
      .filter((p) => p.messageId === m.id)
      .map((p) => {
        if (p.type === "text") {
          return {
            type: "text" as const,
            text: p.text ?? "",
          };
        } else if (p.type === "file") {
          return {
            type: "file" as const,
            name: p.filename ?? "unknown",
            url: p.url ?? "",
            mediaType: p.mediaType,
          };
        } else {
          return {
            type: "text" as const,
            text: "[unsupported message part]",
          };
        }
      }),
  }));

  return uiMessages;
}
