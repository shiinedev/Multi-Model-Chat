
import { messages,messageParts } from "@/db/schema";
import { db } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { UIMessage } from "ai"
import fs from "fs"
import path from "path";

export const saveMessage = async (message:UIMessage,userId:string,chatId:string) =>{

    if(!(userId || chatId)){
        return "chatId and userId are required"
    }

   await db.insert(messages).values({
    id:message.id,
    role:message.role,
    userId,
    chatId,
   });

   // save message parts

   for (const part of message.parts) {
    let fileUrl = part.type === "file" && part.url;

     const partId = nanoid();

    if (part.type === "file" && part.url.startsWith("data:")) {
      const base64Data = part.url.split(",")[1];
      const filePath = path.join("uploads", part?.filename!!);
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      fileUrl = `/uploads/${part.filename}`;
      
    }
    

    await db.insert(messageParts).values({
      id:partId,
      messageId: message.id,
      type: part.type,
      text: part.type === "text" ? part.text : null,
      filename: part.type === "file" ? part.filename : null,
      mediaType: part.type === "file" ? part.mediaType : null,
      url: fileUrl || null,
    });
    
  }

  return { success: true ,chatId:chatId};

}


export async function getChatMessages(chatId:string,userId:string) {
  const msgs = await db
    .select()
    .from(messages)
    .where(and(
        eq(messages.chatId, chatId),
        eq(messages.userId,userId)
    ))
    .orderBy(messages.createdAt);

  const parts = await db.select().from(messageParts);

  return msgs.map((m) => ({
    ...m,
    parts: parts.filter((p) => p.messageId === m.id),
  }));
}


