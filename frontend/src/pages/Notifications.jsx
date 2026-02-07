import { useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Notifications() {
  const { token, user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingAction, setLoadingAction] = useState({})

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
      <div className="container">
        <div className="section">
          <h1>Notifications</h1>
          <div className="loading">Loading notifications...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section">
        <h1>Notifications</h1>
        
        {error && (
          <div className="error">
            <p>{error}</p>
            <button className="button" onClick={fetchPendingRequests}>Try Again</button>
          </div>
        )}

        <div className="notification-section">
          <h2>Connection Requests</h2>
          
          {pendingRequests.length === 0 ? (
            <div className="empty-state">
              <p>No pending connection requests</p>
              <span className="muted">You're all caught up! Check back later for new connection requests.</span>
            </div>
          ) : (
            <div className="notifications-list">
              {pendingRequests.map((request) => (
                <div key={request.requesterId} className="notification-card">
                  <div className="notification-avatar">
                    {request.requesterData?.avatarUrl ? (
                      <img 
                        src={request.requesterData.avatarUrl} 
                        alt="Avatar" 
                        className="avatar" 
                        style={{ objectFit: 'cover' }} 
                      />
                    ) : (
                      <div className="avatar">
                        {(request.requesterData?.name || request.requesterId || 'U')
                          .toString()
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h3>{request.requesterData?.name || `User ${request.requesterId}`}</h3>
                      <span className="notification-time">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    
                    <div className="notification-details">
                      {request.requesterData?.company && (
                        <span className="detail-item">
                          <strong>Company:</strong> {request.requesterData.company}
                        </span>
                      )}
                      {request.requesterData?.jobTitle && (
                        <span className="detail-item">
                          <strong>Position:</strong> {request.requesterData.jobTitle}
                        </span>
                      )}
                      {request.requesterData?.department && (
                        <span className="detail-item">
                          <strong>Department:</strong> {request.requesterData.department}
                        </span>
                      )}
                      {request.requesterData?.passingYear && (
                        <span className="detail-item">
                          <strong>Passing Year:</strong> {request.requesterData.passingYear}
                        </span>
                      )}
                    </div>
                    
                    <p className="notification-message">
                      wants to connect with you
                    </p>
                  </div>
                  
                  <div className="notification-actions">
                    <button 
                      className="button primary"
                      onClick={() => acceptRequest(request.requesterId)}
                      disabled={loadingAction[request.requesterId] === 'accepting'}
                    >
                      {loadingAction[request.requesterId] === 'accepting' ? 'Accepting...' : 'Accept'}
                    </button>
                    <button 
                      className="button secondary"
                      onClick={() => rejectRequest(request.requesterId)}
                      disabled={loadingAction[request.requesterId] === 'rejecting'}
                    >
                      {loadingAction[request.requesterId] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}