import { createClient } from './client'

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  updated_at: string
  sender?: {
    id: string
    full_name: string | null
    email: string
    role: string
  }
}

export type Conversation = {
  id: string
  participant1_id: string
  participant2_id: string
  created_at: string
  updated_at: string
  participant1?: {
    id: string
    full_name: string | null
    email: string
    role: string
  }
  participant2?: {
    id: string
    full_name: string | null
    email: string
    role: string
  }
  last_message?: Message
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(otherUserId: string) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Use the database function to get or create conversation
  const { data, error } = await supabase
    .rpc('get_or_create_conversation', {
      user1_id: user.id,
      user2_id: otherUserId
    })

  if (error) throw error
  return data as string
}

/**
 * Get all conversations for the current user with participant details and last message
 */
export async function getUserConversations() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // First, get conversations
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  if (convError) {
    console.error('Error fetching conversations:', convError)
    throw convError
  }

  if (!conversations || conversations.length === 0) {
    return []
  }

  // Fetch participant details for each conversation
  const conversationsWithDetails = await Promise.all(
    conversations.map(async (conv) => {
      // Get participant1 details
      const { data: participant1 } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', conv.participant1_id)
        .single()

      // Get participant2 details
      const { data: participant2 } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', conv.participant2_id)
        .single()

      // Get last message
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        ...conv,
        participant1,
        participant2,
        last_message: lastMessage
      }
    })
  )

  return conversationsWithDetails as Conversation[]
}

/**
 * Get messages for a specific conversation
 */
export async function getConversationMessages(conversationId: string) {
  const supabase = createClient()
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Fetch sender details for each message
  const messagesWithSenders = await Promise.all(
    (messages || []).map(async (message) => {
      const { data: sender } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', message.sender_id)
        .single()

      return {
        ...message,
        sender
      }
    })
  )

  return messagesWithSenders as Message[]
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId: string, content: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    })
    .select('*')
    .single()

  if (error) throw error

  // Get sender details
  const { data: sender } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .single()

  // Update conversation's updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return {
    ...data,
    sender
  } as Message
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  if (error) throw error
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void
) {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        // Fetch the full message with sender details
        const { data: message } = await supabase
          .from('messages')
          .select('*')
          .eq('id', payload.new.id)
          .single()

        if (message) {
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('id', message.sender_id)
            .single()

          onMessage({
            ...message,
            sender
          } as Message)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Get unread message count for the current user
 */
export async function getUnreadMessageCount() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all conversations for the user
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)

  if (!conversations) return 0

  const conversationIds = conversations.map(c => c.id)

  // Count unread messages in these conversations
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  if (error) throw error
  return count || 0
}
