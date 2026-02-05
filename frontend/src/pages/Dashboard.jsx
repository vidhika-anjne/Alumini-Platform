import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import banner from '../images/Untitled_design.png1-removebg-preview.png'
import storiesIcon from '../images/stories.svg'
import mentorsIcon from '../images/mentors.svg'
import chatIcon from '../images/chat.svg'
import AlumniStatusBanner from '../components/AlumniStatusBanner'

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

  return (<>
    <AlumniStatusBanner />
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-content">
          <h1 className="hero-title">Reconnect with Alumni and Network</h1>
          <p className="hero-subtitle">Join the Alumni Meetup 2026 — connect, share, and grow together.
            Reserve your spot and be part of the celebration.</p>
          <div className="hero-actions">
            <Link className="button primary" to="/meetup-2026">Join the Meetup</Link>
            <a className="button" href="#" aria-label="Book tickets">Book Tickets</a>
          </div>
        </div>
        <div className="hero-image">
          <img src={banner} alt="Alumni networking banner" />
        </div>
      </div>
    </section>
    <div className="container">
      <div className="grid">
        <div className="stat-card card-vibrant">
          <div className="stat-head">
            <img src={storiesIcon} alt="Stories" className="stat-icon" />
            <div className="stat-label">Success Stories</div>
          </div>
          <p className="small">Join the stories — celebrate wins and inspire peers.</p>
          <Link className="button cta" to="/stories">View Stories</Link>
        </div>
        <div className="stat-card card-vibrant">
          <div className="stat-head">
            <img src={mentorsIcon} alt="Mentors" className="stat-icon" />
            <div className="stat-label">Mentors</div>
          </div>
          <p className="small">Join mentors — connect, guide, and grow together.</p>
          <Link className="button cta" to="/mentors">Find Mentors</Link>
        </div>
        <div className="stat-card card-vibrant">
          <div className="stat-head">
            <img src={chatIcon} alt="Conversations" className="stat-icon" />
            <div className="stat-label">Your Conversations</div>
          </div>
          <p className="small">Join the conversation — say hello and get support.</p>
          <Link className="button" to="/chat">Open Chat</Link>
        </div>
      </div>
      {loading && <p className="small">Refreshing stats…</p>}
    </div>
  </>
  )
}
