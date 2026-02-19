import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import loginVisual from '../images/Untitled design.png'

export default function Login() {
  const [role, setRole] = useState('alumni')
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const { theme } = useTheme()
  const nav = useNavigate()
  const isDark = theme === 'dark'
  const sectionClasses = `min-h-screen px-4 py-12 transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev)
    const visibilityButtonClasses = `absolute inset-y-1 right-2 flex items-center rounded-xl px-3 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isDark ? 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white/60' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-slate-300'}`
  const shellClasses = `mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl ring-1 backdrop-blur-xl transition-colors duration-500 ${isDark ? 'bg-slate-900/80 text-white ring-white/10' : 'bg-white text-slate-900 ring-slate-200'}`
  const labelClasses = `flex flex-col gap-2 text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`
  const fieldClasses = `rounded-2xl border px-4 py-3 text-base transition focus:outline-none focus:ring-2 ${isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-indigo-400 focus:ring-indigo-400/50' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-200'}`
  const overlayClasses = isDark
    ? 'absolute inset-0 bg-gradient-to-br from-violet-500/70 via-indigo-500/60 to-sky-500/60 mix-blend-multiply'
    : 'absolute inset-0 bg-gradient-to-br from-sky-300/40 via-indigo-300/40 to-purple-300/40'
  const asideCardClasses = `absolute bottom-8 left-8 right-8 space-y-2 rounded-2xl p-6 backdrop-blur transition ${isDark ? 'bg-white/10 text-white' : 'bg-white/90 text-slate-900 shadow-2xl ring-1 ring-slate-100'}`
  const helperTextClasses = isDark ? 'text-white/70' : 'text-slate-600'
  const accentTextClasses = isDark ? 'text-indigo-300' : 'text-indigo-600'
  const errorTextClasses = isDark ? 'text-rose-300' : 'text-rose-500'

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(role, enrollmentNumber.trim(), password.trim())
      nav('/feed')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <section className={sectionClasses}>
      <div className={`${shellClasses} lg:flex-row`}>
        <aside className="relative hidden w-full lg:block lg:w-1/2">
          <img src={loginVisual} alt="Campus skyline at sunset" className="h-full w-full object-cover" />
          <div className={overlayClasses} />
          <div className={asideCardClasses}>
            <p className={`text-sm uppercase tracking-[0.4em] ${isDark ? 'text-sky-200' : 'text-sky-500'}`}>Welcome back</p>
            <p className="text-2xl font-semibold">Pick up where you left off.</p>
            <p className={`text-sm ${helperTextClasses}`}>Collaborate on projects, mentor juniors, and stay in the loop.</p>
          </div>
        </aside>
        <div className="flex w-full flex-col gap-8 px-6 py-10 sm:px-10 lg:w-1/2">
          <div>
            <p className={`text-sm uppercase tracking-[0.35em] ${accentTextClasses}`}>Sign in</p>
            <h2 className="mt-3 text-3xl font-semibold">Access your hub</h2>
            <p className={`mt-2 text-sm ${helperTextClasses}`}>Choose your role, enter your credentials, and continue the conversation.</p>
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
            {error && (
              <p className={`text-sm font-medium ${errorTextClasses}`}>{error}</p>
            )}
            <button
              className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-base font-semibold text-white transition hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              type="submit"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
