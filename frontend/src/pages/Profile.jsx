import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import AlumniStatusBanner from '../components/AlumniStatusBanner'

export default function Profile() {
  const navigate = useNavigate()
  const { userType, user, updateUser, deleteAccount } = useAuth()
  const [profile, setProfile] = useState(user || null)
  const [msg, setMsg] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarUrlInput, setAvatarUrlInput] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

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
      setMsg('Saved successfully!')

      // Merge backend response with frontend-only fields (e.g., social links)
      const serverObj = data?.alumni || data?.student || {}
      const merged = {
        ...serverObj,
        githubUrl: profile.githubUrl || serverObj.githubUrl,
        linkedinUrl: profile.linkedinUrl || serverObj.linkedinUrl,
        bio: profile.bio || serverObj.bio,
        skills: serverObj.skills ?? profile.skills,
      }
      setProfile(merged)
      updateUser(merged)
      setIsEditing(false)
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

  const skillsArray = Array.isArray(profile?.skills) 
    ? profile.skills 
    : (profile?.skills || '').split(',').map(s => s.trim()).filter(Boolean)

  const generateShareLink = () => {
    const baseUrl = window.location.origin
    const profileLink = `${baseUrl}/profile/${userType}/${profile.enrollmentNumber}`
    setShareLink(profileLink)
    setShowShareModal(true)
    setCopied(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    setIsDeleting(true)
    try {
      await deleteAccount()
      navigate('/login')
    } catch (err) {
      setDeleteError(err?.response?.data?.message || err?.message || 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  if (!profile) return <p className="container">No profile</p>

  return (
    <div>
      <AlumniStatusBanner />
      <div className="container">
        <div className="profile-layout">
          {/* Left Sidebar - Profile Info Display */}
          <aside className="profile-sidebar">
            <div className="profile-card">
              {/* Avatar Section */}
              <div className="profile-avatar-section">
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt="Avatar" 
                    className="profile-avatar-large" 
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {((profile.name || profile.enrollmentNumber || 'U') + '').trim().charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <h2 className="profile-name">{profile.name || 'No Name'}</h2>
                <span className="profile-badge">{userType}</span>
              </div>

              {/* Bio Section */}
              <div className="profile-bio-section">
                <h3 className="profile-section-title">
                  <span>📝</span> Bio
                </h3>
                <p className="profile-bio-text">
                  {profile.bio || 'No bio added yet. Click "Edit Profile" to add one!'}
                </p>
              </div>

              {/* Info Section */}
              <div className="profile-info-section">
                <h3 className="profile-section-title">
                  <span>ℹ️</span> Information
                </h3>
                <ul className="profile-info-list">
                  <li>
                    <span className="info-icon">🎓</span>
                    <div>
                      <span className="info-label">Enrollment</span>
                      <span className="info-value">{profile.enrollmentNumber || 'N/A'}</span>
                    </div>
                  </li>
                  <li>
                    <span className="info-icon">✉️</span>
                    <div>
                      <span className="info-label">Email</span>
                      <span className="info-value">{profile.email || 'N/A'}</span>
                    </div>
                  </li>
                  {profile.githubUrl && (
                    <li>
                      <span className="info-icon">💻</span>
                      <div>
                        <span className="info-label">GitHub</span>
                        <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="info-link">
                          View Profile
                        </a>
                      </div>
                    </li>
                  )}
                  {profile.linkedinUrl && (
                    <li>
                      <span className="info-icon">💼</span>
                      <div>
                        <span className="info-label">LinkedIn</span>
                        <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="info-link">
                          View Profile
                        </a>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* Skills Section */}
              {skillsArray.length > 0 && (
                <div className="profile-skills-section">
                  <h3 className="profile-section-title">
                    <span>🛠️</span> Skills
                  </h3>
                  <div className="profile-skills-list">
                    {skillsArray.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <button 
                className="button primary profile-edit-btn" 
                onClick={generateShareLink}
              >
                Share profile                
              </button>
            </div>
          </aside>

          {/* Share Profile Modal */}
          {showShareModal && (
            <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
              <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowShareModal(false)}>×</button>
                <h3 className="share-modal-title">🔗 Share Your Profile</h3>
                <p className="share-modal-description">
                  Copy the link below to share your profile with others:
                </p>
                <div className="share-link-container">
                  <input 
                    type="text" 
                    className="input share-link-input" 
                    value={shareLink} 
                    readOnly 
                  />
                  <button 
                    className={`button ${copied ? 'success' : 'primary'}`} 
                    onClick={copyToClipboard}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="share-social-buttons">
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="button share-social-btn linkedin"
                  >
                    💼 LinkedIn
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('Check out my profile!')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="button share-social-btn twitter"
                  >
                    🐦 Twitter
                  </a>
                  <a 
                    href={`mailto:?subject=${encodeURIComponent('Check out my profile')}&body=${encodeURIComponent(`Here's my profile: ${shareLink}`)}`}
                    className="button share-social-btn email"
                  >
                    ✉️ Email
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Right Section - Edit Form */}
            <main className="profile-main">
              <div className="card profile-edit-card">
                <h2 className="profile-edit-title">Edit Profile</h2>
                
                {/* Avatar Upload Section */}
                <div className="profile-edit-section">
                  <h3 className="profile-edit-section-title">Profile Picture</h3>
                  <div className="avatar-upload-grid">
                    <div className="avatar-upload-option">
                      <label className="label">
                        Upload from file
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} 
                          className="input"
                        />
                      </label>
                      <button 
                        className="button" 
                        onClick={uploadAvatarFile} 
                        disabled={!avatarFile}
                      >
                        Upload
                      </button>
                    </div>
                    <div className="avatar-upload-option">
                      <label className="label">
                        Or set image by URL
                        <input
                          className="input"
                          placeholder="https://example.com/image.jpg"
                          value={avatarUrlInput}
                          onChange={(e) => setAvatarUrlInput(e.target.value)}
                        />
                      </label>
                      <button className="button" onClick={setAvatarByUrl}>
                        Set URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Basic Info Section */}
                <div className="profile-edit-section">
                  <h3 className="profile-edit-section-title">Basic Information</h3>
                  <label className="label">
                    Name
                    <input 
                      className="input" 
                      value={profile.name || ''} 
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                    />
                  </label>
                  <label className="label">
                    Email
                    <input 
                      className="input" 
                      value={profile.email || ''} 
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
                    />
                  </label>
                </div>

                {/* Bio Section */}
                <div className="profile-edit-section">
                  <h3 className="profile-edit-section-title">About You</h3>
                  <label className="label">
                    Bio
                    <textarea 
                      className="textarea" 
                      placeholder="Tell us about yourself, your interests, and goals..."
                      rows={4}
                      value={profile.bio || ''} 
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })} 
                    />
                  </label>
                  <label className="label">
                    Skills (comma-separated)
                    <input
                      className="input"
                      placeholder="e.g. JavaScript, React, SQL"
                      value={Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || '')}
                      onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                    />
                  </label>
                </div>

                {/* Social Links Section */}
                <div className="profile-edit-section">
                  <h3 className="profile-edit-section-title">Social Links</h3>
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
                </div>

                {/* Save Button */}
                <div className="profile-save-section">
                  <button className="button primary" onClick={save}>
                    Save Changes
                  </button>
                  {msg && <p className={`profile-msg ${msg.includes('failed') ? 'error' : 'success'}`}>{msg}</p>}
                </div>

                {/* Delete Account Section */}
                <div className="profile-delete-section">
                  <h3 className="profile-edit-section-title danger">Danger Zone</h3>
                  <p className="delete-warning-text">Once you delete your account, there is no going back. Please be certain.</p>
                  <button 
                    className="button danger" 
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </main>

          {/* Delete Account Confirmation Modal */}
          {showDeleteModal && (
            <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
              <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
                <h3 className="delete-modal-title">⚠️ Delete Account</h3>
                <p className="delete-modal-description">
                  Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                </p>
                {deleteError && <p className="delete-error">{deleteError}</p>}
                <div className="delete-modal-buttons">
                  <button 
                    className="button" 
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="button danger" 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
