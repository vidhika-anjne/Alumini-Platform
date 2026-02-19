import { useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Notifications() {
  const { token } = useAuth()
  const { theme } = useTheme()
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingAction, setLoadingAction] = useState({})

  const isDark = theme === 'dark'
  const themeStyles = isDark
    ? {
        page: 'bg-slate-950 text-white',
        accent: 'text-emerald-400/80',
        description: 'text-slate-300',
        sectionLabel: 'text-slate-400',
        subLabel: 'text-slate-400',
        statChip: 'border-white/10 text-slate-300',
        errorCard: 'border-red-500/30 from-red-900/60 via-red-950 to-black text-red-100 shadow-red-950/50',
        retryButton: 'border-white/10 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white/50',
        emptyCard: 'border-white/5 from-slate-900 via-slate-950 to-black text-white shadow-black/70',
        requestCard: 'border-white/5 bg-gradient-to-br from-white/5 via-white/0 to-transparent text-white shadow-black/60',
        avatarFrame: 'border-white/10 from-emerald-400 to-cyan-500 shadow-emerald-500/30',
        avatarLetter: 'text-white',
        detailLabel: 'text-slate-500',
        detailValue: 'text-white',
        primaryButton: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70',
        secondaryButton: 'border-white/30 text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60',
        loadingPanel: 'border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950 to-black text-white shadow-black/60',
        loadingStatus: 'border-white/10 bg-white/5 text-slate-200',
        loadingDot: 'bg-emerald-400',
      }
    : {
        page: 'bg-slate-50 text-slate-900',
        accent: 'text-emerald-600',
        description: 'text-slate-600',
        sectionLabel: 'text-slate-500',
        subLabel: 'text-slate-500',
        statChip: 'border-slate-200 text-slate-600',
        errorCard: 'border-red-200 from-red-50 via-white to-white text-red-900 shadow-red-200',
        retryButton: 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-500/20',
        emptyCard: 'border-slate-200 from-white via-slate-50 to-slate-100 text-slate-700 shadow-slate-200',
        requestCard: 'border-slate-200 bg-white text-slate-900 shadow-slate-200',
        avatarFrame: 'border-emerald-200 from-emerald-100 to-cyan-100 shadow-emerald-200',
        avatarLetter: 'text-emerald-800',
        detailLabel: 'text-slate-500',
        detailValue: 'text-slate-900',
        primaryButton: 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50',
        secondaryButton: 'border-slate-300 text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50',
        loadingPanel: 'border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900 shadow-slate-200',
        loadingStatus: 'border-slate-200 bg-white text-slate-600',
        loadingDot: 'bg-emerald-500',
      }

  // Fetch pending connection requests
  const fetchPendingRequests = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/v1/connections/pending')
      setPendingRequests(data || [])
    } catch (e) {
      console.error('Error fetching pending requests:', e)
      setError(e?.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchPendingRequests()
  }, [fetchPendingRequests])

  const acceptRequest = async (requesterId) => {
    if (!token) return
    setLoadingAction(prev => ({ ...prev, [requesterId]: 'accepting' }))
    try {
      await api.post(`/api/v1/connections/accept/${requesterId}`)
      setPendingRequests(prev => prev.filter(request => request.requesterId !== requesterId))
      setError('')
    } catch (e) {
      console.error('Error accepting request:', e)
      setError(e?.response?.data?.message || 'Failed to accept connection request')
    } finally {
      setLoadingAction(prev => ({ ...prev, [requesterId]: null }))
    }
  }

  const rejectRequest = async (requesterId) => {
    if (!token) return
    setLoadingAction(prev => ({ ...prev, [requesterId]: 'rejecting' }))
    try {
      await api.post(`/api/v1/connections/reject/${requesterId}`)
      setPendingRequests(prev => prev.filter(request => request.requesterId !== requesterId))
      setError('')
    } catch (e) {
      console.error('Error rejecting request:', e)
      setError(e?.response?.data?.message || 'Failed to reject connection request')
    } finally {
      setLoadingAction(prev => ({ ...prev, [requesterId]: null }))
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen px-4 py-12 ${themeStyles.page}`}>
        <div className={`mx-auto max-w-4xl rounded-3xl border p-10 shadow-2xl backdrop-blur ${themeStyles.loadingPanel}`}>
          <div className="flex flex-col gap-6">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${themeStyles.accent}`}>Stay Connected</p>
              <h1 className="text-4xl font-semibold">Notifications</h1>
            </div>
            <div className={`flex items-center gap-4 rounded-2xl border px-6 py-4 text-lg ${themeStyles.loadingStatus}`}>
              <span className={`inline-flex h-3 w-3 animate-ping rounded-full ${themeStyles.loadingDot}`} />
              Loading notifications...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen px-4 py-12 ${themeStyles.page}`}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className={`text-xs font-semibold uppercase tracking-[0.4em] ${themeStyles.accent}`}>Pulse</p>
          <h1 className="text-4xl font-semibold">Notifications</h1>
          <p className={`text-base ${themeStyles.description}`}>
            Review connection invites, keep conversations flowing, and never miss a professional nudge.
          </p>
        </header>

        {error && (
          <div className={`rounded-3xl border bg-gradient-to-br p-6 text-sm shadow-2xl ${themeStyles.errorCard}`}>
            <div className="flex flex-col gap-3">
              <p className="font-semibold">{error}</p>
              <button
                className={`inline-flex w-max items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition focus-visible:outline-none focus-visible:ring-2 ${themeStyles.retryButton}`}
                onClick={fetchPendingRequests}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <section className="space-y-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.4em] ${themeStyles.sectionLabel}`}>Connections</p>
              <h2 className="text-2xl font-semibold">Pending Requests</h2>
            </div>
            <span className={`rounded-full border px-4 py-1 text-sm ${themeStyles.statChip}`}>
              {pendingRequests.length} waiting
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className={`rounded-3xl border bg-gradient-to-br p-10 text-center shadow-2xl ${themeStyles.emptyCard}`}>
              <div className="flex flex-col gap-3">
                <p className="text-xl font-semibold">All caught up</p>
                <p className={themeStyles.description}>No pending connection requests. Come back soon to grow your network.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingRequests.map((request) => (
                <div
                  key={request.requesterId}
                  className={`rounded-3xl border p-6 shadow-2xl backdrop-blur ${themeStyles.requestCard}`}
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-gradient-to-br p-[2px] shadow-lg ${themeStyles.avatarFrame}`}>
                        <div className={`h-full w-full rounded-xl ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                          {request.requesterData?.avatarUrl ? (
                            <img
                              src={request.requesterData.avatarUrl}
                              alt="Avatar"
                              className="h-full w-full rounded-xl object-cover"
                            />
                          ) : (
                            <div className={`flex h-full w-full items-center justify-center text-2xl font-semibold ${themeStyles.avatarLetter}`}>
                              {(request.requesterData?.name || request.requesterId || 'U')
                                .toString()
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                            <h3 className="text-xl font-semibold">
                              {request.requesterData?.name || `User ${request.requesterId}`}
                            </h3>
                            <span className={`text-sm ${themeStyles.subLabel}`}>
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                          <p className={`text-sm uppercase tracking-[0.4em] ${themeStyles.sectionLabel}`}>wants to connect</p>
                        </div>

                        <dl className="grid gap-2 text-sm sm:grid-cols-2">
                          {request.requesterData?.company && (
                            <div>
                              <dt className={`text-xs uppercase tracking-[0.25em] ${themeStyles.detailLabel}`}>Company</dt>
                              <dd className={`font-medium ${themeStyles.detailValue}`}>{request.requesterData.company}</dd>
                            </div>
                          )}
                          {request.requesterData?.jobTitle && (
                            <div>
                              <dt className={`text-xs uppercase tracking-[0.25em] ${themeStyles.detailLabel}`}>Role</dt>
                              <dd className={`font-medium ${themeStyles.detailValue}`}>{request.requesterData.jobTitle}</dd>
                            </div>
                          )}
                          {request.requesterData?.department && (
                            <div>
                              <dt className={`text-xs uppercase tracking-[0.25em] ${themeStyles.detailLabel}`}>Dept.</dt>
                              <dd className={`font-medium ${themeStyles.detailValue}`}>{request.requesterData.department}</dd>
                            </div>
                          )}
                          {request.requesterData?.passingYear && (
                            <div>
                              <dt className={`text-xs uppercase tracking-[0.25em] ${themeStyles.detailLabel}`}>Passing Year</dt>
                              <dd className={`font-medium ${themeStyles.detailValue}`}>{request.requesterData.passingYear}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:items-end">
                      <button
                        className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold transition ${themeStyles.primaryButton}`}
                        onClick={() => acceptRequest(request.requesterId)}
                        disabled={loadingAction[request.requesterId] === 'accepting'}
                      >
                        {loadingAction[request.requesterId] === 'accepting' ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        className={`inline-flex items-center justify-center rounded-full border px-6 py-2 text-sm font-semibold transition ${themeStyles.secondaryButton}`}
                        onClick={() => rejectRequest(request.requesterId)}
                        disabled={loadingAction[request.requesterId] === 'rejecting'}
                      >
                        {loadingAction[request.requesterId] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}