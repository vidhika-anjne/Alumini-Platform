"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { type Conversation, getUserConversations } from "@/lib/supabase/chat"
import { useToast } from "@/hooks/use-toast"

interface ChatListProps {
  currentUserId: string
  selectedConversationId?: string
  onSelectConversation: (conversation: Conversation) => void
}

export function ChatList({
  currentUserId,
  selectedConversationId,
  onSelectConversation,
}: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadConversations()
    // Refresh conversations every 30 seconds
    const interval = setInterval(() => loadConversations(false), 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadConversations(showLoading = true) {
    try {
      if (showLoading) setLoading(true)
      const data = await getUserConversations()
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  function getOtherParticipant(conversation: Conversation) {
    return conversation.participant1_id === currentUserId
      ? conversation.participant2
      : conversation.participant1
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation with an alumni or student
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conversation) => {
          const otherParticipant = getOtherParticipant(conversation)
          const isSelected = conversation.id === selectedConversationId
          const isUnread =
            conversation.last_message &&
            !conversation.last_message.is_read &&
            conversation.last_message.sender_id !== currentUserId

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={cn(
                "w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left",
                isSelected && "bg-muted"
              )}
            >
              <Avatar>
                <AvatarFallback>
                  {getInitials(
                    otherParticipant?.full_name ||
                      otherParticipant?.email ||
                      "U"
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">
                      {otherParticipant?.full_name ||
                        otherParticipant?.email ||
                        "Unknown"}
                    </span>
                    {otherParticipant?.role && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {otherParticipant.role}
                      </Badge>
                    )}
                  </div>
                  {conversation.last_message && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(conversation.last_message.created_at)}
                    </span>
                  )}
                </div>
                {conversation.last_message && (
                  <p
                    className={cn(
                      "text-sm truncate",
                      isUnread
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {conversation.last_message.sender_id === currentUserId
                      ? "You: "
                      : ""}
                    {conversation.last_message.content}
                  </p>
                )}
              </div>
              {isUnread && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              )}
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
