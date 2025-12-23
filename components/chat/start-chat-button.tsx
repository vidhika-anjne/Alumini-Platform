"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getOrCreateConversation } from "@/lib/supabase/chat"

interface StartChatButtonProps {
  userId: string
  userName: string
  userRole: string
  onChatStarted: (conversationId: string) => void
}

export function StartChatButton({
  userId,
  userName,
  userRole,
  onChatStarted,
}: StartChatButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleStartChat() {
    try {
      setLoading(true)
      const conversationId = await getOrCreateConversation(userId)
      onChatStarted(conversationId)
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Conversation</DialogTitle>
          <DialogDescription>
            Send a message to {userName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Avatar>
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{userName}</p>
              <Badge variant="secondary" className="text-xs capitalize">
                {userRole}
              </Badge>
            </div>
          </div>
          <Button
            onClick={handleStartChat}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Starting..." : "Start Conversation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
