import { useEffect, useMemo, useState, useCallback } from 'react'
import api from '../api/client'
import { sendConnectionRequest } from '../api/profile'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import AuthDebug from '../components/AuthDebug'

const statusStylesLight = {
  EMPLOYED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  UNEMPLOYED: 'border-sky-200 bg-sky-50 text-slate-600',
  SELF_EMPLOYED: 'border-amber-200 bg-amber-50 text-amber-700',
  SEEKING_OPPORTUNITIES: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  HIGHER_STUDIES: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  ENTREPRENEUR: 'border-rose-200 bg-rose-50 text-rose-700',
  CAREER_BREAK: 'border-purple-200 bg-purple-50 text-purple-700'
}

const statusStylesDark = {
  EMPLOYED: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-100',
  UNEMPLOYED: 'border-slate-600 bg-slate-800/70 text-slate-100',
  SELF_EMPLOYED: 'border-amber-400/60 bg-amber-400/10 text-amber-100',
  SEEKING_OPPORTUNITIES: 'border-indigo-400/60 bg-indigo-500/10 text-indigo-100',
  HIGHER_STUDIES: 'border-cyan-400/60 bg-cyan-400/10 text-cyan-100',
  ENTREPRENEUR: 'border-rose-400/60 bg-rose-500/10 text-rose-100',
  CAREER_BREAK: 'border-purple-400/60 bg-purple-500/10 text-purple-100'
}

const avatarPalettes = [
  'from-sky-500 to-blue-600',
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600'
]

const getInitials = (name) => {
  if (!name) return 'AL'
  const tokens = name.trim().split(' ')
  return tokens.slice(0, 2).map((t) => t[0]?.toUpperCase() || '').join('') || 'AL'
}

const getAvatarTone = (seed) => {
  if (!seed?.length) return avatarPalettes[0]
  const index = seed.charCodeAt(0) % avatarPalettes.length
  return avatarPalettes[index]
}

const getLatestExperience = (experiences) => {
  if (!Array.isArray(experiences) || experiences.length === 0) return null
  const latest = experiences[experiences.length - 1]
  if (!latest) return null
  return `${latest.jobTitle || 'Role'} · ${latest.company || 'Company'}`
}

const getStatusBadge = (status, isDark) => {
  const fallback = isDark
    ? 'border-slate-700 bg-slate-800/80 text-slate-200'
    : 'border-sky-100 bg-sky-50 text-slate-500'
  if (!status) return fallback
  const palette = isDark ? statusStylesDark[status] : statusStylesLight[status]
  return palette || fallback
}

export default function Mentors() {
  const { token, user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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
      if (data.connected) return 'CONNECTED'
      if (data.pending) return 'PENDING_SENT'
      return 'NONE'
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
      if (!token) {
        setResults([])
        setError('Please log in to view mentors')
        return
      }

      const { data } = await api.get('/api/v1/alumni')
      const mentors = Array.isArray(data) ? data : []
      const normalizedCurrentId = currentId ? String(currentId) : ''
      const visibleMentors = normalizedCurrentId
        ? mentors.filter((mentor) => String(mentor.enrollmentNumber) !== normalizedCurrentId)
        : mentors

      setResults(visibleMentors)

      if (token && normalizedCurrentId && visibleMentors.length > 0) {
        await fetchPendingRequests()
        const myConnections = await fetchMyConnections()

        const statusMap = {}
        for (const mentor of visibleMentors) {
          const mentorId = String(mentor.enrollmentNumber)

          const isConnected = myConnections.some((c) =>
            c.status === 'ACCEPTED' && (c.requesterId === mentorId || c.receiverId === mentorId)
          )
          if (isConnected) {
            statusMap[mentorId] = 'CONNECTED'
            continue
          }

          const sentPending = myConnections.some((c) => c.status === 'PENDING' && c.receiverId === mentorId)
          if (sentPending) {
            statusMap[mentorId] = 'PENDING_SENT'
            continue
          }

          const receivedPending = pendingRequests.some((c) => c.requesterId === mentorId)
          if (receivedPending) {
            statusMap[mentorId] = 'PENDING_RECEIVED'
            continue
          }

          statusMap[mentorId] = 'NONE'
        }
        setConnectionStatus(statusMap)
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load mentors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (results.length > 0 && pendingRequests) {
      const statusMap = { ...connectionStatus }
      for (const mentor of results) {
        const mentorId = String(mentor.enrollmentNumber)
        const receivedPending = pendingRequests.some((c) => c.requesterId === mentorId)
        if (receivedPending && statusMap[mentorId] !== 'CONNECTED') {
          statusMap[mentorId] = 'PENDING_RECEIVED'
        }
      }
      setConnectionStatus(statusMap)
    }
  }, [pendingRequests])

  useEffect(() => { fetchMentors() }, [token, currentId])

  const handleConnect = async (alumni) => {
    if (!currentId || !token) return
    try {
      await sendConnectionRequest(alumni.enrollmentNumber)
      setConnectionStatus(prev => ({ ...prev, [alumni.enrollmentNumber]: 'PENDING_SENT' }))
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to send connection request')
    }
  }

  const acceptRequest = async (alumni) => {
    if (!currentId || !token) return
    try {
      await api.post(`/api/v1/connections/accept/${alumni.enrollmentNumber}`)
      setConnectionStatus((prev) => ({ ...prev, [alumni.enrollmentNumber]: 'CONNECTED' }))
      setPendingRequests((prev) => prev.filter((c) => c.requesterId !== alumni.enrollmentNumber))
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to accept connection request')
    }
  }

  const rejectRequest = async (alumni) => {
    if (!currentId || !token) return
    try {
      await api.post(`/api/v1/connections/reject/${alumni.enrollmentNumber}`)
      setConnectionStatus((prev) => ({ ...prev, [alumni.enrollmentNumber]: 'NONE' }))
      setPendingRequests((prev) => prev.filter((c) => c.requesterId !== alumni.enrollmentNumber))
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

  const primaryButton = `inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
    isDark
      ? 'bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600'
      : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-sky-200'
  }`

  const secondaryButton = `inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
    isDark
      ? 'border-slate-700 text-slate-200 hover:border-indigo-400 hover:text-indigo-200'
      : 'border-slate-300 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
  }`

  const renderConnectionButton = (alumni) => {
    const mentorId = String(alumni.enrollmentNumber)
    const status = connectionStatus[mentorId] || 'NONE'

    if (status === 'SELF') return null
    if (status === 'CONNECTED') {
      return (
        <button type="button" className={primaryButton} onClick={() => startChat(alumni)} disabled={!token}>
          Message
        </button>
      )
    }
    if (status === 'PENDING_SENT') {
      return (
        <button type="button" className={`${secondaryButton} ${isDark ? 'bg-slate-900/40 text-slate-400' : 'bg-sky-50'}`} disabled>
          Request sent
        </button>
      )
    }
    if (status === 'PENDING_RECEIVED') {
      return (
        <div className="flex gap-3">
          <button type="button" className={primaryButton} onClick={() => acceptRequest(alumni)}>
            Accept
          </button>
          <button type="button" className={secondaryButton} onClick={() => rejectRequest(alumni)}>
            Decline
          </button>
        </div>
      )
    }
    return <button className="button" onClick={() => handleConnect(alumni)} disabled={!token}>Connect</button>
  }

  const subtleText = isDark ? 'text-slate-400' : 'text-slate-500'
  const surfacePanel = isDark
    ? 'border border-slate-800 bg-slate-900/70 shadow-[0_25px_80px_rgba(2,6,23,0.65)]'
    : 'bg-white shadow-sm'
  const fieldClass = `rounded-2xl px-4 py-2 text-sm outline-none transition ${
    isDark
      ? 'border border-slate-700 bg-slate-900/60 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20'
      : 'border border-slate-200 bg-white text-slate-800 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
  }`
  const chipShell = isDark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-700'
  const tagStyle = isDark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-600'
  const infoPanel = isDark ? 'bg-slate-900/50 text-slate-200' : 'bg-sky-50 text-slate-600'
  const infoPanelLabel = 'text-slate-400'

  return (
    <div className={`min-h-screen px-4 py-8 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-sky-50 text-slate-900'}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className={`rounded-3xl p-8 ${surfacePanel}`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Find a mentor</p>
              <p className={`mt-2 text-sm ${subtleText}`}>
                Browse alumni ready to guide you. Use filters to narrow down by industry, year, or company.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className={`rounded-full border px-3 py-1 ${chipShell}`}>{results.length} mentors</span>
              <span className={`rounded-full border px-3 py-1 ${chipShell}`}>Secure profile</span>
            </div>
          </div>
        </header>

        <AuthDebug />

        <section className={`rounded-3xl p-6 ${surfacePanel}`}>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Filters</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <input
              className={fieldClass}
              placeholder="Department"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Passing year"
              value={filters.passingYear}
              onChange={(e) => setFilters({ ...filters, passingYear: e.target.value })}
            />
            <select
              className={`${fieldClass} ${isDark ? 'bg-slate-900/60' : 'bg-white'}`}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
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
            <input
              className={fieldClass}
              placeholder="Company"
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Job title"
              value={filters.jobTitle}
              onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })}
            />
            <button
              type="button"
              className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
                isDark ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-slate-900 hover:bg-slate-800'
              }`}
              onClick={() => fetchMentors()}
              disabled={loading}
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          {loading && <p className={`mt-3 text-sm ${subtleText}`}>Loading mentors...</p>}
        </section>

        <section className="space-y-4">
          {!loading && results.length === 0 && (
            <div className={`rounded-3xl border border-dashed p-10 text-center text-sm ${
              isDark
                ? 'border-slate-800/70 bg-slate-900/60 text-slate-400'
                : 'border-slate-200 bg-white text-slate-500'
            }`}>
              No mentors found for the current filters.
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((mentor) => {
              const initials = getInitials(mentor.name)
              const palette = getAvatarTone(mentor.name)
              const latestExperience = getLatestExperience(mentor.experiences)
              const tags = [mentor.department, mentor.passingYear].filter(Boolean)

              return (
                <article
                  key={mentor.id}
                  className={`rounded-3xl p-6 ${
                    isDark
                      ? 'border border-slate-800 bg-slate-900/75 shadow-[0_25px_80px_rgba(2,6,23,0.7)]'
                      : 'bg-white shadow-lg shadow-slate-200/60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${palette} text-lg font-semibold text-white`}>
                      {initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{mentor.name}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadge(mentor.employmentStatus, isDark)}`}>
                          {mentor.employmentStatus || 'Status unknown'}
                        </span>
                      </div>
                      <p className={`text-sm ${subtleText}`}>
                        {mentor.jobTitle || mentor.experiences?.[0]?.jobTitle || 'Mentor'} @ {mentor.company || mentor.experiences?.[0]?.company || 'Community'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {tags.map((tag) => (
                          <span key={tag} className={`rounded-full border px-3 py-1 ${tagStyle}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {latestExperience && (
                    <div className={`mt-4 rounded-2xl p-4 text-sm ${infoPanel}`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${infoPanelLabel}`}>Latest experience</p>
                      <p className={`mt-1 font-medium ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{latestExperience}</p>
                    </div>
                  )}

                  <div className={`mt-4 flex flex-wrap gap-2 text-xs ${subtleText}`}>
                    {mentor.location && (
                      <span className={`rounded-full border px-3 py-1 ${tagStyle}`}>
                        {mentor.location}
                      </span>
                    )}
                    {Array.isArray(mentor.skills) && mentor.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className={`rounded-full border px-3 py-1 ${tagStyle}`}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className={`mt-6 border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    {renderConnectionButton(mentor)}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
