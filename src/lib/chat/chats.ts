

import { db } from "@/db/drizzle";
import { chat } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";


export async function getChatByUser(userId: string) {
    const chats = await db.select()
    .from(chat)
    .where(eq(chat.userId,userId))
    .orderBy(chat.updatedAt)
    return chats
}


export async function createChat(userId:string, title?:string) {

    const chatId = nanoid();

    await db.insert(chat).values({
        id:chatId,
        title:title || "new conversation",
        userId,
    })
    
    return chatId
}



export async function updateChatTitle(userId: string, chatId: string, title?: string) {
  if (!title) return null;

  const updated = await db
    .update(chat)
    .set({ title })
    .where(
      and(
        eq(chat.id, chatId),
        eq(chat.userId, userId)
      )
    )
    .returning();

  return updated[0] ?? null;
}


export async function getChatById(chatId:string,userId:string) {

    const result = await db.select()
    .from(chat)
    .where(eq(chat.id,chatId))
    

    const chats = result[0]

    if(!chat || chats.userId !== userId ){
        return null
    } 

    return chat
}


