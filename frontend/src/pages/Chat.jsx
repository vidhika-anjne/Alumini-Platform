import { useEffect, useMemo, useRef, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import './Chat.css'

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
  const [isLoadingChat, setIsLoadingChat] = useState(false)

  const stompRef = useRef(null)
  const typingTimer = useRef(null)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
      console.log('⚠️ No conversation selected, clearing messages')
      setMessages([])
      return
    }
    
    console.log('📥 Fetching message history for conversation:', selectedConv.id)
    console.log('📥 Full conversation object:', selectedConv)
    setMessages([]) // Clear previous messages first
    
    const url = `/api/v1/conversations/${selectedConv.id}/messages`
    console.log('📥 Calling API:', url, 'with params:', { page: 0, size: 100 })
    
    api
      .get(url, { params: { page: 0, size: 100 } })
      .then((res) => {
        console.log('✅ Messages loaded:', res.data?.length || 0, 'messages')
        console.log('📊 Full message array:', res.data)
        if (res.data && res.data.length > 0) {
          res.data.forEach((msg, idx) => {
            console.log(`  Message ${idx+1}:`, msg.id, msg.senderId, msg.content?.substring(0, 30))
          })
        }
        setMessages(res.data || [])
        console.log('📊 Messages state updated, length:', res.data?.length || 0)
      })
      .catch((err) => {
        console.error('❌ Failed to load messages for conversation', selectedConv.id)
        console.error('❌ Error status:', err?.response?.status)
        console.error('❌ Error data:', err?.response?.data)
        console.error('❌ Error message:', err.message)
        setMessages([])
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
              // Prevent duplicates - only add if message doesn't exist
              setMessages((prev) => {
                const exists = prev.some(m => m.id === msg.id)
                if (exists) {
                  console.log('⚠️ Message already exists, skipping:', msg.id)
                  return prev
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
      const { data: conv } = await api.post(`/api/v1/conversations/private/${encodeURIComponent(targetUser.userId)}`)
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
            {conversations.length === 0 ? (
              <div className="empty-state">
                No conversations yet. Search above to start chatting!
              </div>
            ) : (
              conversations.map((conv) => {
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
                              <span className="message-status">{getStatusIcon(conv.lastMessage.status)} </span>
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
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-icon">💬</div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = String(m.senderId) === String(currentId)
                  const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== m.senderId)
                  const other = getOtherParticipant(selectedConv)
                  
                  return (
                    <div key={m.id} className={`message-row ${isMe ? 'me' : 'them'}`}>
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
                      
                      <div className={`message-bubble ${isMe ? 'my-message' : 'their-message'}`}>
                        <div className="message-content">{m.content}</div>
                        <div className="message-meta">
                          <span className="message-time">{formatTime(m.sentAt)}</span>
                          {isMe && <span className="message-status">{getStatusIcon(m.status)}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })
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
