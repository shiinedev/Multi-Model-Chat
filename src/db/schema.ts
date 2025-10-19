import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  varchar,
  uuid,
   check,
  index,
  integer,
  real
} from "drizzle-orm/pg-core";


import { generateId, ToolUIPart } from "ai";
import { sql } from "drizzle-orm";
import { GenerateImageInput, GenerateImageOutput, UpdateImageInput, UpdateImageOutput } from "@/tools/tools";
import { MyProviderMetadata, MyUIMessage } from "@/lib/chat";


export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const chats = pgTable("chat", {
  id: varchar("id",{length:36})
    .primaryKey(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Messages table
export const messages = pgTable(
  "messages",
  {
    id: varchar()
      .primaryKey()
      .$defaultFn(() => generateId()),
    chatId: varchar("chat_id", { length: 64 })
      .references(() => chats.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar().$type<MyUIMessage["role"]>().notNull(), // user, assistant, system
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("messages_chat_id_idx").on(table.chatId),
    index("messages_chat_id_created_at_idx").on(table.chatId, table.createdAt),
  ]
);

// Message Parts table

export const messageParts = pgTable(
  "message_parts",
  {
    id: varchar()
      .primaryKey()
      .$defaultFn(() => generateId()),
    messageId: varchar()
      .references(() => messages.id, { onDelete: "cascade" })
      .notNull(),
    type: varchar().$type<MyUIMessage["parts"][0]["type"]>().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    order: integer().notNull().default(0),

    // Text fields
    text: text(),

    // Reasoning fields
    reasoning_text: text(),

    // File fields
    file_mediaType: varchar(),
    file_filename: varchar(), // optional
    file_url: varchar(),

    // Source url fields
    source_url_sourceId: varchar(),
    source_url_url: varchar(),
    source_url_title: varchar(), // optional

    // Source document fields
    source_document_sourceId: varchar(),
    source_document_mediaType: varchar(),
    source_document_title: varchar(),
    source_document_filename: varchar(), // optional

    // shared tool call columns
    tool_toolCallId: varchar(),
    tool_state: varchar().$type<ToolUIPart["state"]>(),
    tool_errorText: varchar().$type<ToolUIPart["state"]>(),

    // tools inputs and outputss are stored in separate cols
  
    tool_generateImage_Input: jsonb().$type<GenerateImageInput>(),
    tool_generateImage_output: jsonb().$type<GenerateImageOutput>(),

    tool_updateImage_Input: jsonb().$type<UpdateImageInput>(),
    tool_updateImage_output: jsonb().$type<UpdateImageOutput>(),


    // metadata

    providerMetadata: jsonb().$type<MyProviderMetadata>(),
  },
  (table) => [
    // Indexes for performance optimisation
    index("parts_message_id_idx").on(table.messageId),
    index("parts_message_id_order_idx").on(table.messageId, table.order),

    // Check constraints
    check(
      "text_required_if_type_is_text",
      // This SQL expression enforces: if type = 'text' then text_text IS NOT NULL
      sql`CASE WHEN ${table.type} = 'text' THEN ${table.text} IS NOT NULL ELSE TRUE END`
    ),
    check(
      "reasoning_text_required_if_type_is_reasoning",
      sql`CASE WHEN ${table.type} = 'reasoning' THEN ${table.reasoning_text} IS NOT NULL ELSE TRUE END`
    ),
    check(
      "file_fields_required_if_type_is_file",
      sql`CASE WHEN ${table.type} = 'file' THEN ${table.file_mediaType} IS NOT NULL AND ${table.file_url} IS NOT NULL ELSE TRUE END`
    ),
    check(
      "source_url_fields_required_if_type_is_source_url",
      sql`CASE WHEN ${table.type} = 'source_url' THEN ${table.source_url_sourceId} IS NOT NULL AND ${table.source_url_url} IS NOT NULL ELSE TRUE END`
    ),
    check(
      "source_document_fields_required_if_type_is_source_document",
      sql`CASE WHEN ${table.type} = 'source_document' THEN ${table.source_document_sourceId} IS NOT NULL AND ${table.source_document_mediaType} IS NOT NULL AND ${table.source_document_title} IS NOT NULL ELSE TRUE END`
    ),
    check(
      "tool_generateImage_fields_required",
      sql`CASE WHEN ${table.type} = 'tool-generateImage' THEN ${table.tool_toolCallId} IS NOT NULL AND ${table.tool_state} IS NOT NULL ELSE TRUE END`
    ),
    check(
      "tool_updateImage_fields_required",
      sql`CASE WHEN ${table.type} = 'tool-updateImage' THEN ${table.tool_toolCallId} IS NOT NULL AND ${table.tool_state} IS NOT NULL ELSE TRUE END`
    ),
  ]
);


export const schema = { user, session, verification, account,chats,messages,messageParts };


export type MyDBUIMessagePart = typeof messageParts.$inferInsert;
export type MyDBUIMessagePartSelect = typeof messageParts.$inferSelect;
