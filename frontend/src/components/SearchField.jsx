import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function SearchField({ className = '' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const { token } = useAuth()

  // debounce search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    console.log('📝 Search query changed:', query)
    const timer = setTimeout(async () => {
      setLoading(true)
      console.log('🔄 Starting search for:', query)
      try {
        console.log('📡 Making API call to /api/v1/search?query=' + encodeURIComponent(query))
        const { data } = await api.get('/api/v1/search', { params: { query } })
        console.log('✅ API Response received:', data)
        console.log('   Results array:', data.results)
        console.log('   Results count:', data.results?.length || 0)
        setResults(data.results || [])
        setIsOpen(true)
      } catch (err) {
        console.error('❌ Search failed:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url
        })
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (res) => {
    setIsOpen(false)
    setQuery('')
    navigate(`/profile/${res.type.toLowerCase()}/${res.enrollmentNumber}`)
  }

  if (!token) return null

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full rounded-full border border-slate-200 bg-white/80 py-2 pl-10 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-300 dark:focus:ring-indigo-500/30"
          placeholder="Search mentors, skills, alumni..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-60">🔍</span>
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            ⏳
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          {results.length > 0 ? (
            results.map((res) => (
              <button
                type="button"
                key={`${res.type}-${res.enrollmentNumber}`}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-slate-200 dark:hover:bg-white/5"
                onClick={() => handleSelect(res)}
              >
                {res.avatarUrl ? (
                  <img src={res.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
                    {(res.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{res.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {res.type === 'ALUMNI' ? '🎓 Alumni' : '🧑‍🎓 Student'} • {res.department}
                  </p>
                  {res.currentCompany && (
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
                      {res.jobTitle} at {res.currentCompany}
                    </p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No matches found</p>
          )}
        </div>
      )}
    </div>
  )
}
