import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [role, setRole] = useState('alumni')
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(role, enrollmentNumber, password)
      nav('/feed')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} className="card">
        <label className="label">
          Role
          <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="alumni">Alumni</option>
            <option value="student">Student</option>
          </select>
        </label>
        <label className="label">
          Enrollment Number
          <input className="input" value={enrollmentNumber} onChange={(e) => setEnrollmentNumber(e.target.value)} required />
        </label>
        <label className="label">
          Password
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p style={{ color: 'tomato' }}>{error}</p>}
        <button className="button primary" style={{ marginTop: 12 }} type="submit">Login</button>
      </form>
    </div>
  )
}
