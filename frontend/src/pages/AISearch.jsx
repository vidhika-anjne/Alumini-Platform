import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchAlumniByAI, checkEmbeddingServiceHealth } from '../api/embedding'
import { getProfile, getConnectionStatus, sendConnectionRequest } from '../api/profile'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AISearch() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const currentId = user?.enrollmentNumber || user?.alumniId || user?.id || ''

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [serviceAvailable, setServiceAvailable] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState({})

  // Example queries to inspire users
  const exampleQueries = [
    "I need a mentor in machine learning and AI",
    "Looking for full-stack developers with React experience",
    "Blockchain and cryptocurrency experts",
    "Data scientists skilled in Python",
    "Cybersecurity and ethical hacking specialists",
    "Mobile app developers with Flutter",
    "Cloud architects with AWS experience",
    "IoT and embedded systems engineers"
  ]

  // Check if embedding service is available
  const checkServiceStatus = useCallback(async () => {
    try {
      const health = await checkEmbeddingServiceHealth()
      setServiceAvailable(health.embeddingServiceAvailable)
      if (!health.embeddingServiceAvailable) {
        setError('AI Search service is currently unavailable. Please try again later.')
      } else {
        setError('')
      }
    } catch (err) {
      setServiceAvailable(false)
      setError('Unable to connect to AI Search service.')
    }
  }, [])

  useEffect(() => {
    checkServiceStatus()
  }, [checkServiceStatus])

  // Fetch connection status for alumni
  const fetchConnectionStatus = useCallback(async (alumniId) => {
    if (!token || !currentId) return 'NONE'
    try {
      const { data } = await api.get(`/api/v1/connections/status/${alumniId}`)
      if (data.connected) return 'CONNECTED'
      if (data.pending) return 'PENDING'
      return 'NONE'
    } catch {
      return 'NONE'
    }
  }, [token, currentId])

  // Fetch connection statuses for all results
  useEffect(() => {
    const fetchAllStatuses = async () => {
      if (!results.length || !token) return

      const statuses = {}
      for (const result of results) {
        const status = await fetchConnectionStatus(result.alumni.enrollmentNumber)
        statuses[result.alumni.enrollmentNumber] = status
      }
      setConnectionStatus(statuses)
    }

    fetchAllStatuses()
  }, [results, token, fetchConnectionStatus])

  // Handle search
  const handleSearch = async (e) => {
    e?.preventDefault()

    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    setSearching(true)
    setLoading(true)
    setError('')

    try {
      const data = await searchAlumniByAI(query, 10)
      setResults(data.results || [])

      if (!data.results || data.results.length === 0) {
        setError('No matching alumni found. Try a different query.')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(err.response?.data?.error || 'Search failed. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  // Handle example query click
  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery)
    setError('')
  }

  // Handle view profile
  const handleViewProfile = (alumni) => {
    navigate(`/profile/alumni/${alumni.enrollmentNumber}`)
  }

  // Handle connect
  const handleConnect = async (alumni) => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      await sendConnectionRequest(alumni.enrollmentNumber)
      setConnectionStatus(prev => ({
        ...prev,
        [alumni.enrollmentNumber]: 'PENDING'
      }))
      alert(`Connection request sent to ${alumni.name}`)
    } catch (err) {
      console.error('Connect error:', err)
      alert(err.response?.data?.message || 'Failed to send connection request')
    }
  }

  const getSimilarityPercentage = (similarity) => Math.round(similarity * 100)

  const getMatchQuality = (similarity) => {
    if (similarity >= 0.7) return { label: 'Excellent Match', colorClass: 'text-emerald-500', borderClass: 'border-emerald-500' }
    if (similarity >= 0.5) return { label: 'Good Match', colorClass: 'text-blue-500', borderClass: 'border-blue-500' }
    if (similarity >= 0.3) return { label: 'Fair Match', colorClass: 'text-amber-500', borderClass: 'border-amber-500' }
    return { label: 'Low Match', colorClass: 'text-slate-400', borderClass: 'border-slate-400' }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-900 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">🤖 AI-Powered Alumni Search</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Use natural language to find alumni with specific skills, experience, or expertise
        </p>
      </div>

      {/* Service Warning */}
      {!serviceAvailable && (
        <div className="mb-6 flex items-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
          <span className="flex-1">⚠️ AI Search service is currently unavailable. Please ensure the embedding service is running.</span>
          <button
            onClick={checkServiceStatus}
            className="ml-4 rounded border border-amber-400 px-2 py-1 text-xs transition hover:bg-amber-100 dark:border-amber-500 dark:hover:bg-amber-800/40"
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Search Box */}
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., I need a mentor in machine learning and Python"
            disabled={!serviceAvailable}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={loading || !serviceAvailable || !query.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {loading ? '🔄 Searching...' : '🔍 Search'}
          </button>
        </form>

        {/* Example Queries */}
        {!searching && results.length === 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Try these example searches:
            </h3>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  disabled={!serviceAvailable}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
            Found {results.length} matching alumni
          </h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Showing results for: <strong className="text-slate-700 dark:text-slate-200">"{query}"</strong>
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result, idx) => {
              const alumni = result.alumni
              const similarity = result.similarity
              const matchQuality = getMatchQuality(similarity)
              const status = connectionStatus[alumni.enrollmentNumber] || 'NONE'
              const isCurrentUser = alumni.enrollmentNumber === currentId

              return (
                <div
                  key={idx}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {alumni.avatarUrl ? (
                        <img
                          src={alumni.avatarUrl}
                          alt={alumni.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                          {alumni.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{alumni.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{alumni.department}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Class of {alumni.passingYear}</p>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${matchQuality.borderClass}`}>
                        <span className={`text-sm font-bold ${matchQuality.colorClass}`}>
                          {getSimilarityPercentage(similarity)}%
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${matchQuality.colorClass}`}>
                        {matchQuality.label}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  {alumni.bio && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      {alumni.bio.substring(0, 150)}{alumni.bio.length > 150 ? '...' : ''}
                    </p>
                  )}

                  {/* Employment Status */}
                  {alumni.employmentStatus && (
                    <div className="mt-3">
                      <span className="inline-block rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {alumni.employmentStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewProfile(alumni)}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20"
                    >
                      👤 View Profile
                    </button>

                    {!isCurrentUser && token && (
                      <>
                        {status === 'CONNECTED' ? (
                          <button disabled className="flex-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700 opacity-80 dark:bg-emerald-900/30 dark:text-emerald-400">
                            ✓ Connected
                          </button>
                        ) : status === 'PENDING' ? (
                          <button disabled className="flex-1 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700 opacity-80 dark:bg-amber-900/30 dark:text-amber-400">
                            ⏳ Pending
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnect(alumni)}
                            className="flex-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                          >
                            🤝 Connect
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-12 flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
          <p>Analyzing profiles with AI...</p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-16 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">How AI Search Works</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-700/50">
            <span className="mb-2 text-3xl">🧠</span>
            <h4 className="font-semibold text-slate-800 dark:text-white">Semantic Understanding</h4>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Understands the meaning of your query, not just keywords</p>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-700/50">
            <span className="mb-2 text-3xl">🎯</span>
            <h4 className="font-semibold text-slate-800 dark:text-white">Smart Matching</h4>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Matches based on skills, experience, and expertise</p>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-700/50">
            <span className="mb-2 text-3xl">⚡</span>
            <h4 className="font-semibold text-slate-800 dark:text-white">Instant Results</h4>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get relevant alumni suggestions in seconds</p>
          </div>
        </div>
      </div>
    </div>
  )
}
