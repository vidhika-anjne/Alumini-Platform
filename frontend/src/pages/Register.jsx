import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { sendOtp, verifyOtp } from '../api/otp'
import registerVisual from '../images/aitrbanner.jpg'

export default function Register() {
  const [role, setRole] = useState('alumni')
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
  const { theme } = useTheme()
  const nav = useNavigate()
  const isDark = theme === 'dark'
  const sectionClasses = `min-h-screen px-4 py-12 transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-sky-50 text-slate-900'}`
  const shellClasses = `mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl shadow-2xl ring-1 backdrop-blur-xl transition-colors duration-500 ${isDark ? 'bg-slate-900/80 text-white ring-white/10' : 'bg-sky-50/90 text-slate-900 ring-sky-100'}`
  const labelClasses = `flex flex-col gap-2 text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`
  const fieldClasses = `rounded-2xl border px-4 py-3 text-base transition focus:outline-none focus:ring-2 ${isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-indigo-400 focus:ring-indigo-400/50' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-200'}`
  const overlayClasses = isDark
    ? 'absolute inset-0 bg-gradient-to-br from-indigo-500/70 via-purple-500/60 to-pink-500/60 mix-blend-multiply'
    : 'absolute inset-0 bg-gradient-to-br from-indigo-400/40 via-purple-400/40 to-pink-300/40'
  const asideCardClasses = `absolute bottom-8 left-8 right-8 rounded-2xl p-6 backdrop-blur transition ${isDark ? 'bg-white/10 text-white' : 'bg-sky-50/90 text-slate-900 shadow-2xl ring-1 ring-sky-100'}`
  const helperTextClasses = isDark ? 'text-white/70' : 'text-slate-600'
  const accentTextClasses = isDark ? 'text-indigo-300' : 'text-indigo-600'
  const successTextClasses = isDark ? 'text-emerald-300' : 'text-emerald-600'
  const errorTextClasses = isDark ? 'text-rose-300' : 'text-rose-500'
  const visibilityButtonClasses = `absolute inset-y-1 right-2 flex items-center rounded-xl px-3 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isDark ? 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white/60' : 'bg-sky-100 text-slate-700 hover:bg-sky-200 focus-visible:outline-sky-300'}`
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!otpVerified) {
      setError('Please verify your email via OTP before registering.')
      return
    }
    try {
      const payload = role === 'alumni'
        ? { enrollmentNumber, name, email, password, passingYear, department, otp: otp.trim() }
        : { enrollmentNumber, name, email, password, passingYear: Number(passingYear) || 2024, otp: otp.trim() }
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
    if (!otp || otp.trim().length !== 6) {
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
    <section className={sectionClasses}>
      <div className={`${shellClasses} lg:flex-row`}>
        <aside className="relative hidden w-full lg:block lg:w-1/2">
          <img src={registerVisual} alt="Community of alumni connecting" className="h-full w-full object-cover" />
          <div className={overlayClasses} />
          <div className={asideCardClasses}>
            <p className="text-lg font-semibold">“Stay rooted, keep growing.”</p>
            <p className={`mt-2 text-sm ${helperTextClasses}`}>Unlock mentorships, events, and stories from the global alumni family.</p>
          </div>
        </aside>
        <div className="flex w-full flex-col gap-8 px-6 py-10 sm:px-10 lg:w-1/2">
          <div>
            <p className={`text-sm uppercase tracking-[0.25em] ${accentTextClasses}`}>Join the circle</p>
            <h2 className="mt-3 text-3xl font-semibold">Create your account</h2>
            <p className={`mt-2 text-sm ${helperTextClasses}`}>Verify your email, choose your role, and start sharing opportunities.</p>
          </div>
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <label className={labelClasses}>
              Role
              <select
                className={fieldClasses}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option className="text-slate-900" value="alumni">Alumni</option>
                <option className="text-slate-900" value="student">Student</option>
              </select>
            </label>
            <label className={labelClasses}>
              Enrollment Number
              <input
                className={fieldClasses}
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                required
              />
            </label>
            <label className={labelClasses}>
              Name
              <input
                className={fieldClasses}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className={labelClasses}>
              Email
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className={`flex-1 ${fieldClasses}`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${isDark ? 'bg-indigo-500 hover:bg-indigo-400 focus-visible:outline-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-500'}`}
                  onClick={onSendOtp}
                  disabled={sending}
                >
                  {sending ? 'Sending…' : (otpSent ? 'Resend OTP' : 'Send OTP')}
                </button>
              </div>
            </label>
            {otpSent && (
              <label className={labelClasses}>
                Enter OTP
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className={`flex-1 ${fieldClasses}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                  />
                  <button
                    type="button"
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 focus-visible:outline-emerald-400' : 'bg-emerald-500 hover:bg-emerald-400 focus-visible:outline-emerald-500/70'}`}
                    onClick={onVerifyOtp}
                    disabled={verifying}
                  >
                    {verifying ? 'Verifying…' : 'Verify OTP'}
                  </button>
                </div>
              </label>
            )}
            {otpMessage && (
              <p className={`text-sm font-medium ${successTextClasses}`}>{otpMessage}</p>
            )}
            <label className={labelClasses}>
              Password
              <div className="relative">
                <input
                  className={`${fieldClasses} pr-16`}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={visibilityButtonClasses}
                  onClick={togglePasswordVisibility}
                  aria-pressed={showPassword}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            <label className={labelClasses}>
              Passing Year
              <input
                className={fieldClasses}
                value={passingYear}
                onChange={(e) => setPassingYear(e.target.value)}
                required
              />
            </label>
            {role === 'alumni' && (
              <label className={labelClasses}>
                Department
                <input
                  className={fieldClasses}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </label>
            )}
            {error && (
              <p className={`text-sm font-medium ${errorTextClasses}`}>{error}</p>
            )}
            <button
              className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-base font-semibold text-white transition hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              type="submit"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
