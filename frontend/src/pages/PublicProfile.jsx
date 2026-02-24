import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfile, getConnectionStatus, sendConnectionRequest, getPostsForUser, deletePost } from '../api/profile'
import { useAuth } from '../context/AuthContext'

export default function PublicProfile() {
  const { type, enrollmentNumber } = useParams()
  const { user: currentUser, token } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
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

          // Fetch posts
          if (response.profile.userType === 'ALUMNI') {
            try {
              const data = await getPostsForUser(enrollmentNumber)
              const items = Array.isArray(data) ? data : data?.content || data?.posts || []
              setPosts(items)
            } catch (err) {
              console.error('Error fetching posts:', err)
              // Don't block profile rendering if posts fail
            }
          }

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

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await deletePost(postId);
        if (response.success) {
          setPosts(posts.filter((p) => p.id !== postId));
          alert('Post deleted successfully!');
        } else {
          alert(response.message || 'Failed to delete post.');
        }
      } catch (err) {
        console.error('Error deleting post:', err);
        alert(err.response?.data?.message || 'Failed to delete post.');
      }
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-slate-500">Loading profile…</div>
  }
  if (error) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-rose-500">{error}</div>
  }
  if (!profile) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-slate-500">No profile found</div>
  }

  const isSelf = currentUser?.enrollmentNumber === enrollmentNumber

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="space-y-8 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-indigo-500/10 ring-1 ring-slate-100 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:ring-white/10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="h-32 w-32 rounded-full border-4 border-indigo-500 object-cover shadow-lg" />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-indigo-500 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-4xl font-bold text-white shadow-lg">
              {(profile.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              
              {profile.department} • {profile.userType || type.toUpperCase()}
            
              {profile.passingYear && ` | Class of ${profile.passingYear}`}
              {profile.expectedPassingYear && ` | Expected ${profile.expectedPassingYear}`}
            </p>
            {profile.employmentStatus && (
              <span className={`status-badge status-${profile.employmentStatus.toLowerCase()}`} style={{ marginTop: 8, display: 'inline-block' }}>
                {profile.employmentStatus.replace(/_/g, ' ')}
              </span>
            )}
            <p>{profile.bio || 'No bio provided.'}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200">
                  GitHub ↗
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200">
                  LinkedIn ↗
                </a>
              )}
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

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">About</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{profile.bio || 'No bio provided.'}</p>
            {profile.skills && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.isArray(profile.skills)
                  ? profile.skills.map((s) => (
                      <span key={s} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        {s}
                      </span>
                    ))
                  : profile.skills}
              </div>
            )}
          </section>

          {type.toLowerCase() === 'alumni' && profile.experiences && (
            <section>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Experience</h3>
              <div className="mt-4 space-y-3">
                {profile.experiences.map((exp, i) => (
                  <div key={i} className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 dark:border-slate-700 dark:bg-white/5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{exp.jobTitle}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{exp.company}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{exp.duration}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
            {!isSelf && token && (
              <>
                {connStatus === 'NOT_CONNECTED' && (
                  <button className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500" onClick={handleConnect}>
                    Connect
                  </button>
                )}
                {connStatus === 'PENDING' && (
                  <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-200" disabled>
                    Request Pending
                  </button>
                )}
                {connStatus === 'CONNECTED' && (
                  <div className="flex flex-wrap gap-3">
                    <button className="rounded-full border border-emerald-300 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200" disabled>
                      Connected ✅
                    </button>
                    <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200" onClick={() => navigate('/chat')}>
                      Message
                    </button>
                  </div>
                )}
              </>
            )}
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>

          {/* Posts Section */}
          {posts.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Posts</h2>
              <div className="mt-4 space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3 mb-4">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                          {(profile.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{post.content}</p>
                    
                    {post.mediaUrl && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                        {post.mediaUrl.match(/\.mp4|\.webm$/i) ? (
                          <video src={post.mediaUrl} controls className="w-full" />
                        ) : (
                          <img src={post.mediaUrl} alt="Post content" className="w-full object-cover" />
                        )}
                      </div>
                    )}

                    {isSelf && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="absolute top-4 right-4 rounded-full bg-rose-50 p-1.5 text-rose-500 transition hover:bg-rose-500 hover:text-white dark:bg-rose-500/10"
                        aria-label="Delete post"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
