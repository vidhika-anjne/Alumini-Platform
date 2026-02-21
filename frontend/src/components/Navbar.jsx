import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState, useEffect } from 'react'
import api from '../api/client'
import SearchField from './SearchField'
import logo from '../images/White-Logos-for-Acropolis.png'

const desktopLinkClass = ({ isActive }) =>
  `relative rounded-full px-3 py-1 text-sm font-semibold transition ${
    isActive
      ? 'bg-slate-900/10 text-slate-900 dark:bg-white/10 dark:text-white'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
  }`

const mobileLinkClass = ({ isActive }) =>
  `w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-indigo-500/90 text-white shadow'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'
  }`

export default function Navbar() {
  const { token, userType, user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const nav = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  const handleLogout = () => {
    logout()
    nav('/login')
  }

  const avatar = (user?.name || user?.enrollmentNumber || 'U')
    .toString()
    .trim()
    .charAt(0)
    .toUpperCase()

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!token) {
        setNotificationCount(0)
        return
      }
      try {
        const { data } = await api.get('/api/v1/connections/pending')
        setNotificationCount(data?.length || 0)
      } catch {
        setNotificationCount(0)
      }
    }

    fetchNotificationCount()
    const interval = setInterval(fetchNotificationCount, 30000)
    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-sky-50/90 backdrop-blur supports-[backdrop-filter]:bg-sky-50/80 dark:border-slate-800 dark:bg-slate-950/70 ">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/feed" className="inline-flex items-center gap-2">
            <img src={logo} alt="Company Logo" className="h-10 max-w-[160px] object-contain" />
            <span className="sr-only">Home</span>
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 p-2 text-xl text-slate-600 shadow-sm transition hover:border-indigo-500 hover:text-indigo-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/feed" className={desktopLinkClass}>Feed</NavLink>
          {token && <NavLink to="/mentors" className={desktopLinkClass}>Mentors</NavLink>}
          {token && <NavLink to="/ai-search" className={desktopLinkClass}>🤖 AI Search</NavLink>}
          {token && <NavLink to="/chat" className={desktopLinkClass}>Chat</NavLink>}
          {token && (
            <NavLink to="/notifications" className={desktopLinkClass}>
              <span className="relative inline-flex items-center gap-1">
                Notifications
                {notificationCount > 0 && (
                  <span className="absolute -right-3 -top-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[0.65rem] font-semibold text-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </span>
            </NavLink>
          )}
          {token && <NavLink to="/profile" className={desktopLinkClass}>Profile</NavLink>}
          {!token && <NavLink to="/login" className={desktopLinkClass}>Login</NavLink>}
          {!token && <NavLink to="/register" className={desktopLinkClass}>Register</NavLink>}
        </nav>

        {token && (
          <div className="hidden flex-1 md:block">
            <SearchField />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
            onClick={toggle}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {token && (
            <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-2 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 lg:flex">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-lg font-semibold text-white" aria-label="User avatar">
                  {avatar}
                </div>
              )}
              <button
                type="button"
                className="text-left"
                onClick={() => nav('/profile')}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || user?.enrollmentNumber}</p>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{userType}</span>
              </button>
              <button
                className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="border-t border-slate-200 dark:border-slate-800 px-4 pb-4 pt-3 space-y-2">
          {token && (
            <div className="pb-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-lg font-semibold text-white">
                    {avatar}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{user?.name || user?.enrollmentNumber}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{userType}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <NavLink to="/feed" className={mobileLinkClass}>Feed</NavLink>
            {token && <NavLink to="/mentors" className={mobileLinkClass}>Mentors</NavLink>}
            {token && <NavLink to="/ai-search" className={mobileLinkClass}>🤖 AI Search</NavLink>}
            {token && <NavLink to="/chat" className={mobileLinkClass}>Chat</NavLink>}
            {token && (
              <NavLink to="/notifications" className={mobileLinkClass}>
                Notifications
                {notificationCount > 0 && (
                  <span className="ml-2 inline-flex min-w-[32px] items-center justify-center rounded-full bg-rose-500 px-2 text-xs font-semibold text-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </NavLink>
            )}
            {token && <NavLink to="/profile" className={mobileLinkClass}>Profile</NavLink>}
            {!token && <NavLink to="/login" className={mobileLinkClass}>Login</NavLink>}
            {!token && <NavLink to="/register" className={mobileLinkClass}>Register</NavLink>}
          </div>

          {token && (
            <div className="space-y-3 pt-2">
              <SearchField />
              <button
                className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

  )
}
