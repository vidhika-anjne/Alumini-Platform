import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import PostForm from '../components/PostForm'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const { userType } = useAuth()

  const load = async () => {
    const { data } = await api.get('/api/v1/posts')
    const items = Array.isArray(data?.content) ? data.content : []
    setPosts(items)
  }

  useEffect(() => { load() }, [])

  return (
    <div className=" container bg-neutral-section" style={{ maxWidth: '80%', padding: 16, margin:' 2% 20% ', borderRadius: 12 }}>
      {userType === 'alumni' && <PostForm onCreated={() => load()} />}
      
      <div className="grid">
        {Array.isArray(posts) && posts.map((p) => (
          <article key={p.id} className="card card-soft">
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

      {userType === 'alumni' && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16, color: '#667eea', textAlign: 'center' }}>💡 Help Your Juniors - Share Your Insights</h3>
          <div className="grid" style={{ gap: 25, justifyContent: 'center', alignItems: 'center', display: 'flex', flexWrap: 'wrap' }}>
            <div className="card card-soft" style={{ height:'200px', width: '300px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: 26 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>🎯 Career Advice</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Share interview tips, resume guidance, and first job experiences that helped you succeed.</p>
            </div>
            
            <div className="card card-soft" style={{ height:'200px', width: '300px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: 26 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>🏢 Industry Insights</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Share latest trends, required skills, and company cultures in your field.</p>
            </div>
            
            <div className="card card-soft" style={{ height:'200px', width: '300px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: 26 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>📚 Learning Resources</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Recommend useful courses, books, tools, or certifications that boosted your career.</p>
            </div>
            
            <div className="card card-soft" style={{ height:'200px', width: '300px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', padding: 26 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>🤝 Networking Tips</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Share how to build professional connections and leverage your network effectively.</p>
            </div>
            
            <div className="card card-soft" style={{ height:'200px', width: '300px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', padding: 26 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>💪 Personal Stories</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Tell about challenges you faced and how you overcame them to inspire others.</p>
            </div>
            
            <div className="card card-soft" style={{ height:'200px', width: '300px', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333', padding: 26 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>🌟 Mentorship</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Offer guidance sessions, answer questions, or provide one-on-one mentoring.</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '13px', fontStyle: 'italic', color: '#666', marginTop: 26 }}>
            Your experience can make a real difference in someone's career journey! 🚀
          </div>
        </div>
      )}
    </div>
  )
}
