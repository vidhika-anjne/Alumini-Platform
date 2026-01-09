import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import PostForm from '../components/PostForm'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const { userType } = useAuth()

  const load = async () => {
    const { data } = await api.get('/api/v1/posts')
    setPosts(data || [])
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <h2>Feed</h2>
      {userType === 'alumni' && <PostForm onCreated={() => load()} />}
      <div className="grid">
        {posts.map((p) => (
          <article key={p.id} className="card">
            <p>{p.content}</p>
            {p.mediaUrl && (
              p.mediaUrl.match(/\.mp4|\.webm$/i) ? (
                <video src={p.mediaUrl} controls style={{ maxWidth: '100%', borderRadius: 8 }} />
              ) : (
                <img src={p.mediaUrl} alt="media" style={{ maxWidth: '100%', borderRadius: 8 }} />
              )
            )}
            <div className="small">by alumni #{p.alumni?.id}</div>
          </article>
        ))}
      </div>
    </div>
  )
}
