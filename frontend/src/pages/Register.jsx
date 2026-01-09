import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [role, setRole] = useState('alumni')
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passingYear, setPassingYear] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = role === 'alumni'
        ? { enrollmentNumber, name, email, password, passingYear, department }
        : { enrollmentNumber, name, email, password, passingYear: Number(passingYear) || 2024 }
      const res = await register(role, payload)
      if (res.success) nav('/login')
      else setError(res.message || 'Registration failed')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <h2>Register</h2>
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
          Name
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="label">
          Email
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="label">
          Password
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label className="label">
          Passing Year
          <input className="input" value={passingYear} onChange={(e) => setPassingYear(e.target.value)} />
        </label>
        {role === 'alumni' && (
          <label className="label">
            Department
            <input className="input" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </label>
        )}
        {error && <p style={{ color: 'tomato' }}>{error}</p>}
        <button className="button primary" style={{ marginTop: 12 }} type="submit">Register</button>
      </form>
    </div>
  )
}
