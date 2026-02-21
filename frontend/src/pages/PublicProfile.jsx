import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfile, getConnectionStatus, sendConnectionRequest } from '../api/profile'
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
      setError('')
      try {
        // Use unified profile API
        const response = await getProfile(enrollmentNumber)
        
        if (response.success && response.profile) {
          setProfile(response.profile)

          // Check connection status
          if (token && currentUser && enrollmentNumber !== currentUser.enrollmentNumber) {
            try {
              const status = await getConnectionStatus(enrollmentNumber)
              if (status.connected) setConnStatus('CONNECTED')
              else if (status.pending) setConnStatus('PENDING')
              else setConnStatus('NOT_CONNECTED')
            } catch (err) {
              // Connection status check failed, but continue
              setConnStatus('NOT_CONNECTED')
            }
          }
        } else {
          setError(response.message || 'Profile not found')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err.response?.data?.message || 'Profile not found')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [type, enrollmentNumber, token, currentUser])

  const handleConnect = async () => {
    try {
      await sendConnectionRequest(enrollmentNumber)
      setConnStatus('PENDING')
      alert('Connection request sent successfully!')
    } catch (err) {
      console.error('Error sending connection request:', err)
      alert(err.response?.data?.message || 'Failed to send request')
    }
  }

  if (loading) return <div className="container">Loading profile...</div>
  if (error) return <div className="container text-error">{error}</div>
  if (!profile) return <div className="container">No profile found</div>

  const isSelf = currentUser?.enrollmentNumber === enrollmentNumber

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 800, margin: '2rem auto' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="avatar" style={{ width: 120, height: 120, borderRadius: '50%' }} />
          ) : (
            <div className="avatar" style={{ width: 120, height: 120, fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(profile.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ margin: 0 }}>{profile.name}</h1>
            <p className="text-secondary">
              {profile.department} | {profile.userType || type.toUpperCase()}
              {profile.passingYear && ` | Class of ${profile.passingYear}`}
              {profile.expectedPassingYear && ` | Expected ${profile.expectedPassingYear}`}
            </p>
            {profile.employmentStatus && (
              <span className={`status-badge status-${profile.employmentStatus.toLowerCase()}`} style={{ marginTop: 8, display: 'inline-block' }}>
                {profile.employmentStatus.replace(/_/g, ' ')}
              </span>
            )}
            <p>{profile.bio || 'No bio provided.'}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="button button-soft">GitHub</a>}
              {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="button button-soft">LinkedIn</a>}
            </div>
            {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 8 }}>Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.skills.map((s, i) => <span key={i} className="badge">{s}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {type.toLowerCase() === 'alumni' && profile.experiences && profile.experiences.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <h3>Experience</h3>
            {profile.experiences.map((exp, i) => (
              <div key={i} className="card-soft" style={{ marginBottom: 12 }}>
                <strong>{exp.jobTitle}</strong> at <span>{exp.company}</span>
                <div className="small text-secondary">{exp.duration}</div>
              </div>
            ))}
          </section>
        )}

        <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', gap: 12 }}>
          {!isSelf && token && (
            <>
              {connStatus === 'NOT_CONNECTED' && (
                <button className="button" onClick={handleConnect}>Connect</button>
              )}
              {connStatus === 'PENDING' && (
                <button className="button button-soft" disabled>Request Pending</button>
              )}
              {connStatus === 'CONNECTED' && (
                <>
                  <button className="button button-soft" disabled>Connected ✅</button>
                  <button className="button" onClick={() => navigate('/chat')}>Message</button>
                </>
              )}
            </>
          )}
          <button className="button button-soft" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  )
}
