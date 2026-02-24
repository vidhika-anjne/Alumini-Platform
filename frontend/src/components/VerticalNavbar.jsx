import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { FiHome, FiUsers, FiMessageSquare, FiBell, FiLogOut, FiUser } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';


const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-indigo-500/90 text-white shadow'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'
  }`;

export default function VerticalNavbar({ isMobileMenuOpen }) {
  const { token, user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  const avatar = (user?.name || user?.enrollmentNumber || 'U')
    .toString()
    .trim()
    .charAt(0)
    .toUpperCase();

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!token) {
        setNotificationCount(0);
        return;
      }
      try {
        const { data } = await api.get('/api/v1/connections/pending');
        setNotificationCount(data?.length || 0);
      } catch {
        setNotificationCount(0);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (!token) return null;

  return (
    <aside
      className={`fixed left-0 top-0 z-30 h-full w-60 flex-col border-r border-slate-200 bg-white pt-20 dark:border-slate-800 dark:bg-slate-950 md:flex ${
        isMobileMenuOpen ? 'flex' : 'hidden'
      }`}
    >
      <div className="flex flex-1 flex-col overflow-y-auto px-4">
        <nav className="flex flex-col gap-2">
          <NavLink to="/feed" className={linkClass}>
            <FiHome />
            <span>Home</span>
          </NavLink>
          <NavLink to="/mentors" className={linkClass}>
            <FiUsers />
            <span>Mentors</span>
          </NavLink>
          <NavLink to="/chat" className={linkClass}>
            <FiMessageSquare />
            <span>Chat</span>
          </NavLink>
          <NavLink to="/notifications" className={linkClass}>
            <FiBell />
            <span>Notifications</span>
            {notificationCount > 0 && (
              <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {notificationCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/ai-search" className={linkClass}>
            <FaRobot />
            <span>AI Search</span>
          </NavLink>
        </nav>
        <div className="mt-auto flex flex-col gap-2 pb-4">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white">
              {avatar}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">{user?.name || 'User'}</span>
              <span className="text-xs text-slate-500">{user?.enrollmentNumber}</span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
          >
            {theme === 'dark' ? '🌞' : '🌜'}
            <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
