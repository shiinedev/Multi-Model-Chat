"use server"
import { and, asc, desc, eq} from "drizzle-orm";
import { chats } from "@/db/schema";
import { db } from "@/db/drizzle";


export const createChat = async (id:string,userId:string,title?:string) => {
  const [chat] = await db.insert(chats).values({id,userId,title:title || "new message"}).returning();
  return chat;
};

export const getChatsByUserId = async (userId:string) => {
  return await db.select().from(chats).where(eq(chats.userId,userId)).orderBy(desc(chats.createdAt))
};

export const getChatById = async (id:string)=> {
 
  const [chat] = await db
    .select()
    .from(chats)
    .where(eq(chats.id, id));

  return chat ?? null; // return null if not found
};

export const deleteChat = async (chatId: string,userId:string) => {
  await db.delete(chats).where(and(eq(chats.id, chatId),eq(chats.userId,userId)));
};

export const updateChat = async (chatId: string,title:string) => {
  const [chat] = await db.update(chats).set({title}).where(eq(chats.id,chatId)).returning();
  return chat
};


