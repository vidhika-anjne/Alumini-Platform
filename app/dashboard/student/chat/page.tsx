"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { ChatList } from "@/components/chat/chat-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { UserList } from "@/components/chat/user-list"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Conversation, getUserConversations } from "@/lib/supabase/chat"
import { createClient } from "@/lib/supabase/client"

export default function StudentChatPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [currentUserRole, setCurrentUserRole] = useState<string>("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeTab, setActiveTab] = useState<string>("conversations")
  const searchParams = useSearchParams()

  useEffect(() => {
    async function getCurrentUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        
        // Get user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setCurrentUserRole(profile.role)
        }
      }
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    // Auto-select conversation from query param
    const conversationId = searchParams.get("conversation")
    if (conversationId && conversations.length > 0 && currentUserId) {
      const conv = conversations.find((c) => c.id === conversationId)
      if (conv) {
        setSelectedConversation(conv)
      }
    }
  }, [searchParams, conversations, currentUserId])

  useEffect(() => {
    if (currentUserId) {
      loadConversations()
    }
  }, [currentUserId])

  async function loadConversations() {
    try {
      const data = await getUserConversations()
      setConversations(data)
      return data
    } catch (error) {
      console.error("Failed to load conversations:", error)
      return []
    }
  }

  function handleSelectConversation(conversation: Conversation) {
    setSelectedConversation(conversation)
    setActiveTab("conversations")
  }

  async function handleChatStart(conversationId: string) {
    // Reload conversations
    const updatedConversations = await loadConversations()
    
    // Find and select the conversation
    const conv = updatedConversations.find(c => c.id === conversationId)
    if (conv) {
      setSelectedConversation(conv)
      setActiveTab("conversations")
    } else {
      // If not found, manually fetch it
      const supabase = createClient()
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()
      
      if (data) {
        const { data: participant1 } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('id', data.participant1_id)
          .single()

        const { data: participant2 } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('id', data.participant2_id)
          .single()

        setSelectedConversation({
          ...data,
          participant1,
          participant2
        } as Conversation)
        setActiveTab("conversations")
      }
    }
  }

  function getOtherParticipant(conversation: Conversation) {
    return conversation.participant1_id === currentUserId
      ? conversation.participant2
      : conversation.participant1
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Chat with alumni and get guidance for your career
        </p>
      </div>

      <Card className="h-[calc(100vh-220px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Sidebar with tabs */}
          <div className="border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Messages</h2>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="conversations" className="flex-1">
                  Chats
                </TabsTrigger>
                <TabsTrigger value="users" className="flex-1">
                  All Alumni
                </TabsTrigger>
              </TabsList>
              <TabsContent value="conversations" className="flex-1 mt-0">
                <ChatList
                  currentUserId={currentUserId}
                  selectedConversationId={selectedConversation?.id}
                  onSelectConversation={handleSelectConversation}
                />
              </TabsContent>
              <TabsContent value="users" className="flex-1 mt-0">
                <UserList
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  onChatStart={handleChatStart}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Window */}
          <div className="col-span-2">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                currentUserId={currentUserId}
                otherUserName={
                  getOtherParticipant(selectedConversation)?.full_name ||
                  getOtherParticipant(selectedConversation)?.email ||
                  "Unknown"
                }
                otherUserRole={
                  getOtherParticipant(selectedConversation)?.role || "user"
                }
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-xl mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
