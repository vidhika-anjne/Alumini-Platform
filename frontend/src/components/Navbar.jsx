import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'

export default function Navbar() {
  const { token, userType, user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    nav('/login')
  }

  const avatar = (user?.name || user?.enrollmentNumber || 'U')
    .toString()
    .trim()
    .charAt(0)
    .toUpperCase()

  return (
    <header className="header">
      <div className="brand">
        <Link to="/dashboard" className="logo">🎓 Alumni Platform</Link>
        <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle navigation">☰</button>
      </div>
      <nav className={`nav ${open ? 'open' : ''}`}>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/feed" className={({ isActive }) => isActive ? 'active' : ''}>Feed</NavLink>
        <NavLink to="/stories" className={({ isActive }) => isActive ? 'active' : ''}>Stories</NavLink>
        {token && <NavLink to="/mentors" className={({ isActive }) => isActive ? 'active' : ''}>Mentors</NavLink>}
        {token && <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}>Chat</NavLink>}
        {token && <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>}
        {!token && <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Login</NavLink>}
        {!token && <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>Register</NavLink>}
      </nav>
      <div className="actions">
        <button className="icon-btn" onClick={toggle} title="Toggle theme">{theme === 'light' ? '🌙' : '☀️'}</button>
        {token && (
          <div className="user">
            <div className="avatar" aria-label="User avatar">{avatar}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || user?.enrollmentNumber}</div>
              <div className="user-role small">{userType}</div>
            </div>
            <button className="button" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  )
}
