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

  const inputClasses =
    'mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-300 dark:focus:ring-indigo-500/30'

  useEffect(() => {
    setProfile(user || null)
  }, [user])

  const normalizedUserType = (userType || '').toLowerCase()
  const apiBase = normalizedUserType === 'alumni' ? '/api/v1/alumni' : '/api/v1/students'
  const enrollmentNumber = profile?.enrollmentNumber

  const skillsArray = Array.isArray(profile?.skills)
    ? profile.skills.filter(Boolean)
    : typeof profile?.skills === 'string'
    ? profile.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
    : []

  const handleAuthUpdate = (data) => {
    const updated = data?.alumni || data?.student || data
    if (updated) {
      setProfile(updated)
      updateUser(updated)
    }
    return updated
  }

  const save = async () => {
    if (!profile || !enrollmentNumber) {
      setMsg('Missing profile data to save')
      return
    }

    try {
      setMsg('Saving…')
      const payload = {
        ...profile,
        skills: Array.isArray(profile.skills) ? profile.skills : skillsArray,
      }
      const { data } = await api.patch(`${apiBase}/${enrollmentNumber}`, payload)
      handleAuthUpdate(data)
      setMsg('Profile updated successfully')
    } catch (error) {
      console.error('Profile update failed', error)
      const message = error.response?.data?.message || 'Profile update failed'
      setMsg(message)
    }
  }

  const uploadAvatarFile = async () => {
    if (!avatarFile || !enrollmentNumber) {
      setMsg('Please choose an image file first')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', avatarFile)
      const { data } = await api.post(`${apiBase}/${enrollmentNumber}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      handleAuthUpdate(data)
      setAvatarFile(null)
      setMsg('Avatar updated successfully')
    } catch (error) {
      console.error('Avatar upload failed', error)
      const message = error.response?.data?.message || 'Avatar upload failed'
      setMsg(message)
    }
  }

  const setAvatarByUrl = async () => {
    if (!avatarUrlInput.trim() || !enrollmentNumber) {
      setMsg('Provide an image URL first')
      return
    }

    try {
      const { data } = await api.post(`${apiBase}/${enrollmentNumber}/avatar`, { imageUrl: avatarUrlInput.trim() })
      handleAuthUpdate(data)
      setAvatarUrlInput('')
      setMsg('Avatar updated successfully')
    } catch (error) {
      console.error('Avatar URL update failed', error)
      const message = error.response?.data?.message || 'Failed to set avatar URL'
      setMsg(message)
    }
  }

  const generateShareLink = () => {
    if (!enrollmentNumber) {
      setMsg('Cannot share profile without enrollment number')
      return
    }
    const baseType = normalizedUserType || 'student'
    const url = `${window.location.origin}/profile/${baseType}/${enrollmentNumber}`
    setShareLink(url)
    setCopied(false)
    setShowShareModal(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed', error)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    setIsDeleting(true)
    try {
      await deleteAccount()
      setShowDeleteModal(false)
      navigate('/login', { replace: true })
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete account'
      setDeleteError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-slate-500">
        No profile data available yet.
      </div>
    )
  }

  const initials = ((profile.name || profile.enrollmentNumber || 'U') + '').trim().charAt(0).toUpperCase()

  return (
    <div className="space-y-6">
      <AlumniStatusBanner />
      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[360px,1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-sky-50/90 p-6 shadow-xl shadow-indigo-500/5 ring-1 ring-sky-100 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:ring-white/5">
              <div className="flex flex-col items-center text-center">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="h-32 w-32 rounded-full border-4 border-indigo-500 object-cover shadow-lg" />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-indigo-500 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-4xl font-bold text-white shadow-lg">
                    {initials}
                  </div>
                )}
                <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{profile.name || 'No Name'}</h2>
                <span className="mt-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-200">
                  {userType}
                </span>
              </div>

              <div className="mt-6 space-y-4 text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bio</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{profile.bio || 'No bio added yet.'}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Details</p>
                  <div className="space-y-2 rounded-2xl bg-sky-100/80 p-3 dark:bg-white/5">
                    <div>
                      <p className="text-xs text-slate-500">Enrollment</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.enrollmentNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="break-words text-sm font-semibold text-slate-900 dark:text-white">{profile.email || 'N/A'}</p>
                    </div>
                    {profile.githubUrl && (
                      <div>
                        <p className="text-xs text-slate-500">GitHub</p>
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300"
                        >
                          View Profile ↗
                        </a>
                      </div>
                    )}
                    {profile.linkedinUrl && (
                      <div>
                        <p className="text-xs text-slate-500">LinkedIn</p>
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300"
                        >
                          View Profile ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                {skillsArray.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skillsArray.map((skill) => (
                        <span key={skill} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl"
                onClick={generateShareLink}
              >
                Share profile
              </button>
            </div>
          </aside>

          <main className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-sky-50/90 p-6 shadow-xl shadow-indigo-500/5 ring-1 ring-sky-100 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:ring-white/5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                {msg && (
                  <span className={`text-sm font-semibold ${msg.includes('failed') ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {msg}
                  </span>
                )}
              </div>

              <section className="mt-6 space-y-4">
                <p className="text-sm font-semibold text-slate-500">Profile Picture</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="rounded-2xl border border-slate-200/80 p-4 text-sm text-slate-600 shadow-inner dark:border-slate-800/80 dark:text-slate-300">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Upload from file</span>
                    <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="mt-3 block text-xs" />
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                      onClick={uploadAvatarFile}
                      disabled={!avatarFile}
                    >
                      Upload
                    </button>
                  </label>
                  <label className="rounded-2xl border border-slate-200/80 p-4 text-sm text-slate-600 shadow-inner dark:border-slate-800/80 dark:text-slate-300">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Or set image by URL</span>
                    <input className={`${inputClasses} mt-3`} placeholder="https://example.com/image.jpg" value={avatarUrlInput} onChange={(e) => setAvatarUrlInput(e.target.value)} />
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200"
                      onClick={setAvatarByUrl}
                    >
                      Set URL
                    </button>
                  </label>
                </div>
              </section>

              <section className="mt-8 space-y-4">
                <p className="text-sm font-semibold text-slate-500">Basic Information</p>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                    Name
                    <input className={inputClasses} value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </label>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                    Email
                    <input className={inputClasses} value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </label>
                </div>
              </section>

              <section className="mt-8 space-y-4">
                <p className="text-sm font-semibold text-slate-500">About You</p>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                  Bio
                  <textarea
                    className={`${inputClasses} resize-none`}
                    rows={4}
                    placeholder="Tell us about yourself, your interests, and goals..."
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                  Skills (comma-separated)
                  <input
                    className={inputClasses}
                    placeholder="e.g. JavaScript, React, SQL"
                    value={Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || ''}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  />
                </label>
              </section>

              <section className="mt-8 space-y-4">
                <p className="text-sm font-semibold text-slate-500">Social Links</p>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                  GitHub URL
                  <input
                    className={inputClasses}
                    placeholder="https://github.com/username"
                    value={profile.githubUrl || ''}
                    onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                  LinkedIn URL
                  <input
                    className={inputClasses}
                    placeholder="https://www.linkedin.com/in/username"
                    value={profile.linkedinUrl || ''}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                  />
                </label>
              </section>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500" onClick={save}>
                  Save Changes
                </button>
                {msg && (
                  <p className={`text-sm font-semibold ${msg.includes('failed') ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {msg}
                  </p>
                )}
              </div>

              <div className="mt-10 rounded-2xl border border-rose-200/60 bg-rose-50/60 p-6 dark:border-rose-500/30 dark:bg-rose-500/10">
                <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Danger Zone</p>
                <p className="mt-3 text-sm text-rose-500">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="mt-4 inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500" onClick={() => setShowDeleteModal(true)}>
                  Delete Account
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4" onClick={() => setShowShareModal(false)}>
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-sky-50/95 p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95" onClick={(e) => e.stopPropagation()}>
            <button className="float-right text-2xl text-slate-500" onClick={() => setShowShareModal(false)}>
              ×
            </button>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Share Your Profile</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Copy the link below to share your profile with others:</p>
            <div className="mt-4 flex flex-col gap-3">
              <input type="text" className={inputClasses} value={shareLink} readOnly />
              <button className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${copied ? 'bg-emerald-500' : 'bg-indigo-600'} transition`} onClick={copyToClipboard}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
              <a
                className="flex-1 rounded-2xl bg-[#0A66C2] px-4 py-2 text-center text-white"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="flex-1 rounded-2xl bg-[#1DA1F2] px-4 py-2 text-center text-white"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('Check out my profile!')}`}
                target="_blank"
                rel="noreferrer"
              >
                Twitter
              </a>
              <a
                className="flex-1 rounded-2xl bg-slate-900 px-4 py-2 text-center text-white dark:bg-white dark:text-slate-900"
                href={`mailto:?subject=${encodeURIComponent('Check out my profile')}&body=${encodeURIComponent(`Here's my profile: ${shareLink}`)}`}
              >
                Email
              </a>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4" onClick={() => setShowDeleteModal(false)}>
          <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white/95 p-6 shadow-2xl dark:border-rose-500/40 dark:bg-slate-950" onClick={(e) => e.stopPropagation()}>
            <button className="float-right text-2xl text-rose-400" onClick={() => setShowDeleteModal(false)}>
              ×
            </button>
            <h3 className="text-xl font-semibold text-rose-600 dark:text-rose-300">Delete Account</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            {deleteError && (
              <p className="mt-3 rounded-2xl bg-rose-100 px-4 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-200" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60" onClick={handleDeleteAccount} disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
