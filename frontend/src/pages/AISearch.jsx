import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchAlumniByAI, checkEmbeddingServiceHealth } from '../api/embedding'
import { getProfile, getConnectionStatus, sendConnectionRequest } from '../api/profile'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import './AISearch.css'

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
    const type = 'alumni'
    navigate(`/profile/${type}/${alumni.enrollmentNumber}`)
  }

  // Handle connect
  const handleConnect = async (alumni) => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      await sendConnectionRequest(alumni.enrollmentNumber)
      
      // Update status
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

  // Get similarity percentage
  const getSimilarityPercentage = (similarity) => {
    return Math.round(similarity * 100)
  }

  // Get match quality label
  const getMatchQuality = (similarity) => {
    if (similarity >= 0.7) return { label: 'Excellent Match', color: '#10b981' }
    if (similarity >= 0.5) return { label: 'Good Match', color: '#3b82f6' }
    if (similarity >= 0.3) return { label: 'Fair Match', color: '#f59e0b' }
    return { label: 'Low Match', color: '#6b7280' }
  }

  return (
    <div className="ai-search-page">
      <div className="ai-search-header">
        <h1>🤖 AI-Powered Alumni Search</h1>
        <p className="subtitle">
          Use natural language to find alumni with specific skills, experience, or expertise
        </p>
      </div>

      {!serviceAvailable && (
        <div className="service-warning">
          <span>⚠️ AI Search service is currently unavailable. Please ensure the embedding service is running.</span>
          <button 
            className="btn-retry" 
            onClick={checkServiceStatus}
            style={{ 
              marginLeft: '15px', 
              padding: '2px 8px', 
              background: '#fef3c7', 
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            🔄 Retry Connection
          </button>
        </div>
      )}

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., I need a mentor in machine learning and Python"
              className="search-input"
              disabled={!serviceAvailable}
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={loading || !serviceAvailable || !query.trim()}
            >
              {loading ? '🔄 Searching...' : '🔍 Search'}
            </button>
          </div>
        </form>

        {/* Example Queries */}
        {!searching && results.length === 0 && (
          <div className="example-queries">
            <h3>Try these example searches:</h3>
            <div className="example-chips">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  className="example-chip"
                  onClick={() => handleExampleClick(example)}
                  disabled={!serviceAvailable}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="results-section">
            <h2>Found {results.length} matching alumni</h2>
            <p className="results-subtitle">
              Showing results for: <strong>"{query}"</strong>
            </p>

            <div className="results-grid">
              {results.map((result, idx) => {
                const alumni = result.alumni
                const similarity = result.similarity
                const matchQuality = getMatchQuality(similarity)
                const status = connectionStatus[alumni.enrollmentNumber] || 'NONE'
                const isCurrentUser = alumni.enrollmentNumber === currentId

                return (
                  <div key={idx} className="alumni-card">
                    <div className="card-header">
                      <div className="alumni-info">
                        {alumni.avatarUrl ? (
                          <img 
                            src={alumni.avatarUrl} 
                            alt={alumni.name} 
                            className="alumni-avatar"
                          />
                        ) : (
                          <div className="alumni-avatar">
                            {alumni.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="alumni-name">{alumni.name}</h3>
                          <p className="alumni-department">{alumni.department}</p>
                          <p className="alumni-year">Class of {alumni.passingYear}</p>
                        </div>
                      </div>
                      
                      <div className="match-score">
                        <div 
                          className="score-circle"
                          style={{ borderColor: matchQuality.color }}
                        >
                          <span className="score-number">
                            {getSimilarityPercentage(similarity)}%
                          </span>
                        </div>
                        <span 
                          className="match-label"
                          style={{ color: matchQuality.color }}
                        >
                          {matchQuality.label}
                        </span>
                      </div>
                    </div>

                    {alumni.bio && (
                      <div className="alumni-bio">
                        <p>{alumni.bio.substring(0, 150)}{alumni.bio.length > 150 ? '...' : ''}</p>
                      </div>
                    )}

                    {alumni.employmentStatus && (
                      <div className="alumni-status">
                        <span className={`status-badge status-${alumni.employmentStatus.toLowerCase()}`}>
                          {alumni.employmentStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}

                    <div className="card-actions">
                      <button 
                        className="btn-view-profile"
                        onClick={() => handleViewProfile(alumni)}
                      >
                        👤 View Profile
                      </button>
                      
                      {!isCurrentUser && token && (
                        <>
                          {status === 'CONNECTED' ? (
                            <button className="btn-connected" disabled>
                              ✓ Connected
                            </button>
                          ) : status === 'PENDING' ? (
                            <button className="btn-pending" disabled>
                              ⏳ Pending
                            </button>
                          ) : (
                            <button 
                              className="btn-connect"
                              onClick={() => handleConnect(alumni)}
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
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing profiles with AI...</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3>How AI Search Works</h3>
        <div className="info-cards">
          <div className="info-card">
            <span className="info-icon">🧠</span>
            <h4>Semantic Understanding</h4>
            <p>Understands the meaning of your query, not just keywords</p>
          </div>
          <div className="info-card">
            <span className="info-icon">🎯</span>
            <h4>Smart Matching</h4>
            <p>Matches based on skills, experience, and expertise</p>
          </div>
          <div className="info-card">
            <span className="info-icon">⚡</span>
            <h4>Instant Results</h4>
            <p>Get relevant alumni suggestions in seconds</p>
          </div>
        </div>
      </div>
    </div>
  )
}
