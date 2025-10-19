"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { Action, Actions } from "@/components/ai-elements/actions";
import { Fragment, startTransition, useRef, useState } from "react";
import { UIMessage, useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { CopyIcon, File, GlobeIcon, RefreshCcwIcon } from "lucide-react";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { DefaultChatTransport } from "ai";
import { createChat, MyUIMessage } from "@/lib/chat";
import { useRouter } from "next/navigation";
import { SiteHeader } from "./ui/site-header";

const models = [
  {
    name: "GPT 4o",
    value: "openai/gpt-4o",
  },
  {
    name: "Deepseek R1",
    value: "deepseek/deepseek-r1",
  },
];

interface ChatProps {
  chatId?: string;
  userId: string;
  initialMessages?: UIMessage[];
}

const Chat = ({ chatId, initialMessages, userId }: ChatProps) => {
 const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
  const router = useRouter();
  const isCreatingChat = useRef(false);

  const { messages, sendMessage, status, regenerate } = useChat({
    id: chatId,
    messages:initialMessages,
  });

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    // If no chatId exists and we're not already creating one, create it first
    if (!currentChatId && !isCreatingChat.current) {
      isCreatingChat.current = true;
      
      try {
        const newChatId = await createChat(userId);
        setCurrentChatId(newChatId);
        
        // Wait a tiny bit for state to update, then redirect
        await new Promise(resolve => setTimeout(resolve, 0));
        router.push(`/chat/${newChatId}`);
        
        // Now send the message with the new chatId
        startTransition(() => {
          sendMessage(
            {
              text: message.text || "Sent with attachments",
              files: message.files,
            },
            {
              body: {
                id: newChatId,
                model,
                webSearch,
              },
            }
          );
          setInput("");
        });
      } catch (error) {
        console.error("Error creating chat:", error);
      } finally {
        isCreatingChat.current = false;
      }
    } else {
      // Chat already exists, just send the message
      startTransition(() => {
        sendMessage(
          {
            text: message.text || "Sent with attachments",
            files: message.files,
          },
          {
            body: {
              id: chatId,
              model,
              webSearch,
            },
          }
        );
        setInput("");
      });
    }
  };

  return (
      <div className="relative flex-1 items-center flex flex-col min-h-0 w-full">
          <Conversation className="w-full">
            <ConversationContent className="max-w-4xl mx-auto w-full pb-40">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === "assistant" &&
                    message.parts.filter((part) => part.type === "source-url")
                      .length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter(
                              (part) => part.type === "source-url"
                            ).length
                          }
                        />
                        {message.parts
                          .filter((part) => part.type === "source-url")
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source
                                key={`${message.id}-${i}`}
                                href={part.url}
                                title={part.url}
                              />
                            </SourcesContent>
                          ))}
                      </Sources>
                    )}
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                <Response>{part.text}</Response>
                              </MessageContent>
                            </Message>
                            {message.role === "assistant" &&
                              i === messages.length - 1 && (
                                <Actions className="mt-2">
                                  <Action
                                    onClick={() => regenerate()}
                                    label="Retry">
                                    <RefreshCcwIcon className="size-3" />
                                  </Action>
                                  <Action
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy">
                                    <CopyIcon className="size-3" />
                                  </Action>
                                </Actions>
                              )}
                          </Fragment>
                        );

                      case "file":
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role} className="p-0">
                              {part.mediaType.startsWith("image/") ? (
                                <Image
                                  src={part.url}
                                  alt={part.filename!!}
                                  width={200}
                                  height={200}
                                  className="rounded-md"
                                />
                              ) : (
                                <MessageContent className="flex items-center p-3 space-x-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="bg-blue-500 p-3 rounded-lg flex items-center justify-center">
                                      <File />
                                    </div>

                                    <div className="flex flex-col">
                                      <span className="font-medium text-sm">
                                        {part.filename}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {part.filename
                                          ?.split(".")[1]
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                </MessageContent>
                              )}
                            </Message>
                          </Fragment>
                        );
                      case "tool-generateImage":
                        const image = part.output as string;
                        console.log("part out put", image);

                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              {part.state === "input-available" && (
                                <Skeleton className="h-50 w-50" />
                              )}
                              {part.state === "output-available" && (
                                <Image
                                  src={image}
                                  alt={`generated_image-${i}`}
                                  width={200}
                                  height={200}
                                  className="rounded-md"
                                />
                              )}
                            </Message>
                          </Fragment>
                        );
                      case "tool-updateImage":
                        const res = part.output as string;
                        console.log("part out put", res);

                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              {part.state === "input-available" && (
                                <Skeleton className="h-50 w-50" />
                              )}
                              {part.state === "output-available" && (
                                <Image
                                  src={res}
                                  alt={`generated_image-${i}`}
                                  width={200}
                                  height={200}
                                  className="rounded-md"
                                />
                              )}
                            </Message>
                          </Fragment>
                        );

                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              status === "streaming" &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }>
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ))}
              {status === "submitted" && <Loader />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
            <div className="absolute bottom-0 flex items-center justify-center w-full pb-3 sm:px-6 px-5">
          <PromptInput
            onSubmit={handleSubmit}
            className="mt-4"
            globalDrop
            multiple
            maxFiles={5}
            maxFileSize={5 * 1024 * 1024}>
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
            </PromptInputBody>
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputButton
                  variant={webSearch ? "default" : "ghost"}
                  onClick={() => setWebSearch(!webSearch)}>
                  <GlobeIcon size={16} className="text-foreground" />
                  <span className="text-foreground">Search</span>
                </PromptInputButton>
                <PromptInputModelSelect
                  onValueChange={(value) => {
                    setModel(value);
                  }}
                  value={model}>
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {models.map((model) => (
                      <PromptInputModelSelectItem
                        key={model.value}
                        value={model.value}>
                        {model.name}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputTools>
              <PromptInputSubmit disabled={!input && !status} status={status} />
            </PromptInputToolbar>
          </PromptInput>
        </div>
        </div>
  );
};

export default Chat;
