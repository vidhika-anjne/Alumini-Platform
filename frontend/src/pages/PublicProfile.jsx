import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function PublicProfile() {
  const { type, enrollmentNumber } = useParams()
  const { user: currentUser, token } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connStatus, setConnStatus] = useState('NOT_CONNECTED') // NOT_CONNECTED, PENDING, CONNECTED

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const url = type.toLowerCase() === 'alumni' 
          ? `/api/v1/alumni/${enrollmentNumber}` 
          : `/api/v1/students/${enrollmentNumber}`
        
        const { data } = await api.get(url)
        const profileData = data.alumni || data.student || data
        setProfile(profileData)

        // Check connection status
        if (token && currentUser && enrollmentNumber !== currentUser.enrollmentNumber) {
          const { data: status } = await api.get(`/api/v1/connections/status/${enrollmentNumber}`)
          if (status.connected) setConnStatus('CONNECTED')
          else if (status.pending) setConnStatus('PENDING')
          else setConnStatus('NOT_CONNECTED')
        }
      } catch (err) {
        setError('Profile not found')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [type, enrollmentNumber, token, currentUser])

  const handleConnect = async () => {
    try {
      await api.post('/api/v1/connections/request', null, { params: { receiverId: enrollmentNumber } })
      setConnStatus('PENDING')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request')
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-slate-500">Loading profile…</div>
  }
  if (error) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-rose-500">{error}</div>
  }
  if (!profile) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-slate-500">No profile found</div>
  }

  const isSelf = currentUser?.enrollmentNumber === enrollmentNumber

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="space-y-8 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-indigo-500/10 ring-1 ring-slate-100 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:ring-white/10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="h-32 w-32 rounded-full border-4 border-indigo-500 object-cover shadow-lg" />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-indigo-500 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-4xl font-bold text-white shadow-lg">
              {(profile.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {profile.department} • {type.toUpperCase()}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200">
                  GitHub ↗
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200">
                  LinkedIn ↗
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">About</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{profile.bio || 'No bio provided.'}</p>
            {profile.skills && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.isArray(profile.skills)
                  ? profile.skills.map((s) => (
                      <span key={s} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        {s}
                      </span>
                    ))
                  : profile.skills}
              </div>
            )}
          </section>

          {type.toLowerCase() === 'alumni' && profile.experiences && (
            <section>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Experience</h3>
              <div className="mt-4 space-y-3">
                {profile.experiences.map((exp, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-white/5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{exp.jobTitle}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{exp.company}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{exp.duration}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
            {!isSelf && token && (
              <>
                {connStatus === 'NOT_CONNECTED' && (
                  <button className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500" onClick={handleConnect}>
                    Connect
                  </button>
                )}
                {connStatus === 'PENDING' && (
                  <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-200" disabled>
                    Request Pending
                  </button>
                )}
                {connStatus === 'CONNECTED' && (
                  <div className="flex flex-wrap gap-3">
                    <button className="rounded-full border border-emerald-300 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200" disabled>
                      Connected ✅
                    </button>
                    <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200" onClick={() => navigate('/chat')}>
                      Message
                    </button>
                  </div>
                )}
              </>
            )}
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
