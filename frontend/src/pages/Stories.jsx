import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Stories() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(8)
  const [totalPages, setTotalPages] = useState(0)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/api/v1/posts', { params: { page, size } })
      setPosts(data?.content || [])
      setTotalPages(data?.totalPages || 0)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load stories')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, size])

  return (
    <div className="container">
      <h2>Success Stories</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'tomato' }}>{error}</p>}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {posts.map((p) => (
          <article key={p.id} className="card">
            <div className="small" style={{ opacity: 0.7 }}>{p.alumni?.name || 'Alumni'}</div>
            <p>{p.content}</p>
            {p.mediaUrl && (
              <img src={p.mediaUrl} alt="story" style={{ width: '100%', borderRadius: 8 }} />
            )}
          </article>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <button className="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0}>Previous</button>
        <span className="small">Page {page + 1} of {Math.max(1, totalPages)}</span>
        <button className="button" onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))} disabled={page + 1 >= totalPages}>Next</button>
        <span className="small" style={{ marginLeft: 12 }}>Per page:</span>
        <select className="select" value={size} onChange={(e) => setSize(Number(e.target.value))}>
          <option value={6}>6</option>
          <option value={8}>8</option>
          <option value={12}>12</option>
        </select>
      </div>
      {posts.length === 0 && !loading && <p className="small">No stories yet.</p>}
    </div>
  )
}
