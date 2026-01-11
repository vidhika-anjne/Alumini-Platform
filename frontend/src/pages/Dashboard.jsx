import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { token, user } = useAuth()
  const currentId = useMemo(() => (user?.enrollmentNumber || user?.alumniId || user?.id || ''), [user])

  const [stats, setStats] = useState({ posts: 0, mentors: 0, conversations: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // posts total (paginated endpoint returns PageResponse)
        const { data: postsPage } = await api.get('/api/v1/posts', { params: { page: 0, size: 1 } })
        const posts = postsPage?.totalElements || 0

        // mentors total via search (empty filters)
        const { data: mentorsPage } = await api.get('/api/v1/alumni/search', { params: { page: 0, size: 1 } })
        const mentors = mentorsPage?.totalElements || 0

        // user conversations count
        let conversations = 0
        if (currentId && token) {
          const { data: convs } = await api.get(`/api/v1/participants/user/${encodeURIComponent(currentId)}/conversations`)
          conversations = Array.isArray(convs) ? convs.length : 0
        }

        setStats({ posts, mentors, conversations })
      } catch {
        // ignore errors for now
      } finally { setLoading(false) }
    }
    load()
  }, [currentId, token])

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <div className="grid">
        <div className="stat-card">
          <div className="stat-value">{stats.posts}</div>
          <div className="stat-label">Success Stories</div>
          <Link className="button" to="/stories">View Stories</Link>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.mentors}</div>
          <div className="stat-label">Mentors</div>
          <Link className="button" to="/mentors">Find Mentors</Link>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.conversations}</div>
          <div className="stat-label">Your Conversations</div>
          <Link className="button" to="/chat">Open Chat</Link>
        </div>
      </div>

      <div className="quick-links card" style={{ marginTop: 16 }}>
        <h3>Quick Actions</h3>
        <div className="quick-grid">
          <Link className="button primary" to="/feed">Go to Feed</Link>
          <Link className="button" to="/profile">Edit Profile</Link>
          <Link className="button" to="/mentors">Search Mentors</Link>
          <Link className="button" to="/stories">Browse Stories</Link>
          <Link className="button" to="/chat">Chat</Link>
        </div>
      </div>
      {loading && <p className="small">Refreshing stats…</p>}
    </div>
  )
}
