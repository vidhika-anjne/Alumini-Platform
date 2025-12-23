"use client"

import { useEffect, useState } from "react"
import { Search, Loader2, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { getOrCreateConversation } from "@/lib/supabase/chat"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  full_name: string | null
  email: string
  role: string
}

interface UserListProps {
  currentUserId: string
  currentUserRole: string
  onChatStart: (conversationId: string) => void
}

export function UserList({ currentUserId, currentUserRole, onChatStart }: UserListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [startingChatWith, setStartingChatWith] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  async function loadUsers() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get all users except current user
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .neq('id', currentUserId)
        .order('full_name')

      if (error) {
        console.error('Error loading users:', error)
        throw error
      }

      // If current user is student, show only verified alumni
      // If current user is alumni, show students and other alumni
      let filteredData = data || []
      
      if (currentUserRole === 'student') {
        // For students, only show verified alumni
        const { data: verifiedAlumni, error: alumniError } = await supabase
          .from('alumni_profiles')
          .select('id')
          .eq('is_verified', true)

        if (!alumniError && verifiedAlumni) {
          const verifiedIds = verifiedAlumni.map(a => a.id)
          filteredData = filteredData.filter(u => verifiedIds.includes(u.id))
        }
      }

      setUsers(filteredData)
      setFilteredUsers(filteredData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleStartChat(userId: string) {
    try {
      setStartingChatWith(userId)
      const conversationId = await getOrCreateConversation(userId)
      onChatStart(conversationId)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      })
    } finally {
      setStartingChatWith(null)
    }
  }

  function getInitials(name: string | null, email: string) {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No users found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Try a different search" : "No users available to chat with"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleStartChat(user.id)}
                disabled={startingChatWith === user.id}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <Avatar>
                  <AvatarFallback>
                    {getInitials(user.full_name, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm truncate">
                      {user.full_name || user.email}
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {user.role}
                    </Badge>
                  </div>
                  {user.full_name && (
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  )}
                </div>
                {startingChatWith === user.id && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
