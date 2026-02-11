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
            <p className="text-secondary">{profile.department} | {type.toUpperCase()}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="button button-soft">GitHub</a>}
              {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="button button-soft">LinkedIn</a>}
            </div>
          </div>
        </div>

        <div className="grid" style={{ gap: 24 }}>
          <section>
            <h3>About</h3>
            <p>{profile.bio || 'No bio provided.'}</p>
            {profile.skills && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {Array.isArray(profile.skills) ? profile.skills.map(s => <span key={s} className="badge">{s}</span>) : profile.skills}
              </div>
            )}
          </section>

          {type.toLowerCase() === 'alumni' && profile.experiences && (
            <section>
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
    </div>
  )
}
