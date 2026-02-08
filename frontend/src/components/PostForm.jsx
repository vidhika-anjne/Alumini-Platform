import { useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function PostForm({ onCreated }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!user?.id) {
      setError('Missing alumni id')
      return
    }
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('content', content)
      if (file) form.append('media', file)
      const { data } = await api.post(`/api/v1/posts/create/${user.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setContent('')
      setFile(null)
      onCreated?.(data)
    } catch (err) {
      setError(err?.response?.data || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 16 }}>
      <h4>Create Post</h4>
      <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} rows={1} placeholder="What's happening?" />
      <input className="" type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files[0])} />
      {error && <p style={{ color: 'tomato' }}>{error}</p>}
      <button className="button primary" disabled={loading} type="submit">{loading ? 'Posting…' : 'Post'}</button>
    </form>
  )
}
