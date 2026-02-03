import { useEffect, useMemo, useRef, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

export default function Chat() {
  const { token, user } = useAuth()
  const currentId = useMemo(() => (user?.enrollmentNumber || user?.alumniId || user?.id || ''), [user])
  const baseURL = api.defaults.baseURL || 'http://localhost:8080'

  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [recipientId, setRecipientId] = useState('')
  const [typingMap, setTypingMap] = useState({})

  const stompRef = useRef(null)
  const typingTimer = useRef(null)

  // Load user's conversations on mount
  useEffect(() => {
    if (!currentId || !token) return
    api
      .get(`/api/v1/participants/user/${encodeURIComponent(currentId)}/conversations`)
      .then((res) => setConversations(res.data || []))
      .catch(() => {})
  }, [currentId, token])

  // Fetch message history when selecting a conversation
  useEffect(() => {
    if (!selectedConv) return
    api
      .get(`/api/v1/conversations/${selectedConv.id}/messages`, { params: { page: 0, size: 100 } })
      .then((res) => setMessages(res.data || []))
      .catch(() => setMessages([]))
  }, [selectedConv])

  // Connect to STOMP when a conversation is selected and user logged in
  useEffect(() => {
    if (!token || !selectedConv) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseURL}/ws-chat`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        // personal queues
        client.subscribe('/user/queue/messages', (frame) => {
          try {
            const msg = JSON.parse(frame.body)
            if (msg.conversationId === selectedConv.id) {
              setMessages((prev) => [...prev, msg])
            }
          } catch (e) {}
        })
        client.subscribe('/user/queue/typing', (frame) => {
          try {
            const status = JSON.parse(frame.body)
            if (String(status.conversationId) === String(selectedConv.id)) {
              setTypingMap((prev) => ({ ...prev, [status.senderId]: !!status.typing }))
            }
          } catch (e) {}
        })
        client.subscribe('/user/queue/status', (frame) => {
          try {
            const update = JSON.parse(frame.body)
            if (update.conversationId === selectedConv.id) {
              setMessages((prev) => prev.map((m) => (m.id === update.id ? update : m)))
            }
          } catch (e) {}
        })
      },
    })

    client.activate()
    stompRef.current = client

    return () => {
      try {
        client.deactivate()
      } catch {}
      stompRef.current = null
      setTypingMap({})
    }
  }, [token, selectedConv, baseURL])

  const sendMessage = () => {
    const content = input.trim()
    if (!content || !selectedConv || !currentId) return
    const body = JSON.stringify({
      conversationId: selectedConv.id,
      senderId: String(currentId),
      content,
      mediaUrl: null,
    })
    stompRef.current?.publish({ destination: '/app/chat.send', body })
    setInput('')
  }

  const indicateTyping = (typing) => {
    if (!selectedConv || !currentId) return
    const body = JSON.stringify({ senderId: String(currentId), conversationId: String(selectedConv.id), typing })
    stompRef.current?.publish({ destination: '/app/chat.typing', body })
  }

  const onInputChange = (e) => {
    setInput(e.target.value)
    // throttle typing indicator
    if (typingTimer.current) clearTimeout(typingTimer.current)
    indicateTyping(true)
    typingTimer.current = setTimeout(() => indicateTyping(false), 1200)
  }

  const createPrivateConversation = async () => {
    const other = recipientId.trim()
    if (!other || !currentId) return
    try {
      const { data: conv } = await api.post('/api/v1/conversations', { type: 'PRIVATE' })
      // add both participants
      await api.post('/api/v1/participants', { participantId: String(currentId), conversation: { id: conv.id } })
      await api.post('/api/v1/participants', { participantId: other, conversation: { id: conv.id } })
      setConversations((prev) => [conv, ...prev])
      setRecipientId('')
      setSelectedConv(conv)
    } catch (err) {
      // optional: show error
    }
  }

  return (
    <div className="container bg-neutral-section" style={{ display: 'flex', gap: 16, minHeight: '70vh', padding: 12, borderRadius: 12 }}>
      <aside className="card card-soft" style={{ width: 280 }}>
        <h3>Conversations</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="Start with participant ID"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
          />
          <button className="button cta" onClick={createPrivateConversation}>Start</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
          {conversations.map((c) => (
            <li key={c.id} style={{ marginBottom: 8 }}>
              <button
                className="button"
                style={{ width: '100%', textAlign: 'left', background: selectedConv?.id === c.id ? '#eef' : undefined }}
                onClick={() => setSelectedConv(c)}
              >
                #{c.id} · {c.type}
              </button>
            </li>
          ))}
          {conversations.length === 0 && <li className="small">No conversations yet</li>}
        </ul>
      </aside>

      <main className="card card-soft" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3>{selectedConv ? `Conversation #${selectedConv.id}` : 'Select a conversation'}</h3>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6 }}>
          {messages.map((m) => (
            <div key={m.id} style={{ marginBottom: 10, display: 'flex', justifyContent: m.senderId === String(currentId) ? 'flex-end' : 'flex-start' }}>
              <div className={m.senderId === String(currentId) ? 'card card-dark' : 'card card-soft'} style={{ maxWidth: '70%' }}>
                <div className="small" style={{ opacity: 0.7 }}>{m.senderId}</div>
                <div>{m.content}</div>
                <div className="small" style={{ opacity: 0.5 }}>{m.status}</div>
              </div>
            </div>
          ))}
        </div>
        {Object.entries(typingMap).some(([id, t]) => t && id !== String(currentId)) && (
          <div className="small" style={{ margin: '4px 0', opacity: 0.7 }}>Someone is typing…</div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={input}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage()
            }}
            placeholder={selectedConv ? 'Type a message…' : 'Select a conversation'}
            disabled={!selectedConv}
          />
          <button className="button cta" onClick={sendMessage} disabled={!selectedConv || !input.trim()}>Send</button>
        </div>
      </main>
    </div>
  )
}
