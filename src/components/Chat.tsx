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
} from "@/components/ai-elements/prompt-input";
import { Action, Actions } from "@/components/ai-elements/actions";
import { Fragment, startTransition, useEffect, useRef, useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useFocusWhenNoChatIdPresent } from "@/lib/useFocus";
import { MyUIMessage } from "@/lib/chat";
import { Skeleton } from "./ui/skeleton";

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
  initialMessages?: MyUIMessage[];
}

const Chat = ({ initialMessages }: ChatProps) => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [backupChatId, setBackupChatId] = useState(crypto.randomUUID());
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatIdFromSearchParams = searchParams.get("chatId");

  const chatIdInUse = chatIdFromSearchParams || backupChatId;

  const { messages, sendMessage, status, regenerate } = useChat<MyUIMessage>({
    id: chatIdFromSearchParams ?? chatIdInUse,
    messages: initialMessages,
    onData: (message) => {
      console.log("ondata", message);

      if (
        message.type === "data-frontend-action" &&
        message.data === "refresh-sidebar"
      ) {
        router.refresh();
      }
    },
    generateId: () => crypto.randomUUID(),
  });

  console.log("backup id", backupChatId);
  console.log("id with search params", chatIdInUse);

  useEffect(() => {
    setBackupChatId(crypto.randomUUID());
  }, []);

  const ref = useFocusWhenNoChatIdPresent(chatIdFromSearchParams);

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    startTransition(() => {
      sendMessage(
        {
          text: message.text || "Sent with attachments",
          files: message.files,
        },
        {
          body: {
            id: chatIdInUse,
            model,
            webSearch,
          },
        }
      );
      setInput("");
    });

    if (!chatIdFromSearchParams) {
      // router.push(`/?chatId=${chatIdInUse}`);
      window.history.replaceState({}, "", `/?chatId=${chatIdInUse}`);
      setBackupChatId(chatIdInUse);
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
                                <div className="bg-red-500 p-3 rounded-lg flex items-center justify-center">
                                  <File />
                                </div>

                                <div className="flex flex-col">
                                  <span className="font-medium text-sm">
                                    {part.filename}
                                  </span>
                                  <span className="text-xs text-gray-300">
                                    {part.filename?.split(".")[1].toUpperCase()}
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
                    return (
                      <Fragment key={`${message.id}-${i}`}>
                        <Message from={message.role}>
                          {part.state === "input-available" && (
                            <Skeleton className="h-50 w-50" />
                          )}
                          {part.state === "output-available" && (
                            <Image
                              src={part.output}
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
      <div className="absolute bottom-0 flex items-center justify-center w-full  sm:px-6 px-5">
        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4 mb-2 bg-background"
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
              ref={ref}
              autoFocus
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
            <PromptInputSubmit disabled={!input.trim() && !status} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default Chat;



// 'use client';

// import {
//   Branch,
//   BranchMessages,
//   BranchNext,
//   BranchPage,
//   BranchPrevious,
//   BranchSelector,
// } from '@/components/ai-elements/branch';
// import {
//   Conversation,
//   ConversationContent,
//   ConversationScrollButton,
// } from '@/components/ai-elements/conversation';
// import {
//   PromptInput,
//   PromptInputActionAddAttachments,
//   PromptInputActionMenu,
//   PromptInputActionMenuContent,
//   PromptInputActionMenuTrigger,
//   PromptInputAttachment,
//   PromptInputAttachments,
//   PromptInputBody,
//   PromptInputButton,
//   type PromptInputMessage,
//   PromptInputModelSelect,
//   PromptInputModelSelectContent,
//   PromptInputModelSelectItem,
//   PromptInputModelSelectTrigger,
//   PromptInputModelSelectValue,
//   PromptInputSpeechButton,
//   PromptInputSubmit,
//   PromptInputTextarea,
//   PromptInputFooter,
//   PromptInputTools,
// } from '@/components/ai-elements/prompt-input';
// import {
//   Message,
//   MessageAvatar,
//   MessageContent,
// } from '@/components/ai-elements/message';
// import {
//   Reasoning,
//   ReasoningContent,
//   ReasoningTrigger,
// } from '@/components/ai-elements/reasoning';
// import { Response } from '@/components/ai-elements/response';
// import {
//   Source,
//   Sources,
//   SourcesContent,
//   SourcesTrigger,
// } from '@/components/ai-elements/sources';
// import {
//   Suggestion,
//   Suggestions,
// } from '@/components/ai-elements/suggestion';
// import { GlobeIcon } from 'lucide-react';
// import { useState, useCallback, useRef } from 'react';
// import { toast } from 'sonner';
// import type { ToolUIPart } from 'ai';
// import { nanoid } from 'nanoid';

// type MessageType = {
//   key: string;
//   from: 'user' | 'assistant';
//   sources?: { href: string; title: string }[];
//   versions: {
//     id: string;
//     content: string;
//   }[];
//   reasoning?: {
//     content: string;
//     duration: number;
//   };
//   tools?: {
//     name: string;
//     description: string;
//     status: ToolUIPart['state'];
//     parameters: Record<string, unknown>;
//     result: string | undefined;
//     error: string | undefined;
//   }[];
//   avatar: string;
//   name: string;
// };

// const initialMessages: MessageType[] = [
//   {
//     key: nanoid(),
//     from: 'user',
//     versions: [
//       {
//         id: nanoid(),
//         content: 'Can you explain how to use React hooks effectively?',
//       },
//     ],
//     avatar: 'https://github.com/haydenbleasel.png',
//     name: 'Hayden Bleasel',
//   },
//   {
//     key: nanoid(),
//     from: 'assistant',
//     sources: [
//       {
//         href: 'https://react.dev/reference/react',
//         title: 'React Documentation',
//       },
//       {
//         href: 'https://react.dev/reference/react-dom',
//         title: 'React DOM Documentation',
//       },
//     ],
//     tools: [
//       {
//         name: 'mcp',
//         description: 'Searching React documentation',
//         status: 'input-available',
//         parameters: {
//           query: 'React hooks best practices',
//           source: 'react.dev',
//         },
//         result: `{
//   "query": "React hooks best practices",
//   "results": [
//     {
//       "title": "Rules of Hooks",
//       "url": "https://react.dev/warnings/invalid-hook-call-warning",
//       "snippet": "Hooks must be called at the top level of your React function components or custom hooks. Don't call hooks inside loops, conditions, or nested functions."
//     },
//     {
//       "title": "useState Hook",
//       "url": "https://react.dev/reference/react/useState",
//       "snippet": "useState is a React Hook that lets you add state to your function components. It returns an array with two values: the current state and a function to update it."
//     },
//     {
//       "title": "useEffect Hook",
//       "url": "https://react.dev/reference/react/useEffect",
//       "snippet": "useEffect lets you synchronize a component with external systems. It runs after render and can be used to perform side effects like data fetching."
//     }
//   ]
// }`,
//         error: undefined,
//       },
//     ],
//     versions: [
//       {
//         id: nanoid(),
//         content: `# React Hooks Best Practices

// React hooks are a powerful feature that let you use state and other React features without writing classes. Here are some tips for using them effectively:

// ## Rules of Hooks

// 1. **Only call hooks at the top level** of your component or custom hooks
// 2. **Don't call hooks inside loops, conditions, or nested functions**

// ## Common Hooks

// - **useState**: For local component state
// - **useEffect**: For side effects like data fetching
// - **useContext**: For consuming context
// - **useReducer**: For complex state logic
// - **useCallback**: For memoizing functions
// - **useMemo**: For memoizing values

// ## Example of useState and useEffect

// \`\`\`jsx
// function ProfilePage({ userId }) {
//   const [user, setUser] = useState(null);
  
//   useEffect(() => {
//     // This runs after render and when userId changes
//     fetchUser(userId).then(userData => {
//       setUser(userData);
//     });
//   }, [userId]);
  
//   return user ? <Profile user={user} /> : <Loading />;
// }
// \`\`\`

// Would you like me to explain any specific hook in more detail?`,
//       },
//     ],
//     avatar: 'https://github.com/openai.png',
//     name: 'OpenAI',
//   },
//   {
//     key: nanoid(),
//     from: 'user',
//     versions: [
//       {
//         id: nanoid(),
//         content:
//           'Yes, could you explain useCallback and useMemo in more detail? When should I use one over the other?',
//       },
//       {
//         id: nanoid(),
//         content:
//           "I'm particularly interested in understanding the performance implications of useCallback and useMemo. Could you break down when each is most appropriate?",
//       },
//       {
//         id: nanoid(),
//         content:
//           'Thanks for the overview! Could you dive deeper into the specific use cases where useCallback and useMemo make the biggest difference in React applications?',
//       },
//     ],
//     avatar: 'https://github.com/haydenbleasel.png',
//     name: 'Hayden Bleasel',
//   },
//   {
//     key: nanoid(),
//     from: 'assistant',
//     reasoning: {
//       content: `The user is asking for a detailed explanation of useCallback and useMemo. I should provide a clear and concise explanation of each hook's purpose and how they differ.
      
// The useCallback hook is used to memoize functions to prevent unnecessary re-renders of child components that receive functions as props.

// The useMemo hook is used to memoize values to avoid expensive recalculations on every render.

// Both hooks help with performance optimization, but they serve different purposes.`,
//       duration: 10,
//     },
//     versions: [
//       {
//         id: nanoid(),
//         content: `## useCallback vs useMemo

// Both hooks help with performance optimization, but they serve different purposes:

// ### useCallback

// \`useCallback\` memoizes **functions** to prevent unnecessary re-renders of child components that receive functions as props.

// \`\`\`jsx
// // Without useCallback - a new function is created on every render
// const handleClick = () => {
//   console.log(count);
// };

// // With useCallback - the function is only recreated when dependencies change
// const handleClick = useCallback(() => {
//   console.log(count);
// }, [count]);
// \`\`\`

// ### useMemo

// \`useMemo\` memoizes **values** to avoid expensive recalculations on every render.

// \`\`\`jsx
// // Without useMemo - expensive calculation runs on every render
// const sortedList = expensiveSort(items);

// // With useMemo - calculation only runs when items change
// const sortedList = useMemo(() => expensiveSort(items), [items]);
// \`\`\`

// ### When to use which?

// - Use **useCallback** when:
//   - Passing callbacks to optimized child components that rely on reference equality
//   - Working with event handlers that you pass to child components

// - Use **useMemo** when:
//   - You have computationally expensive calculations
//   - You want to avoid recreating objects that are used as dependencies for other hooks

// ### Performance Note

// Don't overuse these hooks! They come with their own overhead. Only use them when you have identified a genuine performance issue.`,
//       },
//     ],
//     avatar: 'https://github.com/openai.png',
//     name: 'OpenAI',
//   },
// ];

// const models = [
//   { id: 'gpt-4', name: 'GPT-4' },
//   { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
//   { id: 'claude-2', name: 'Claude 2' },
//   { id: 'claude-instant', name: 'Claude Instant' },
//   { id: 'palm-2', name: 'PaLM 2' },
//   { id: 'llama-2-70b', name: 'Llama 2 70B' },
//   { id: 'llama-2-13b', name: 'Llama 2 13B' },
//   { id: 'cohere-command', name: 'Command' },
//   { id: 'mistral-7b', name: 'Mistral 7B' },
// ];

// const suggestions = [
//   'What are the latest trends in AI?',
//   'How does machine learning work?',
//   'Explain quantum computing',
//   'Best practices for React development',
//   'Tell me about TypeScript benefits',
//   'How to optimize database queries?',
//   'What is the difference between SQL and NoSQL?',
//   'Explain cloud computing basics',
// ];

// const mockResponses = [
//   "That's a great question! Let me help you understand this concept better. The key thing to remember is that proper implementation requires careful consideration of the underlying principles and best practices in the field.",
//   "I'd be happy to explain this topic in detail. From my understanding, there are several important factors to consider when approaching this problem. Let me break it down step by step for you.",
//   "This is an interesting topic that comes up frequently. The solution typically involves understanding the core concepts and applying them in the right context. Here's what I recommend...",
//   "Great choice of topic! This is something that many developers encounter. The approach I'd suggest is to start with the fundamentals and then build up to more complex scenarios.",
//   "That's definitely worth exploring. From what I can see, the best way to handle this is to consider both the theoretical aspects and practical implementation details.",
// ];

// const Example = () => {
//   const [model, setModel] = useState<string>(models[0].id);
//   const [text, setText] = useState<string>('');
//   const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
//   const [status, setStatus] = useState<
//     'submitted' | 'streaming' | 'ready' | 'error'
//   >('ready');
//   const [messages, setMessages] = useState<MessageType[]>(initialMessages);
//   const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
//     null,
//   );
//   const shouldCancelRef = useRef<boolean>(false);
//   const addMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   const stop = useCallback(() => {
//     console.log('Stopping generation...');

//     // Set cancellation flag
//     shouldCancelRef.current = true;

//     // Clear timeout for adding assistant message
//     if (addMessageTimeoutRef.current) {
//       clearTimeout(addMessageTimeoutRef.current);
//       addMessageTimeoutRef.current = null;
//     }

//     setStatus('ready');
//     setStreamingMessageId(null);
//   }, []);

//   const streamResponse = useCallback(
//     async (messageId: string, content: string) => {
//       setStatus('streaming');
//       setStreamingMessageId(messageId);
//       shouldCancelRef.current = false;

//       const words = content.split(' ');
//       let currentContent = '';

//       for (let i = 0; i < words.length; i++) {
//         // Check if streaming should be cancelled
//         if (shouldCancelRef.current) {
//           setStatus('ready');
//           setStreamingMessageId(null);
//           return;
//         }

//         currentContent += (i > 0 ? ' ' : '') + words[i];

//         setMessages((prev) =>
//           prev.map((msg) => {
//             if (msg.versions.some((v) => v.id === messageId)) {
//               return {
//                 ...msg,
//                 versions: msg.versions.map((v) =>
//                   v.id === messageId ? { ...v, content: currentContent } : v,
//                 ),
//               };
//             }
//             return msg;
//           }),
//         );

//         await new Promise((resolve) =>
//           setTimeout(resolve, Math.random() * 100 + 50),
//         );
//       }

//       setStatus('ready');
//       setStreamingMessageId(null);
//     },
//     [],
//   );

//   const addUserMessage = useCallback(
//     (content: string) => {
//       const userMessage: MessageType = {
//         key: `user-${Date.now()}`,
//         from: 'user',
//         versions: [
//           {
//             id: `user-${Date.now()}`,
//             content,
//           },
//         ],
//         avatar: 'https://github.com/haydenbleasel.png',
//         name: 'User',
//       };

//       setMessages((prev) => [...prev, userMessage]);

//       addMessageTimeoutRef.current = setTimeout(() => {
//         const assistantMessageId = `assistant-${Date.now()}`;
//         const randomResponse =
//           mockResponses[Math.floor(Math.random() * mockResponses.length)];

//         const assistantMessage: MessageType = {
//           key: `assistant-${Date.now()}`,
//           from: 'assistant',
//           versions: [
//             {
//               id: assistantMessageId,
//               content: '',
//             },
//           ],
//           avatar: 'https://github.com/openai.png',
//           name: 'Assistant',
//         };

//         setMessages((prev) => [...prev, assistantMessage]);
//         streamResponse(assistantMessageId, randomResponse);
//         addMessageTimeoutRef.current = null;
//       }, 500);
//     },
//     [streamResponse],
//   );

//   const handleSubmit = (message: PromptInputMessage) => {
//     // If currently streaming or submitted, stop instead of submitting
//     if (status === 'streaming' || status === 'submitted') {
//       stop();
//       return;
//     }

//     const hasText = Boolean(message.text);
//     const hasAttachments = Boolean(message.files?.length);

//     if (!(hasText || hasAttachments)) {
//       return;
//     }

//     setStatus('submitted');

//     if (message.files?.length) {
//       toast.success('Files attached', {
//         description: `${message.files.length} file(s) attached to message`,
//       });
//     }

//     addUserMessage(message.text || 'Sent with attachments');
//     setText('');
//   };

//   const handleSuggestionClick = (suggestion: string) => {
//     setStatus('submitted');
//     addUserMessage(suggestion);
//   };

//   return (
//     <div className="relative flex size-full flex-col divide-y overflow-hidden">
//       <Conversation>
//         <ConversationContent>
//           {messages.map(({ versions, ...message }) => (
//             <Branch defaultBranch={0} key={message.key}>
//               <BranchMessages>
//                 {versions.map((version) => (
//                   <Message
//                     from={message.from}
//                     key={`${message.key}-${version.id}`}
//                   >
//                     <div>
//                       {message.sources?.length && (
//                         <Sources>
//                           <SourcesTrigger count={message.sources.length} />
//                           <SourcesContent>
//                             {message.sources.map((source) => (
//                               <Source
//                                 href={source.href}
//                                 key={source.href}
//                                 title={source.title}
//                               />
//                             ))}
//                           </SourcesContent>
//                         </Sources>
//                       )}
//                       {message.reasoning && (
//                         <Reasoning duration={message.reasoning.duration}>
//                           <ReasoningTrigger />
//                           <ReasoningContent>
//                             {message.reasoning.content}
//                           </ReasoningContent>
//                         </Reasoning>
//                       )}
//                       <MessageContent>
//                         <Response>{version.content}</Response>
//                       </MessageContent>
//                     </div>
//                     <MessageAvatar name={message.name} src={message.avatar} />
//                   </Message>
//                 ))}
//               </BranchMessages>
//               {versions.length > 1 && (
//                 <BranchSelector from={message.from}>
//                   <BranchPrevious />
//                   <BranchPage />
//                   <BranchNext />
//                 </BranchSelector>
//               )}
//             </Branch>
//           ))}
//         </ConversationContent>
//         <ConversationScrollButton />
//       </Conversation>
//       <div className="grid shrink-0 gap-4 pt-4">
//         <Suggestions className="px-4">
//           {suggestions.map((suggestion) => (
//             <Suggestion
//               key={suggestion}
//               onClick={() => handleSuggestionClick(suggestion)}
//               suggestion={suggestion}
//             />
//           ))}
//         </Suggestions>
//         <div className="w-full px-4 pb-4">
//           <PromptInput globalDrop multiple onSubmit={handleSubmit}>
//             <PromptInputBody>
//               <PromptInputAttachments>
//                 {(attachment) => <PromptInputAttachment data={attachment} />}
//               </PromptInputAttachments>
//               <PromptInputTextarea
//                 onChange={(event) => setText(event.target.value)}
//                 ref={textareaRef}
//                 value={text}
//               />
//             </PromptInputBody>
//             <PromptInputFooter>
//               <PromptInputTools>
//                 <PromptInputActionMenu>
//                   <PromptInputActionMenuTrigger />
//                   <PromptInputActionMenuContent>
//                     <PromptInputActionAddAttachments />
//                   </PromptInputActionMenuContent>
//                 </PromptInputActionMenu>
//                 <PromptInputSpeechButton
//                   onTranscriptionChange={setText}
//                   textareaRef={textareaRef}
//                 />
//                 <PromptInputButton
//                   onClick={() => setUseWebSearch(!useWebSearch)}
//                   variant={useWebSearch ? 'default' : 'ghost'}
//                 >
//                   <GlobeIcon size={16} />
//                   <span>Search</span>
//                 </PromptInputButton>
//                 <PromptInputModelSelect onValueChange={setModel} value={model}>
//                   <PromptInputModelSelectTrigger>
//                     <PromptInputModelSelectValue />
//                   </PromptInputModelSelectTrigger>
//                   <PromptInputModelSelectContent>
//                     {models.map((model) => (
//                       <PromptInputModelSelectItem
//                         key={model.id}
//                         value={model.id}
//                       >
//                         {model.name}
//                       </PromptInputModelSelectItem>
//                     ))}
//                   </PromptInputModelSelectContent>
//                 </PromptInputModelSelect>
//               </PromptInputTools>
//               <PromptInputSubmit
//                 disabled={(!text.trim() && !status) || status === 'streaming'}
//                 status={status}
//               />
//             </PromptInputFooter>
//           </PromptInput>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Example;
