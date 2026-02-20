import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

// Helper for date headers like WhatsApp
const formatDateDivider = (dateString) => {
  const d = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  
  return d.toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

export default function Chat() {
  const { token, user } = useAuth()
  const { theme } = useTheme()
  const currentId = useMemo(() => (user?.enrollmentNumber || user?.alumniId || user?.id || ''), [user])
  const baseURL = api.defaults.baseURL || 'http://localhost:8080'

  const [conversations, setConversations] = useState([])
  const [connectedUsers, setConnectedUsers] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [typingMap, setTypingMap] = useState({})
  const [chatError, setChatError] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const isDark = theme === 'dark'
  const themed = (darkClass, lightClass) => (isDark ? darkClass : lightClass)

  const stompRef = useRef(null)
  const typingTimer = useRef(null)
  const messagesEndRef = useRef(null)
  const observer = useRef()

  // Last message cursor for infinite scroll
  const oldestMessageId = useMemo(() => {
    const id = messages[0]?.id;
    console.log('DEBUG: oldestMessageId calculated as:', id);
    return id;
  }, [messages])

  // Group messages by date
  const groupedMessages = useMemo(() => {
    console.log('DEBUG: Grouping', messages.length, 'messages');
    const groups = {}
    messages.forEach(m => {
      const date = new Date(m.sentAt).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(m)
    })
    console.log('DEBUG: Created', Object.keys(groups).length, 'date groups');
    return groups
  }, [messages])

  const groupedDates = useMemo(() => Object.keys(groupedMessages), [groupedMessages])

  // Infinite scroll observer
  const lastMessageElementRef = useCallback(node => {
    if (isLoadingMessages) {
      console.log('DEBUG: Not attaching observer - already loading');
      return;
    }
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      console.log('DEBUG: IntersectionObserver triggered, entry intersecting:', entries[0].isIntersecting, 'hasMore:', hasMore);
      if (entries[0].isIntersecting && hasMore && !isLoadingMessages) {
        console.log('👀 Oldest message is visible! Loading more...');
        loadMoreMessages()
      }
    }, {
      root: null, // Use viewport instead of .messages-area for more reliable detection
      rootMargin: '100px', // Trigger slightly before the element is fully visible
      threshold: 0.1
    })
    
    if (node) {
      console.log('DEBUG: Attached observer to oldest message element');
      observer.current.observe(node);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMessages, hasMore, oldestMessageId]) // Re-run when these change

  const loadMoreMessages = () => {
    if (!selectedConv || isLoadingMessages || !hasMore) {
      console.log('DEBUG: loadMoreMessages blocked - conv:', !!selectedConv, 'loading:', isLoadingMessages, 'hasMore:', hasMore);
      return;
    }
    
    // Check if we actually have a cursor
    if (!oldestMessageId) {
      console.log('DEBUG: No cursor available yet, skipping load');
      return;
    }

    console.log('🔄 loadMoreMessages triggered! cursor:', oldestMessageId);
    
    setIsLoadingMessages(true)
    api.get(`/api/v1/conversations/${selectedConv.id}/messages`, {
      params: { cursor: oldestMessageId, limit: 20 }
    })
    .then(res => {
      console.log('✅ loadMoreMessages success! received:', res.data?.length || 0, 'messages');
      
      if (!res.data || res.data.length === 0) {
        console.log('🏁 No more older messages found.');
        setHasMore(false);
        setIsLoadingMessages(false);
        return;
      }

      if (res.data.length < 20) {
        console.log('🏁 Reached oldest message in history.');
        setHasMore(false);
      }

      // Verify no duplicates before prepending
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = res.data.filter(m => !existingIds.has(m.id));
        console.log('DEBUG: Prepending', newMessages.length, 'unique messages (filtered', res.data.length - newMessages.length, 'duplicates)');
        return [...newMessages, ...prev];
      });
      
      setIsLoadingMessages(false)
    })
    .catch(err => {
      console.error("❌ Failed to load more messages:", err.response?.data || err.message)
      // On error, stop trying to load more to prevent infinite retries
      setHasMore(false);
      setIsLoadingMessages(false)
    })
  }

  // Auto-scroll to bottom when new messages arrive (only if it's a new message, not history)
  const prevMessagesLength = useRef(messages.length)
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
        // Only scroll if the last message is new (not loading history)
        const lastMsg = messages[messages.length - 1]
        const secondToLastMsg = messages[messages.length - 2]
        
        if (!secondToLastMsg || lastMsg.id > secondToLastMsg.id) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }
    prevMessagesLength.current = messages.length
  }, [messages])

  // Load user's conversations on mount
  useEffect(() => {
    if (!token) return
    console.log('📋 Fetching conversations for current user')
    api
      .get('/api/v1/participants/me/conversations')
      .then((res) => {
        console.log('✅ Conversations loaded:', res.data)
        setConversations(res.data || [])
      })
      .catch((err) => {
        console.error('❌ Failed to load conversations:', err?.response?.data || err.message)
        setConversations([])
      })
  }, [token])

  // Load connected users (ONLY ACCEPTED connections)
  useEffect(() => {
    if (!token) return
    api.get('/api/v1/connections/mine/users')
      .then(res => {
        console.log('✅ Connected users loaded:', res.data)
        setConnectedUsers(res.data || [])
      })
      .catch(err => console.error("❌ Failed to load connections:", err))
  }, [token])

  // Fetch message history when selecting a conversation
  useEffect(() => {
    if (!selectedConv) {
      console.log('DEBUG: No conversation selected, clearing messages');
      setMessages([])
      setHasMore(true) // Reset for next conversation
      return
    }
    
    console.log('DEBUG: Loading messages for conversation:', selectedConv.id);
    setMessages([]) 
    setHasMore(true)
    setIsLoadingMessages(true)
    
    api.get(`/api/v1/conversations/${selectedConv.id}/messages`, { 
        params: { limit: 20 } 
    })
    .then((res) => {
      console.log('DEBUG: Initial load received', res.data?.length || 0, 'messages');
      if (res.data && res.data.length > 0) {
        console.log('DEBUG: First msg id:', res.data[0].id, 'Last msg id:', res.data[res.data.length-1].id);
        console.log('DEBUG: Verifying order - messages should be oldest→newest');
      }
      
      const messages = res.data || [];
      // Verify messages are in ascending order (oldest → newest)
      if (messages.length > 1) {
        const isOrdered = messages.every((msg, idx) => 
          idx === 0 || messages[idx - 1].id < msg.id
        );
        if (!isOrdered) {
          console.warn('⚠️ Messages NOT in ascending order! Sorting...');
          messages.sort((a, b) => a.id - b.id);
        }
      }
      
      setMessages(messages)
      if (messages.length < 20) setHasMore(false)
      setIsLoadingMessages(false)
    })
    .catch((err) => {
      console.error('❌ Failed to load messages:', err.response?.data || err.message)
      setMessages([])
      setHasMore(false) // Don't attempt to load more on error
      setIsLoadingMessages(false)
    })
  }, [selectedConv])

  // Connect to WebSocket when a conversation is selected
  useEffect(() => {
    if (!token || !selectedConv) return

    console.log('🔌 Connecting WebSocket for conversation:', selectedConv.id)
    setIsConnected(false)
    
    const client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS(`${baseURL}/ws-chat?token=${encodeURIComponent(token)}`),
      reconnectDelay: 3000,
      onConnect: () => {
        console.log('✅ WebSocket connected')
        setIsConnected(true)
        setChatError('')
        
        // Subscribe to personal message queue
        client.subscribe('/user/queue/messages', (frame) => {
          try {
            console.log('📨 Received message:', frame.body)
            const msg = JSON.parse(frame.body)
            if (msg.conversationId === selectedConv.id) {
              // Prevent duplicates - check by ID or match optimistic messages
              setMessages((prev) => {
                // Check if message with this ID already exists
                const existsById = prev.some(m => m.id === msg.id)
                if (existsById) {
                  console.log('⚠️ Message already exists by ID, skipping:', msg.id)
                  return prev
                }
                
                // Check for optimistic message (same sender, content, within last 5 seconds)
                const now = new Date();
                const optimisticIdx = prev.findIndex(m => 
                  !m.id && // Optimistic messages don't have server IDs yet
                  m.senderId === msg.senderId && 
                  m.content === msg.content &&
                  (now - new Date(m.sentAt)) < 5000
                );
                
                if (optimisticIdx !== -1) {
                  console.log('🔄 Replacing optimistic message with server-confirmed message:', msg.id);
                  const updated = [...prev];
                  updated[optimisticIdx] = msg;
                  return updated;
                }
                
                console.log('➕ Adding new message to UI:', msg.id)
                return [...prev, msg]
              })
              // Update conversation list with new last message
              setConversations(prevConvs => 
                prevConvs.map(c => c.id === selectedConv.id 
                  ? { ...c, lastMessage: msg } 
                  : c
                ).sort((a, b) => {
                  const aTime = a.lastMessage?.sentAt || a.createdAt
                  const bTime = b.lastMessage?.sentAt || b.createdAt
                  return new Date(bTime) - new Date(aTime)
                })
              )
            }
          } catch (e) {
            console.error('❌ Error parsing message:', e)
          }
        })
        
        // Subscribe to typing indicators
        client.subscribe('/user/queue/typing', (frame) => {
          try {
            const status = JSON.parse(frame.body)
            if (String(status.conversationId) === String(selectedConv.id)) {
              setTypingMap((prev) => ({ ...prev, [status.senderId]: !!status.typing }))
              // Clear typing after 3 seconds
              setTimeout(() => {
                setTypingMap((prev) => ({ ...prev, [status.senderId]: false }))
              }, 3000)
            }
          } catch (e) {}
        })
        
        // Subscribe to message status updates
        client.subscribe('/user/queue/status', (frame) => {
          try {
            const update = JSON.parse(frame.body)
            if (update.conversationId === selectedConv.id) {
              setMessages((prev) => prev.map((m) => (m.id === update.id ? update : m)))
            }
          } catch (e) {}
        })
        
        // Subscribe to errors
        client.subscribe('/user/queue/errors', (frame) => {
          try {
            const err = JSON.parse(frame.body)
            console.error('❌ Server Chat Error:', err)
            setChatError(err.error || 'Chat error occurred')
          } catch (e) {}
        })
      },
      onStompError: (error) => {
        console.error('❌ STOMP error:', error)
        setIsConnected(false)
        setChatError('Failed to connect to chat. Please try again.')
      },
      onWebSocketError: (error) => {
        console.error('❌ WebSocket error:', error)
        setIsConnected(false)
        setChatError('Connection error. Please refresh the page.')
      },
      onDisconnect: () => {
        console.log('🔌 WebSocket disconnected')
        setIsConnected(false)
      }
    })

    client.activate()
    stompRef.current = client

    return () => {
      try {
        client.deactivate()
      } catch {}
      stompRef.current = null
      setTypingMap({})
      setIsConnected(false)
    }
  }, [token, selectedConv, baseURL])

  const sendMessage = () => {
    const content = input.trim()
    if (!content || !selectedConv || !currentId) {
      console.warn('⚠️ Cannot send message:', { content, selectedConv: selectedConv?.id, currentId })
      return
    }
    
    if (!stompRef.current || !stompRef.current.connected) {
      console.error('❌ WebSocket not connected')
      setChatError('Connection lost. Please refresh the page.')
      return
    }
    
    console.log('📤 Sending message:', { content, conversationId: selectedConv.id, senderId: currentId })
    
    const body = JSON.stringify({
      conversationId: selectedConv.id,
      senderId: String(currentId),
      content,
      mediaUrl: null,
    })
    
    stompRef.current.publish({ 
      destination: '/app/chat.send', 
      body 
    })
    
    setInput('')
  }

  const indicateTyping = (typing) => {
    if (!selectedConv || !currentId || !stompRef.current?.connected) return
    const body = JSON.stringify({ 
      senderId: String(currentId), 
      conversationId: String(selectedConv.id), 
      typing 
    })
    stompRef.current.publish({ destination: '/app/chat.typing', body })
  }

  const onInputChange = (e) => {
    setInput(e.target.value)
    // Throttle typing indicator
    if (typingTimer.current) clearTimeout(typingTimer.current)
    indicateTyping(true)
    typingTimer.current = setTimeout(() => indicateTyping(false), 1200)
  }

  const startConversationWithUser = async (targetUser) => {
    if (!targetUser || !currentId) return
    setChatError('')
    setIsLoadingChat(true)
    
    console.log('🔗 Starting conversation with:', targetUser.userId)
    try {
      const { data: conv } = await api.post(`/api/v1/conversations/private/${targetUser.userId}`)
      console.log('✅ Conversation ready:', conv)
      
      // Refresh conversations list
      const { data: updatedConvs } = await api.get('/api/v1/participants/me/conversations')
      setConversations(updatedConvs || [])
      
      // Select the conversation
      const found = updatedConvs.find(c => c.id === conv.id) || conv
      setSelectedConv(found)
      setSearchQuery('')
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Failed to start conversation'
      console.error('❌ Error:', msg)
      setChatError(msg)
    } finally {
      setIsLoadingChat(false)
    }
  }

  const filteredUsers = connectedUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const visibleConversations = useMemo(() => {
    const deduped = new Map()
    conversations.forEach((conv) => {
      const other = conv.participants?.find((p) => String(p.participantId) !== String(currentId))
      const key = other?.participantId || other?.userId || conv.id
      const existing = deduped.get(key)
      if (!existing) {
        deduped.set(key, conv)
        return
      }

      const convTime = new Date(conv.lastMessage?.sentAt || conv.createdAt).getTime()
      const existingTime = new Date(existing.lastMessage?.sentAt || existing.createdAt).getTime()
      if (convTime > existingTime) {
        deduped.set(key, conv)
      }
    })

    return Array.from(deduped.values()).sort((a, b) => {
      const aTime = new Date(a.lastMessage?.sentAt || a.createdAt)
      const bTime = new Date(b.lastMessage?.sentAt || b.createdAt)
      return bTime - aTime
    })
  }, [conversations, currentId])

  const getOtherParticipant = (conv) => {
    return conv.participants?.find(p => p.participantId !== currentId) || {}
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'SENT': return '✓'
      case 'DELIVERED': return '✓✓'
      case 'READ': return '✓✓'
      case 'SENDING': return '🕐'
      default: return ''
    }
  }

  const isTyping = Object.entries(typingMap).some(([id, t]) => t && id !== String(currentId))
  const activeParticipant = selectedConv ? getOtherParticipant(selectedConv) : null
  const headerTimestamp = selectedConv
    ? selectedConv.lastMessage?.sentAt || selectedConv.updatedAt || selectedConv.createdAt
    : null
  const chatTexture = isDark
    ? 'radial-gradient(circle at 15% 20%, rgba(56,189,248,0.07), transparent 40%)'
    : 'radial-gradient(circle at 10% 15%, rgba(56,189,248,0.18), transparent 45%)'

  return (
    <div className={`relative isolate min-h-[calc(100vh-80px)] overflow-hidden ${themed('bg-slate-950 text-slate-50','bg-sky-50 text-slate-900')}`}>
      <div
        className={`pointer-events-none absolute inset-0 ${themed(
          'bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]',
          'bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.25),_transparent_45%)]'
        )}`}
      />
      <div
        className={`pointer-events-none absolute inset-0 blur-3xl ${themed(
          'bg-[radial-gradient(circle_at_85%_15%,_rgba(248,250,252,0.12),_transparent_40%)]',
          'bg-[radial-gradient(circle_at_20%_80%,_rgba(14,165,233,0.15),_transparent_45%)]'
        )}`}
      />
      <div className="relative mx-auto flex h-full min-h-[calc(100vh-80px)] max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
        {/* Sidebar */}
        <aside
          className={`order-2 flex flex-col rounded-3xl border p-5 shadow-[0_25px_60px_rgba(2,6,23,0.6)] backdrop-blur-2xl lg:order-1 lg:h-full lg:w-80 ${themed(
            'border-white/10 bg-slate-900/40 text-slate-50',
            'border-slate-200/80 bg-white/80 text-slate-900'
          )}`}
        >
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Inbox</p>
          <h2 className={`mt-1 text-2xl font-semibold ${themed('text-white','text-slate-900')}`}>Messages</h2>
        </div>

        {/* Search Connected Users */}
        <div className="mt-4">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input
              className={`w-full rounded-2xl border py-3 pl-10 pr-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 ${themed(
                'border-white/5 bg-white/5 text-slate-100 focus:border-sky-400 focus:ring-sky-400/40',
                'border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-sky-500/30'
              )}`}
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {chatError && (
          <div
            className={`mt-3 flex items-center gap-3 rounded-2xl border px-3 py-2 text-xs ${themed(
              'border-red-500/30 bg-red-500/10 text-red-100',
              'border-red-200 bg-red-50 text-red-800'
            )}`}
          >
            <span>⚠️ {chatError}</span>
            <button
              className={`ml-auto transition ${themed('text-red-200 hover:text-white','text-red-700 hover:text-red-900')}`}
              onClick={() => setChatError('')}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mt-4 flex-1 overflow-hidden">
          {searchQuery ? (
            <div className="flex h-full flex-col">
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Start New Chat</p>
              <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
                {isLoadingChat ? (
                  <div
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${themed(
                      'border-white/5 bg-white/5 text-slate-300',
                      'border-slate-200 bg-white text-slate-600'
                    )}`}
                  >
                    <span className="h-2 w-2 animate-ping rounded-full bg-emerald-300" />
                    Preparing chat...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div
                    className={`rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-slate-400 ${themed(
                      'border-white/10 bg-transparent',
                      'border-slate-200 bg-white/60'
                    )}`}
                  >
                    {searchQuery ? 'No matches found' : 'Connect with people to chat'}
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.userId}
                      className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${themed(
                        'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10',
                        'border-sky-100 bg-sky-50/80 hover:border-sky-300 hover:bg-sky-100'
                      )}`}
                      onClick={() => startConversationWithUser(u)}
                    >
                      <div className="h-11 w-11 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-400 text-base font-semibold text-slate-950">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-medium ${themed('text-white','text-slate-900')}`}>{u.name}</p>
                        <p className="truncate text-xs text-slate-500">{u.userId}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Conversations</p>
              {visibleConversations.length === 0 ? (
                <div
                  className={`mt-6 rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-slate-500 ${themed(
                    'border-white/10 bg-transparent',
                    'border-slate-200 bg-white/70'
                  )}`}
                >
                  No conversations yet. Search above to start chatting!
                </div>
              ) : (
                <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
                  {visibleConversations.map((conv) => {
                    const other = getOtherParticipant(conv)
                    const isSelected = selectedConv?.id === conv.id

                    return (
                      <button
                        key={conv.id}
                        className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                          isSelected
                            ? themed('border-white/20 bg-white/10 shadow-lg shadow-sky-500/20','border-slate-400 bg-white shadow-lg shadow-sky-200/60')
                            : themed('border-transparent bg-white/0 hover:border-white/10 hover:bg-white/5','border-transparent bg-white/0 hover:border-slate-200 hover:bg-white/70')
                        }`}
                        onClick={() => {
                          console.log('🖱️ Conversation clicked:', conv.id)
                          setSelectedConv(conv)
                        }}
                      >
                        <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-lg font-semibold text-slate-950">
                          {other.avatarUrl ? (
                            <img src={other.avatarUrl} alt={other.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              {other.name?.charAt(0)?.toUpperCase() || '#'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className={`truncate text-sm font-semibold ${themed('text-white','text-slate-900')}`}>{other.name || 'Chat #' + conv.id}</span>
                            <span className="text-xs text-slate-500">
                              {formatTime(conv.lastMessage?.sentAt || conv.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            {conv.lastMessage ? (
                              <>
                                {conv.lastMessage.senderId === currentId && (
                                  <span className={themed('text-slate-300','text-slate-600')}>
                                    {getStatusIcon(conv.lastMessage.status)}
                                  </span>
                                )}
                                <span className="truncate">
                                  {conv.lastMessage.content?.substring(0, 40)}
                                  {conv.lastMessage.content?.length > 40 ? '...' : ''}
                                </span>
                              </>
                            ) : (
                              <span className="italic text-slate-400">No messages yet</span>
                            )}
                          </div>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="rounded-full bg-emerald-300/90 px-2 py-0.5 text-xs font-semibold text-emerald-950">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

        {/* Chat Area */}
        <section
          className={`order-1 flex flex-1 flex-col overflow-hidden rounded-3xl border shadow-[0_25px_60px_rgba(2,6,23,0.65)] backdrop-blur-3xl lg:order-2 ${themed(
            'border-white/10 bg-slate-900/30 text-slate-50',
            'border-slate-200 bg-white/90 text-slate-900'
          )}`}
        >
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <header className={`flex items-center justify-between border-b px-6 py-5 ${themed('border-white/5','border-slate-200')}`}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-lg font-semibold text-slate-950">
                  {activeParticipant?.avatarUrl ? (
                    <img
                      src={activeParticipant.avatarUrl}
                      alt={activeParticipant.name || ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      {activeParticipant?.name?.charAt(0)?.toUpperCase() || '#'}
                    </div>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${themed('text-white','text-slate-900')}`}>
                    {activeParticipant?.name || 'Chat #' + selectedConv.id}
                  </p>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                    {isConnected ? (isTyping ? 'typing...' : 'online') : 'connecting...'}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                {headerTimestamp ? new Date(headerTimestamp).toLocaleString() : ''}
              </div>
            </header>

            {/* Messages Area */}
            <div
              className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6"
              style={{ backgroundImage: chatTexture }}
            >
              {isLoadingMessages && (
                <div
                  className={`mx-auto mb-6 flex max-w-sm items-center gap-3 rounded-full border px-4 py-2 text-xs ${themed(
                    'border-white/5 bg-white/5 text-slate-200',
                    'border-slate-200 bg-white text-slate-600'
                  )}`}
                >
                  <span className="h-2 w-2 animate-ping rounded-full bg-emerald-300" />
                  Loading older messages...
                </div>
              )}

              {messages.length === 0 && !isLoadingMessages ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
                  <div className={`rounded-full border p-6 text-4xl ${themed('border-white/10 bg-white/5','border-slate-200 bg-white')}`}>💬</div>
                  <p className="text-sm text-slate-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                groupedDates.map((date, dateIdx) => {
                  const dayMessages = groupedMessages[date]
                  return (
                    <div key={date} className="space-y-4">
                      <div className="relative my-6 flex items-center justify-center">
                        <span className={`absolute inset-x-10 h-px ${themed('bg-white/10','bg-slate-200/70')}`} />
                        <span
                          className={`relative rounded-full border px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${themed(
                            'border-white/10 bg-slate-900/80 text-slate-300',
                            'border-slate-200 bg-white text-slate-500'
                          )}`}
                        >
                          {formatDateDivider(date)}
                        </span>
                      </div>

                      {dayMessages.map((m, idx) => {
                        const isMe = String(m.senderId) === String(currentId)
                        const showAvatar = !isMe && (idx === 0 || dayMessages[idx - 1].senderId !== m.senderId)
                        const isFirstOverall = dateIdx === 0 && idx === 0

                        return (
                          <div
                            key={m.id}
                            ref={isFirstOverall ? lastMessageElementRef : null}
                            className={`flex w-full gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isMe && (
                              <>
                                {showAvatar ? (
                                  <div
                                    className={`mt-5 flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-semibold ${themed(
                                      'bg-white/10 text-slate-200',
                                      'bg-sky-100 text-slate-700'
                                    )}`}
                                  >
                                    {activeParticipant?.avatarUrl ? (
                                      <img
                                        src={activeParticipant.avatarUrl}
                                        alt=""
                                        className="h-full w-full rounded-2xl object-cover"
                                      />
                                    ) : (
                                      activeParticipant?.name?.charAt(0)?.toUpperCase() || '?'
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-9" />
                                )}
                              </>
                            )}

                            <div
                              className={`max-w-[75%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-2xl ring-1 ${themed('ring-white/5','ring-slate-200/80')} ${
                                isMe
                                  ? 'bg-gradient-to-br from-sky-500 to-cyan-400 text-slate-950'
                                  : themed('bg-white/10 text-slate-100','bg-white text-slate-900')
                              }`}
                            >
                              <div className="whitespace-pre-wrap">{m.content}</div>
                              <div
                                className={`mt-2 flex items-center gap-2 text-xs ${
                                  isMe ? 'text-slate-900/70' : themed('text-slate-300/80','text-slate-500')
                                }`}
                              >
                                <span>{formatTime(m.sentAt)}</span>
                                {isMe && <span>{getStatusIcon(m.status)}</span>}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`border-t px-4 py-4 sm:px-6 ${themed('border-white/5 bg-slate-900/40','border-sky-100 bg-sky-50/80')}`}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div
                  className={`flex flex-1 items-center rounded-2xl border px-4 py-2 focus-within:border-sky-400/60 ${themed(
                    'border-white/10 bg-slate-950/40',
                    'border-slate-300 bg-white'
                  )}`}
                >
                  <input
                    className={`h-10 w-full bg-transparent text-sm placeholder:text-slate-500 focus:outline-none ${themed(
                      'text-slate-100',
                      'text-slate-900'
                    )}`}
                    value={input}
                    onChange={onInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                  />
                </div>
                <button
                  className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-400  px-6 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-300 disabled:opacity-80"
                  onClick={sendMessage}
                  disabled={!isConnected || !input.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center text-slate-400">
            <div className={`rounded-full border p-8 text-5xl ${themed('border-white/10 bg-white/5','border-slate-200 bg-white')}`}>💬</div>
            <h2 className={`text-2xl font-semibold ${themed('text-white','text-slate-900')}`}>Select a conversation</h2>
            <p className="max-w-sm text-sm text-slate-500">
              Choose a conversation from the sidebar or search for connections to start chatting
            </p>
          </div>
        )}
        </section>
      </div>
    </div>
  )
}

