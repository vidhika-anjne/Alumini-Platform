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

  return (
    <>
      <AlumniStatusBanner />
      <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-5">
            <p className="text-sm uppercase tracking-[0.35em] text-white/70">Alumni Meetup 2026</p>
            <h1 className="text-4xl font-bold leading-tight">Reconnect with Alumni and Network</h1>
            <p className="text-base text-white/80">Join the celebration — connect, share, and grow together. Reserve your spot and be part of the story.</p>
            <div className="flex flex-wrap gap-3">
              <Link className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg shadow-white/30 transition hover:bg-slate-100" to="/meetup-2026">
                Join the Meetup
              </Link>
              <a className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10" href="#" aria-label="Book tickets">
                Book Tickets
              </a>
            </div>
          </div>
          <div className="flex-1">
            <img src={banner} alt="Alumni networking banner" className="w-full rounded-3xl border border-white/30 bg-white/20 p-4 shadow-xl shadow-black/20" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center gap-4">
              <img src={storiesIcon} alt="Stories" className="h-14 w-14" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Success Stories</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Join the stories</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">Celebrate wins and inspire peers.</p>
            <Link className="mt-4 inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30" to="/stories">
              View Stories
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center gap-4">
              <img src={mentorsIcon} alt="Mentors" className="h-14 w-14" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Mentors</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Connect & guide</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">Collaborate with mentors and grow.</p>
            <Link className="mt-4 inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200" to="/mentors">
              Find Mentors
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center gap-4">
              <img src={chatIcon} alt="Conversations" className="h-14 w-14" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Conversations</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Keep chatting</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">Say hello and get support.</p>
            <Link className="mt-4 inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200" to="/chat">
              Open Chat
            </Link>
          </div>
        </div>
        {loading && <p className="mt-4 text-sm text-slate-400">Refreshing stats…</p>}
      </div>
    </>
  )
}
