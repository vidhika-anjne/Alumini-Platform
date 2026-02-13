import { useEffect, useMemo, useState, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import AuthDebug from '../components/AuthDebug'

export default function Mentors() {
  const { token, user } = useAuth()
  const currentId = useMemo(() => (user?.enrollmentNumber || user?.alumniId || user?.id || ''), [user])

  const [filters, setFilters] = useState({ name: '', department: '', passingYear: '', status: '', company: '', jobTitle: '' })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState({}) // { alumniEnrollment: 'NONE' | 'PENDING' | 'CONNECTED' | 'RECEIVED' }
  const [pendingRequests, setPendingRequests] = useState([]) // Requests sent TO current user

  // Fetch connection status for a specific user
  const fetchConnectionStatus = useCallback(async (otherUserId) => {
    if (!token || !currentId) return 'NONE'
    try {
      const { data } = await api.get(`/api/v1/connections/status/${otherUserId}`)
      return data.connected ? 'CONNECTED' : 'NONE'
    } catch {
      return 'NONE'
    }
  }, [token, currentId])

  // Fetch pending requests (where current user is receiver)
  const fetchPendingRequests = useCallback(async () => {
    if (!token) return
    try {
      const { data } = await api.get('/api/v1/connections/pending')
      setPendingRequests(data || [])
    } catch {
      setPendingRequests([])
    }
  }, [token])

  // Fetch my sent requests that are still pending
  const fetchMyConnections = useCallback(async () => {
    if (!token) return []
    try {
      const { data } = await api.get('/api/v1/connections/mine')
      return data || []
    } catch {
      return []
    }
  }, [token])

  const fetchMentors = async () => {
    setLoading(true)
    setError('')
    try {
      // Require authentication before calling the protected API
      if (!token) {
        setResults([])
        setError('Please log in to view mentors')
        return
      }
      // Debug authentication
      // console.log('Token:', token)
      // console.log('User:', user)
      // console.log('Making request to /api/v1/alumni')
      
      const { data } = await api.get('/api/v1/alumni')
      console.log('Response received:', data)
      const mentors = Array.isArray(data) ? data : []
      setResults(mentors)

      // Fetch connection statuses for all mentors
      if (token && currentId && mentors.length > 0) {
        await fetchPendingRequests()
        const myConnections = await fetchMyConnections()
        
        const statusMap = {}
        for (const mentor of mentors) {
          const mentorId = String(mentor.enrollmentNumber)
          if (mentorId === String(currentId)) {
            statusMap[mentorId] = 'SELF'
            continue
          }

          // Check if already connected
          const isConnected = myConnections.some(c => 
            c.status === 'ACCEPTED' && (c.requesterId === mentorId || c.receiverId === mentorId)
          )
          if (isConnected) {
            statusMap[mentorId] = 'CONNECTED'
            continue
          }

          // Check if we sent a pending request
          const sentPending = myConnections.some(c => 
            c.status === 'PENDING' && c.receiverId === mentorId
          )
          if (sentPending) {
            statusMap[mentorId] = 'PENDING_SENT'
            continue
          }

          // Check if we received a pending request from this mentor
          const receivedPending = pendingRequests.some(c => c.requesterId === mentorId)
          if (receivedPending) {
            statusMap[mentorId] = 'PENDING_RECEIVED'
            continue
          }

          statusMap[mentorId] = 'NONE'
        }
        setConnectionStatus(statusMap)
      }
    } catch (e) {
    //   console.error('Error fetching mentors:', e)
    //   console.error('Error response:', e.response)
    //   console.error('Error status:', e.response?.status)
    //   console.error('Error data:', e.response?.data)
    //   console.error('Request headers:', e.config?.headers)
      setError(e?.response?.data?.message || 'Failed to load mentors')
    } finally { setLoading(false) }
  }

  // Refetch connection status after pending requests change
  useEffect(() => {
    if (results.length > 0 && pendingRequests) {
      const statusMap = { ...connectionStatus }
      for (const mentor of results) {
        const mentorId = String(mentor.enrollmentNumber)
        const receivedPending = pendingRequests.some(c => c.requesterId === mentorId)
        if (receivedPending && statusMap[mentorId] !== 'CONNECTED') {
          statusMap[mentorId] = 'PENDING_RECEIVED'
        }
      }
      setConnectionStatus(statusMap)
    }
  }, [pendingRequests])

  useEffect(() => { fetchMentors() }, [token, currentId])

  const sendConnectionRequest = async (alumni) => {
    if (!currentId || !token) return
    try {
      await api.post(`/api/v1/connections/request/${alumni.enrollmentNumber}`)
      setConnectionStatus(prev => ({ ...prev, [alumni.enrollmentNumber]: 'PENDING_SENT' }))
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to send connection request')
    }
  }

  const acceptRequest = async (alumni) => {
    if (!currentId || !token) return
    try {
      await api.post(`/api/v1/connections/accept/${alumni.enrollmentNumber}`)
      setConnectionStatus(prev => ({ ...prev, [alumni.enrollmentNumber]: 'CONNECTED' }))
      setPendingRequests(prev => prev.filter(c => c.requesterId !== alumni.enrollmentNumber))
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to accept connection request')
    }
  }

  const rejectRequest = async (alumni) => {
    if (!currentId || !token) return
    try {
      await api.post(`/api/v1/connections/reject/${alumni.enrollmentNumber}`)
      setConnectionStatus(prev => ({ ...prev, [alumni.enrollmentNumber]: 'NONE' }))
      setPendingRequests(prev => prev.filter(c => c.requesterId !== alumni.enrollmentNumber))
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to reject connection request')
    }
  }

  const startChat = async (alumni) => {
    if (!currentId || !token) return
    try {
      const { data: conv } = await api.post('/api/v1/conversations', { type: 'PRIVATE' })
      await api.post('/api/v1/participants', { participantId: String(currentId), conversation: { id: conv.id } })
      await api.post('/api/v1/participants', { participantId: String(alumni.enrollmentNumber), conversation: { id: conv.id } })
      window.location.href = '/chat'
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to start chat')
    }
  }

  const renderConnectionButton = (alumni) => {
    const mentorId = String(alumni.enrollmentNumber)
    const status = connectionStatus[mentorId] || 'NONE'

    if (status === 'SELF') return null
    if (status === 'CONNECTED') {
      return <button className="button primary" onClick={() => startChat(alumni)} disabled={!token}>Chat</button>
    }
    if (status === 'PENDING_SENT') {
      return <button className="button" disabled>Request Sent</button>
    }
    if (status === 'PENDING_RECEIVED') {
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="button primary" onClick={() => acceptRequest(alumni)}>Accept</button>
          <button className="button" onClick={() => rejectRequest(alumni)}>Reject</button>
        </div>
      )
    }
    return <button className="button" onClick={() => sendConnectionRequest(alumni)} disabled={!token}>Connect</button>
  }

  return (
    <div className="container">
      <AuthDebug />
      <h2>Filters</h2>
      <div className="card" style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {/* <input className="input" placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} /> */}
        <input className="input" placeholder="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} />
        <input className="input" placeholder="Passing Year" value={filters.passingYear} onChange={(e) => setFilters({ ...filters, passingYear: e.target.value })} />
        <select className="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Any status</option>
          <option value="EMPLOYED">Employed</option>
          <option value="UNEMPLOYED">Unemployed</option>
          <option value="SELF_EMPLOYED">Self-Employed</option>
          <option value="SEEKING_OPPORTUNITIES">Seeking Opportunities</option>
          <option value="HIGHER_STUDIES">Higher Studies</option>
          <option value="ENTREPRENEUR">Entrepreneur</option>
          <option value="CAREER_BREAK">Career Break</option>
          <option value="OTHER">Other</option>
        </select>
        <input className="input" placeholder="Company" value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })} />
        <input className="input" placeholder="Job Title" value={filters.jobTitle} onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })} />
        {/* <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'center' }}> */}
          <button className="button" onClick={() => fetchMentors()} disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
        {/* </div> */}
      </div>
     

      {error && <p className="small" style={{ color: 'tomato' }}>{error}</p>}
      {loading && <p className="small">Loading mentors...</p>}

      <div style={{ marginTop: 16 }}>
        {!loading && results.length === 0 && <p className="small">No mentors found.</p>}
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {results.map((a) => (
            <div key={a.id} className="card">
              <strong>{a.name}</strong>
              <div className="small">{a.department} · {a.passingYear}</div>
              <div className="small">Status: {a.employmentStatus || 'N/A'}</div>
              {Array.isArray(a.experiences) && a.experiences.length > 0 && (
                <div className="small" style={{ marginTop: 6 }}>
                  Latest: {a.experiences[a.experiences.length - 1].jobTitle} @ {a.experiences[a.experiences.length - 1].company}
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                {renderConnectionButton(a)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
