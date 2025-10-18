
import { tools } from "@/tools/tools";
import { InferUITools, JSONValue, UIMessage, UIMessagePart } from "ai";
import z from "zod";

export const metadataSchema = z.object({});

export type MyMetadata = z.infer<typeof metadataSchema>;

export type MyToolSet = InferUITools<typeof tools>;

export type MyUIMessage = UIMessage<MyMetadata, never, MyToolSet>;

export type MyUIMessagePart = UIMessagePart<never, MyToolSet>;

export type MyProviderMetadata = Record<string, Record<string, JSONValue>>;