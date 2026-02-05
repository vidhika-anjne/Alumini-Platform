import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState, useEffect } from 'react'
import logo from '../images/White-Logos-for-Acropolis.png'

export default function Navbar() {
  const { token, userType, user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const nav = useNavigate()
  const location = useLocation()
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

  // Close the mobile menu on any route change (e.g., when a nav option is clicked)
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header className="header">
      <div className="brand">
        <Link to="/dashboard" className="logo">
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: "150px", height: "auto", cursor: "pointer" }}
          />
          </Link>
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
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="avatar" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="avatar" aria-label="User avatar">{avatar}</div>
            )}
            <div className="user-info" Link to="/profile">
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
