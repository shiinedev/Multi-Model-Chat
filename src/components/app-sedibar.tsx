"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { NavUser } from "./ui/nav-user";
import {
  Bot,
  Check,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { chats,user } from "@/db/schema";
import { deleteChat, updateChat } from "@/lib/chat";
import { useRouter } from "next/navigation";

interface ChatProps {
  initialChats: (typeof chats.$inferSelect)[];
  chatId: string;
  userId:string
}

export function AppSidebar({ initialChats, chatId ,userId}: ChatProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();

  const filteredChats = initialChats?.filter((chat) =>
    chat?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    // setChats(chats.filter((chat) => chat.id !== id))
    if(userId){
      await deleteChat(id,userId);
      router.push("/")
    }
  };

  const handleEditStart = (chat: typeof chats.$inferSelect) => {
    setEditingId(chat.id);
    setEditingTitle(chat?.title ?? "");
  };

  const handleEditSave = async(id: string) => {
    console.log("updatedSave",id);
    
    if (editingTitle.trim()) {
      await updateChat(id,editingTitle);
      router.refresh()
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-0 hover:bg-transparent">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
                  <Bot className="size-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-foreground ">
                  ChatBot AI
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <div className="mb-4">
          <Button asChild className="w-full text-white">
            <Link href="/">
              <Plus className="size-4" />
              New Chat
            </Link>
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="h-9 bg-sidebar-accent pl-9 text-sm placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
            Recent Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {filteredChats?.length > 0 ? (
                filteredChats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <div
                      className="group relative"
                      onMouseEnter={() => setHoveredId(chat.id)}
                      onMouseLeave={() => setHoveredId(null)}>
                      {editingId === chat.id ? (
                        <div className="flex items-center gap-1 rounded-md bg-sidebar-accent px-1 py-2.5">
              
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-7 flex-1 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditSave(chat.id);
                              if (e.key === "Escape") handleEditCancel();
                            }}
                          />
                          <div className="flex items-center ">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 shrink-0"
                            onClick={() => handleEditSave(chat.id)}>
                            <Check className="size-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 shrink-0"
                            onClick={handleEditCancel}>
                            <X className="size-3.5" />
                          </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <SidebarMenuButton
                            asChild
                            isActive={chat.id === chatId}
                            className="h-auto py-2.5 hover:bg-sidebar-accent">
                            <Link
                              href={`/?chatId=${chat.id}`}
                              className="flex items-start gap-3 pr-16">
                              <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-sidebar-accent-foreground" />
                              <span className="line-clamp-2 flex-1 text-sm text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
                                {chat.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                          <div
                            className={`absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 transition-opacity ${
                              hoveredId === chat.id
                                ? "opacity-100"
                                : "pointer-events-none opacity-0"
                            }`}>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 hover:bg-sidebar-accent cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditStart(chat);
                              }}>
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="size-6 hover:text-destructive-foreground cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(chat.id);
                              }}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="px-2 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No conversations found
                  </p>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

// "use client"

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"
// import Link from "next/link"
// import { NavUser } from "./ui/nav-user"
// import { Bot, Plus, MessageSquare, Search, Pencil, Trash2, Check, X } from "lucide-react"
// import { Button } from "./ui/button"
// import { Input } from "./ui/input"
// import { useState } from "react"

// type Chat = {
//   id: string
//   title: string
// }

// const initialMockChats: Chat[] = [
//   { id: "1", title: "How to build a React app with TypeScript?" },
//   { id: "2", title: "Explain the difference between let and const" },
//   { id: "3", title: "Best practices for API design" },
//   { id: "4", title: "What is the virtual DOM in React?" },
//   { id: "5", title: "How to optimize Next.js performance?" },
// ]

// export function AppSidebar() {
//   const [searchQuery, setSearchQuery] = useState("")
//   const [chats, setChats] = useState<Chat[]>(initialMockChats)
//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [editingTitle, setEditingTitle] = useState("")
//   const [hoveredId, setHoveredId] = useState<string | null>(null)

//   const filteredChats = chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

//   const handleDelete = (id: string) => {
//     setChats(chats.filter((chat) => chat.id !== id))
//   }

//   const handleEditStart = (chat: Chat) => {
//     setEditingId(chat.id)
//     setEditingTitle(chat.title)
//   }

//   const handleEditSave = (id: string) => {
//     if (editingTitle.trim()) {
//       setChats(chats.map((chat) => (chat.id === id ? { ...chat, title: editingTitle } : chat)))
//     }
//     setEditingId(null)
//     setEditingTitle("")
//   }

//   const handleEditCancel = () => {
//     setEditingId(null)
//     setEditingTitle("")
//   }

//   return (
//     <Sidebar className="border-r border-sidebar-border">
//       <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-0 hover:bg-transparent">
//               <Link href="/" className="flex items-center gap-3">
//                 <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
//                   <Bot className="size-5 text-sidebar-primary-foreground" />
//                 </div>
//                 <span className="text-lg font-semibold text-sidebar-foreground">ChatBot AI</span>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>

//       <SidebarContent className="px-3 py-4">
//         <div className="mb-4">
//           <Button
//             asChild
//             className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
//           >
//             <Link href="/">
//               <Plus className="size-4" />
//               New Chat
//             </Link>
//           </Button>
//         </div>

//         <div className="mb-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search conversations..."
//               className="h-9 bg-sidebar-accent pl-9 text-sm placeholder:text-muted-foreground"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </div>

//         <SidebarGroup>
//           <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
//             Recent Conversations
//           </SidebarGroupLabel>
//           <SidebarGroupContent className="mt-2">
//             <SidebarMenu className="space-y-1">
//               {filteredChats.length > 0 ? (
//                 filteredChats.map((chat) => (
//                   <SidebarMenuItem key={chat.id}>
//                     <div
//                       className="group relative"
//                       onMouseEnter={() => setHoveredId(chat.id)}
//                       onMouseLeave={() => setHoveredId(null)}
//                     >
//                       {editingId === chat.id ? (
//                         <div className="flex items-center gap-2 rounded-md bg-sidebar-accent px-3 py-2.5">
//                           <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
//                           <Input
//                             value={editingTitle}
//                             onChange={(e) => setEditingTitle(e.target.value)}
//                             className="h-7 flex-1 text-sm"
//                             autoFocus
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") handleEditSave(chat.id)
//                               if (e.key === "Escape") handleEditCancel()
//                             }}
//                           />
//                           <Button
//                             size="icon"
//                             variant="ghost"
//                             className="size-7 shrink-0"
//                             onClick={() => handleEditSave(chat.id)}
//                           >
//                             <Check className="size-3.5" />
//                           </Button>
//                           <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={handleEditCancel}>
//                             <X className="size-3.5" />
//                           </Button>
//                         </div>
//                       ) : (
//                         <>
//                           <SidebarMenuButton asChild className="h-auto py-2.5 hover:bg-sidebar-accent">
//                             <Link href={`/chat/${chat.id}`} className="flex items-start gap-3 pr-16">
//                               <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-sidebar-accent-foreground" />
//                               <span className="line-clamp-2 flex-1 text-sm text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
//                                 {chat.title}
//                               </span>
//                             </Link>
//                           </SidebarMenuButton>
//                           <div
//                             className={`absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 transition-opacity ${
//                               hoveredId === chat.id ? "opacity-100" : "pointer-events-none opacity-0"
//                             }`}
//                           >
//                             <Button
//                               size="icon"
//                               variant="ghost"
//                               className="size-7 hover:bg-sidebar-accent"
//                               onClick={(e) => {
//                                 e.preventDefault()
//                                 handleEditStart(chat)
//                               }}
//                             >
//                               <Pencil className="size-3.5" />
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="ghost"
//                               className="size-7 hover:bg-destructive hover:text-destructive-foreground"
//                               onClick={(e) => {
//                                 e.preventDefault()
//                                 handleDelete(chat.id)
//                               }}
//                             >
//                               <Trash2 className="size-3.5" />
//                             </Button>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </SidebarMenuItem>
//                 ))
//               ) : (
//                 <div className="px-2 py-8 text-center">
//                   <p className="text-sm text-muted-foreground">No conversations found</p>
//                 </div>
//               )}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter className="border-t border-sidebar-border p-3">
//         <NavUser />
//       </SidebarFooter>
//     </Sidebar>
//   )
// }
