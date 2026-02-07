import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Mentors() {
  const { token, user } = useAuth()
  const currentId = useMemo(() => (user?.enrollmentNumber || user?.alumniId || user?.id || ''), [user])

  const [filters, setFilters] = useState({ name: '', department: '', passingYear: '', status: '', company: '', jobTitle: '' })
  const [results, setResults] = useState([])
  // const [page, setPage] = useState(0)
  // const [size, setSize] = useState(8)
  // const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchMentors = async () => {
    setLoading(true)
    setError('')
    try {
      // Fetch all alumni without pagination
      const { data } = await api.get('/api/v1/alumni')
      setResults(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load mentors')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchMentors() }, [])

  const startChat = async (alumni) => {
    if (!currentId || !token) return
    try {
      const { data: conv } = await api.post('/api/v1/conversations', { type: 'PRIVATE' })
      await api.post('/api/v1/participants', { participantId: String(currentId), conversation: { id: conv.id } })
      await api.post('/api/v1/participants', { participantId: String(alumni.enrollmentNumber), conversation: { id: conv.id } })
      // navigate to chat page (simple redirect)
      window.location.href = '/chat'
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to start chat')
    }
  }

  return (
    <div className="container">
      <h2>Find Mentors</h2>
      {/* Search filters commented out for now */}
      <div className="card" style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <input className="input" placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input className="input" placeholder="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} />
        <input className="input" placeholder="Passing Year" value={filters.passingYear} onChange={(e) => setFilters({ ...filters, passingYear: e.target.value })} />
        <select className="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Any status</option>
          <option value="EMPLOYED">Employed</option>
          <option value="SEEKING_OPPORTUNITIES">Seeking Opportunities</option>
          <option value="HIGHER_STUDIES">Higher Studies</option>
          <option value="ENTREPRENEUR">Entrepreneur</option>
          <option value="CAREER_BREAK">Career Break</option>
          <option value="OTHER">Other</option>
        </select>
        <input className="input" placeholder="Company" value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })} />
        <input className="input" placeholder="Job Title" value={filters.jobTitle} onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })} />
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="button" onClick={() => fetchMentors()} disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
        </div>
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
                <button className="button primary" onClick={() => startChat(a)} disabled={!token}>Chat</button>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination commented out for now
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
          <button className="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0}>Previous</button>
          <span className="small">Page {page + 1} of {Math.max(1, totalPages)}</span>
          <button className="button" onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))} disabled={page + 1 >= totalPages}>Next</button>
        </div>
        */}
      </div>
    </div>
  )
}
