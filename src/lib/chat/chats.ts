"use server"
import { and, eq} from "drizzle-orm";
import { chats } from "@/db/schema";
import { db } from "@/db/drizzle";


export const createChat = async (userId:string,title?:string) => {
  const [{ id }] = await db.insert(chats).values({userId,title:title || "new message"}).returning();
  return id;
};

export const getChatsByUserId = async (userId:string) => {
  return await db.select().from(chats).where(eq(chats.userId,userId));
};

export const deleteChat = async (chatId: string,userId:string) => {
  await db.delete(chats).where(and(eq(chats.id, chatId),eq(chats.userId,userId)));
};

export const updateChat = async (chatId: string,title:string) => {
  await db.update(chats).set({title}).where(eq(chats.id,chatId));
};


