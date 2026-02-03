import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer-inner">
        <div className="footer-left">
          <span className="small">© 2026 Alumni Platform</span>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/feed">Feed</Link>
          <Link to="/stories">Stories</Link>
          <a href="mailto:support@example.com">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
