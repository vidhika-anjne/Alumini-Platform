import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sendOtp, verifyOtp } from '../api/otp'

export default function Register() {
  const [role, setRole] = useState('alumni')
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passingYear, setPassingYear] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const { register } = useAuth()
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!otpVerified) {
      setError('Please verify your email via OTP before registering.')
      return
    }
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

  const onSendOtp = async () => {
    setOtpMessage('')
    setError('')
    setOtpVerified(false)
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email to receive OTP.')
      return
    }
    try {
      setSending(true)
      const res = await sendOtp(email)
      setOtpSent(true)
      setOtpMessage(res.message || 'OTP sent. Check your email.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP')
    } finally {
      setSending(false)
    }
  }

  const onVerifyOtp = async () => {
    setOtpMessage('')
    setError('')
    if (!otp || otp.trim().length < 4) {
      setError('Enter the OTP received in email.')
      return
    }
    try {
      setVerifying(true)
      const res = await verifyOtp(email, otp.trim())
      if (res.success) {
        setOtpVerified(true)
        setOtpMessage('Email verified successfully!')
      } else {
        setOtpVerified(false)
        setError(res.message || 'Invalid OTP')
      }
    } catch (err) {
      setOtpVerified(false)
      setError(err?.response?.data?.message || 'Failed to verify OTP')
    } finally {
      setVerifying(false)
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
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" style={{ flex: 1 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="button" className="button" onClick={onSendOtp} disabled={sending}>
              {sending ? 'Sending…' : (otpSent ? 'Resend OTP' : 'Send OTP')}
            </button>
          </div>
        </label>
        {otpSent && (
          <label className="label">
            Enter OTP
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" style={{ flex: 1 }} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" />
              <button type="button" className="button" onClick={onVerifyOtp} disabled={verifying}>
                {verifying ? 'Verifying…' : 'Verify OTP'}
              </button>
            </div>
          </label>
        )}
        {otpMessage && <p style={{ color: 'seagreen' }}>{otpMessage}</p>}
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
