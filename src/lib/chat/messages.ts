
import { and, eq, gt } from "drizzle-orm";
import {  messages, messageParts } from "@/db/schema";
import { MyUIMessage } from "./types";
import {
  mapUIMessagePartsToDBParts,
  mapDBPartToUIMessagePart,
} from "./messageMapping";

import { db } from "@/db/drizzle";




export const saveMessage = async ({
  chatId,
  message,
}: {
  chatId: string;
  message: MyUIMessage;
}) => {
 

 const [{id}] =  await db.insert(messages)
      .values({
        chatId,
        role: message.role,
      }).returning();

       const mappedDBUIParts = mapUIMessagePartsToDBParts(message.parts, id);
     

    await db.delete(messageParts).where(eq(messageParts.messageId,id));

    if (mappedDBUIParts.length > 0) {

      console.log("mapped data",mappedDBUIParts);
      
      await db.insert(messageParts).values(mappedDBUIParts);
    }
  
};

export const loadChat = async (chatId: string): Promise<MyUIMessage[]> => {
 
  const result = await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    with: {
      messageParts:{orderBy:(messageParts,{ asc }) => [asc(messageParts.order)]}
    },
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
  });

  console.log("load chats result");
  

  return result.map((message) => ({
    id: message.id,
    role: message.role,
    parts: message.messageParts.map((part) => mapDBPartToUIMessagePart(part)),
  }));
};


export const deleteMessage = async (messageId: string) => {
  await db.transaction(async (tx) => {
    const [targetMessage] = await tx
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!targetMessage) return;

    // Delete all messages after this one in the chat
    await tx
      .delete(messages)
      .where(
        and(
          eq(messages.chatId, targetMessage.chatId),
          gt(messages.createdAt, targetMessage.createdAt),
        ),
      );

    // Delete the target message (cascade delete will handle parts)
    await tx.delete(messages).where(eq(messages.id, messageId));
  });
};