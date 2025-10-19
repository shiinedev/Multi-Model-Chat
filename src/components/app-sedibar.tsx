"use client"

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
import { Bot, MessageSquare, Plus, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import {chats} from "@/db/schema"

interface ChatProps{
  chats:typeof chats.$inferSelect[]
}

export function AppSidebar({chats}:ChatProps) {

   const [searchQuery, setSearchQuery] = useState("")



   const filteredChats = chats?.filter((chat) => chat?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
 
 
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-0 hover:bg-transparent">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
                  <Bot className="size-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-foreground ">ChatBot AI</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <div className="mb-4">
          <Button
            asChild
            className="w-full text-white"
          >
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
              onChange={ e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
            Recent Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
             {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild className="group relative h-auto py-2.5 hover:bg-sidebar-accent">
                      <Link href={`/?chatId=${chat.id}`} className="flex items-start gap-3">
                        <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-sidebar-accent-foreground" />
                        <span className="line-clamp-2 flex-1 text-sm text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
                          {chat.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="px-2 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No conversations found</p>
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
  )
}
