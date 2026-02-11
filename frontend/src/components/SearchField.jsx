import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function SearchField() {
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
    <div className="search-container" ref={containerRef}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input"
          placeholder="Search mentors, skills, alumni..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          style={{ paddingLeft: '35px' }}
        />
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
          🔍
        </span>
        {loading && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            ⏳
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="search-results">
          {results.length > 0 ? (
            results.map((res) => (
              <div 
                key={`${res.type}-${res.enrollmentNumber}`} 
                className="search-item"
                onClick={() => handleSelect(res)}
              >
                {res.avatarUrl ? (
                  <img src={res.avatarUrl} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="avatar-small">
                    {(res.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{res.name}</div>
                  <div className="small text-secondary" style={{ fontSize: '0.8rem' }}>
                    {res.type === 'ALUMNI' ? '🎓 Alumni' : '🧑‍🎓 Student'} • {res.department}
                  </div>
                  {res.currentCompany && (
                    <div className="small" style={{ color: 'var(--primary)', fontWeight: '500', fontSize: '0.75rem' }}>
                      {res.jobTitle} at {res.currentCompany}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
