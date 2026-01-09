import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Profile() {
  const { userType, user } = useAuth()
  const [profile, setProfile] = useState(user || null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setProfile(user || null)
  }, [user])

  const save = async () => {
    setMsg('')
    try {
      if (!profile?.enrollmentNumber) return
      const url = userType === 'alumni'
        ? `/api/v1/alumni/${profile.enrollmentNumber}`
        : `/api/v1/students/${profile.enrollmentNumber}`
      const { data } = await api.patch(url, profile)
      setMsg('Saved')
      setProfile(data?.alumni || data?.student || profile)
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Update failed')
    }
  }

  if (!profile) return <p className="container">No profile</p>

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <h2>Profile ({userType})</h2>
      <div className="card">
        <label className="label">
          Name
          <input className="input" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </label>
        <label className="label">
          Email
          <input className="input" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        </label>
        {userType === 'student' && (
          <label className="label">
            Bio
            <textarea className="textarea" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </label>
        )}
        <button className="button primary" style={{ marginTop: 12 }} onClick={save}>Save</button>
        {msg && <p className="small">{msg}</p>}
      </div>
    </div>
  )
}
