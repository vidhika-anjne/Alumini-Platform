import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import './Chat.css'

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
  const [hasMore, setHasMore] = useState(true)

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
            console.log('📬 Received status update:', update.id, '→', update.status);
            if (update.conversationId === selectedConv.id) {
              setMessages((prev) => prev.map((m) => (m.id === update.id ? update : m)))
            }
          } catch (e) {
            console.error('❌ Error processing status update:', e)
          }
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

  // Mark received messages as DELIVERED when conversation is opened
  useEffect(() => {
    if (!selectedConv || !stompRef.current?.connected || !currentId || messages.length === 0) return
    
    // Find messages from others that are still in SENT status
    const undeliveredMessages = messages.filter(m => 
      String(m.senderId) !== String(currentId) && 
      m.status === 'SENT'
    )
    
    if (undeliveredMessages.length > 0) {
      console.log('📬 Marking', undeliveredMessages.length, 'messages as DELIVERED');
      
      // Batch update with slight delay to avoid overwhelming server
      undeliveredMessages.forEach((m, idx) => {
        setTimeout(() => {
          stompRef.current.publish({
            destination: '/app/chat.status',
            body: JSON.stringify({
              messageId: m.id,
              conversationId: selectedConv.id,
              status: 'DELIVERED'
            })
          })
        }, idx * 50) // 50ms delay between each update
      })
    }
  }, [selectedConv, messages, currentId])

  // Mark messages as READ when they are visible in viewport
  useEffect(() => {
    if (!selectedConv || !stompRef.current?.connected || !currentId || messages.length === 0) return
    
    // Find messages from others that are DELIVERED but not READ
    const deliveredMessages = messages.filter(m => 
      String(m.senderId) !== String(currentId) && 
      m.status === 'DELIVERED'
    )
    
    if (deliveredMessages.length === 0) return
    
    // Mark all as READ since user has the conversation open
    // In a real app, you'd use IntersectionObserver to detect actual visibility
    console.log('👁️ Marking', deliveredMessages.length, 'messages as READ');
    
    const markAsReadTimer = setTimeout(() => {
      deliveredMessages.forEach((m, idx) => {
        setTimeout(() => {
          stompRef.current?.publish({
            destination: '/app/chat.status',
            body: JSON.stringify({
              messageId: m.id,
              conversationId: selectedConv.id,
              status: 'READ'
            })
          })
        }, idx * 50)
      })
    }, 500) // Small delay to simulate reading time
    
    return () => clearTimeout(markAsReadTimer)
  }, [selectedConv, messages, currentId])

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

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
        </div>

        {/* Search Connected Users */}
        <div className="user-search">
          <input
            className="search-input"
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {chatError && (
          <div className="error-banner">
            <span>⚠️ {chatError}</span>
            <button onClick={() => setChatError('')}>✕</button>
          </div>
        )}

        {/* Connected Users List */}
        {searchQuery && (
          <div className="connections-list">
            <div className="list-header">Start New Chat</div>
            {isLoadingChat ? (
              <div className="loading">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? 'No matches found' : 'Connect with people to chat'}
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.userId}
                  className="user-item"
                  onClick={() => startConversationWithUser(u)}
                >
                  <div className="user-avatar">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{u.name}</div>
                    <div className="user-id">{u.userId}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Conversations List */}
        {!searchQuery && (
          <div className="conversations-list">
            {visibleConversations.length === 0 ? (
              <div className="empty-state">
                No conversations yet. Search above to start chatting!
              </div>
            ) : (
              visibleConversations.map((conv) => {
                const other = getOtherParticipant(conv)
                const isSelected = selectedConv?.id === conv.id
                
                return (
                  <div
                    key={conv.id}
                    className={`conversation-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      console.log('🖱️ Conversation clicked:', conv.id)
                      setSelectedConv(conv)
                    }}
                  >
                    <div className="conversation-avatar">
                      {other.avatarUrl ? (
                        <img src={other.avatarUrl} alt={other.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {other.name?.charAt(0)?.toUpperCase() || '#'}
                        </div>
                      )}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <span className="conversation-name">{other.name || 'Chat #' + conv.id}</span>
                        <span className="conversation-time">
                          {formatTime(conv.lastMessage?.sentAt || conv.createdAt)}
                        </span>
                      </div>
                      <div className="conversation-preview">
                        {conv.lastMessage ? (
                          <>
                            {conv.lastMessage.senderId === currentId && (
                              <span className={`message-status status-${conv.lastMessage.status?.toLowerCase()}`}>
                                {getStatusIcon(conv.lastMessage.status)}{' '}
                              </span>
                            )}
                            <span className="preview-text">
                              {conv.lastMessage.content?.substring(0, 40)}
                              {conv.lastMessage.content?.length > 40 ? '...' : ''}
                            </span>
                          </>
                        ) : (
                          <span className="preview-text no-messages">No messages yet</span>
                        )}
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="unread-badge">{conv.unreadCount}</div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </aside>

      {/* Chat Area */}
      <main className="chat-main">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="header-info">
                <div className="header-avatar">
                  {getOtherParticipant(selectedConv).avatarUrl ? (
                    <img src={getOtherParticipant(selectedConv).avatarUrl} alt="" />
                  ) : (
                    <div className="avatar-placeholder">
                      {getOtherParticipant(selectedConv).name?.charAt(0)?.toUpperCase() || '#'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="header-name">
                    {getOtherParticipant(selectedConv).name || 'Chat #' + selectedConv.id}
                  </div>
                  <div className="header-status">
                    {isConnected ? (
                      isTyping ? 'typing...' : 'online'
                    ) : (
                      'connecting...'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area">
              {isLoadingMessages && <div className="loading-older">Loading older messages...</div>}
              
              {messages.length === 0 && !isLoadingMessages ? (
                <div className="empty-chat">
                  <div className="empty-icon">💬</div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                Object.keys(groupedMessages).map((date, dateIdx) => (
                  <div key={date}>
                    <div className="date-divider">
                      <span className="date-divider-text">{formatDateDivider(date)}</span>
                    </div>

                    {groupedMessages[date].map((m, idx) => {
                      const isMe = String(m.senderId) === String(currentId)
                      const showAvatar = !isMe && (idx === 0 || groupedMessages[date][idx - 1].senderId !== m.senderId)
                      const other = getOtherParticipant(selectedConv)
                      
                      // Attach observer to the very first message ever shown
                      const isFirstOverall = dateIdx === 0 && idx === 0

                      return (
                        <div 
                          key={m.id} 
                          ref={isFirstOverall ? lastMessageElementRef : null}
                          className={`message-row ${isMe ? 'me' : 'them'}`}
                        >
                          {showAvatar && !isMe && (
                            <div className="message-avatar-small">
                              {other.avatarUrl ? (
                                <img src={other.avatarUrl} alt="" />
                              ) : (
                                <div className="avatar-placeholder-small">
                                  {other.name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                          )}
                          {!showAvatar && !isMe && <div className="message-avatar-spacer" />}
                          
                          <div className={`message-bubble ${isMe ? 'my-message' : 'their-message'}`} data-status={m.status}>
                            <div className="message-content">{m.content}</div>
                            <div className="message-meta">
                              <span className="message-time">{formatTime(m.sentAt)}</span>
                              {isMe && <span className={`message-status status-${m.status?.toLowerCase()}`}>{getStatusIcon(m.status)}</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-area">
              <input
                className="message-input"
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
              <button 
                className="send-button" 
                onClick={sendMessage} 
                disabled={!isConnected || !input.trim()}
              >
                <span className="send-icon">➤</span>
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-icon">💬</div>
            <h2>Select a conversation</h2>
            <p>Choose a conversation from the sidebar or search for connections to start chatting</p>
          </div>
        )}
      </main>
    </div>
  )
}
