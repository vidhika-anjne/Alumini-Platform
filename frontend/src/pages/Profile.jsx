import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Profile() {
  const { userType, user, updateUser } = useAuth()
  const [profile, setProfile] = useState(user || null)
  const [msg, setMsg] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarUrlInput, setAvatarUrlInput] = useState('')

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
      // Prepare payload: ensure student skills is an array if present
      const payload = { ...profile }
      if (userType === 'student') {
        if (typeof payload.skills === 'string') {
          payload.skills = payload.skills
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        }
      }

      const { data } = await api.patch(url, payload)
      setMsg('Saved')

      // Merge backend response with frontend-only fields (e.g., social links)
      const serverObj = data?.alumni || data?.student || {}
      const merged = {
        ...serverObj,
        githubUrl: profile.githubUrl || serverObj.githubUrl,
        linkedinUrl: profile.linkedinUrl || serverObj.linkedinUrl,
        // Keep skills if server returned them; otherwise preserve current (for alumni only client-side)
        skills: serverObj.skills ?? profile.skills,
      }
      setProfile(merged)
      updateUser(merged)
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Update failed')
    }
  }

  const avatarEndpoint = (en) => userType === 'alumni'
    ? `/api/v1/alumni/${en}/avatar`
    : `/api/v1/students/${en}/avatar`

  const uploadAvatarFile = async () => {
    setMsg('')
    try {
      if (!profile?.enrollmentNumber) return
      if (!avatarFile) {
        setMsg('Select a file first')
        return
      }
      const form = new FormData()
      form.append('file', avatarFile)
      const { data } = await api.post(avatarEndpoint(profile.enrollmentNumber), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const serverObj = data?.alumni || data?.student || {}
      const merged = { ...profile, ...serverObj }
      setProfile(merged)
      updateUser(merged)
      setMsg('Profile image updated')
      setAvatarFile(null)
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Upload failed')
    }
  }

  const setAvatarByUrl = async () => {
    setMsg('')
    try {
      if (!profile?.enrollmentNumber) return
      const url = (avatarUrlInput || '').trim()
      if (!url) {
        setMsg('Enter an image URL')
        return
      }
      const { data } = await api.post(
        avatarEndpoint(profile.enrollmentNumber),
        { imageUrl: url }
      )
      const serverObj = data?.alumni || data?.student || {}
      const merged = { ...profile, ...serverObj }
      setProfile(merged)
      updateUser(merged)
      setMsg('Profile image updated')
      setAvatarUrlInput('')
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Update failed')
    }
  }

  if (!profile) return <p className="container">No profile</p>

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <h2>Profile ({userType})</h2>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              {((profile.name || profile.enrollmentNumber || 'U') + '').trim().charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <label className="label" style={{ marginBottom: 8 }}>
              Upload image (file)
              <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            </label>
            <button className="button" onClick={uploadAvatarFile} disabled={!avatarFile}>Upload</button>
          </div>
        </div>
        <label className="label">
          Or set image by URL
          <input
            className="input"
            placeholder="https://example.com/image.jpg"
            value={avatarUrlInput}
            onChange={(e) => setAvatarUrlInput(e.target.value)}
          />
        </label>
        <button className="button" onClick={setAvatarByUrl} style={{ marginBottom: 12 }}>Set Image URL</button>
        <label className="label">
          Name
          <input className="input" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </label>
        <label className="label">
          Email
          <input className="input" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        </label>
        <label className="label">
          GitHub URL
          <input
            className="input"
            placeholder="https://github.com/username"
            value={profile.githubUrl || ''}
            onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
          />
        </label>
        <label className="label">
          LinkedIn URL
          <input
            className="input"
            placeholder="https://www.linkedin.com/in/username"
            value={profile.linkedinUrl || ''}
            onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
          />
        </label>
        {userType === 'student' && (
          <label className="label">
            Bio
            <textarea className="textarea" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </label>
        )}
        {userType === 'student' && (
          <label className="label">
            Skills (comma-separated)
            <input
              className="input"
              placeholder="e.g. JavaScript, React, SQL"
              value={Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || '')}
              onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
            />
          </label>
        )}
        <button className="button primary" style={{ marginTop: 12 }} onClick={save}>Save</button>
        {msg && <p className="small">{msg}</p>}
      </div>
    </div>
  )
}
