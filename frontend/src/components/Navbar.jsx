import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { token, userType, user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const nav = useNavigate()
  const handleLogout = () => {
    logout()
    nav('/login')
  }
  return (
    <header className="header">
      <strong>🎓 Alumni Platform</strong>
      <nav>
        <Link to="/feed">Feed</Link>
        {token && <Link to="/profile">Profile</Link>}
        {!token && <Link to="/login">Login</Link>}
        {!token && <Link to="/register">Register</Link>}
      </nav>
      <span className="spacer" />
      <button className="button" onClick={toggle}>{theme === 'light' ? 'Dark' : 'Light'} mode</button>
      {token && (
        <span style={{ marginLeft: 12 }} className="small">
          {userType} · {user?.enrollmentNumber}
        </span>
      )}
      {token && (
        <button className="button" style={{ marginLeft: 8 }} onClick={handleLogout}>Logout</button>
      )}
    </header>
  )
}
