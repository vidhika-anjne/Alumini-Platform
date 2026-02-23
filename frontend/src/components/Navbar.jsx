import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import SearchField from './SearchField';
import logo from '../images/White-Logos-for-Acropolis.png';
import { FiHome, FiUsers, FiMessageSquare, FiBell } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';

const desktopLinkClass = ({ isActive }) =>
  `flex flex-col items-center text-xs font-semibold transition ${
    isActive
      ? 'text-slate-900 dark:text-white'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-indigo-500/90 text-white shadow'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'
  }`;

export default function Navbar() {
  const { token, userType, user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
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

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileRef]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to="/feed" className="inline-flex items-center gap-2">
            <img src={logo} alt="Company Logo" className="h-8 object-contain" />
          </Link>
          <div className="hidden md:block">
            <SearchField />
          </div>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 p-2 text-xl text-slate-600 shadow-sm transition hover:border-indigo-500 hover:text-indigo-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/feed" className={desktopLinkClass}>
            <FiHome size={24} />
            <span>Feed</span>
          </NavLink>
          {token && (
            <NavLink to="/mentors" className={desktopLinkClass}>
              <FiUsers size={24} />
              <span>Mentors</span>
            </NavLink>
          )}
          {token && (
            <NavLink to="/ai-search" className={desktopLinkClass}>
              <FaRobot size={24} />
              <span>AI Search</span>
            </NavLink>
          )}
          {token && (
            <NavLink to="/chat" className={desktopLinkClass}>
              <FiMessageSquare size={24} />
              <span>Chat</span>
            </NavLink>
          )}
          {token && (
            <NavLink to="/notifications" className={desktopLinkClass}>
              <span className="relative">
                <FiBell size={24} />
                {notificationCount > 0 && (
                  <span className="absolute -right-2 -top-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[0.6rem] font-bold text-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </span>
              <span>Notifications</span>
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {token ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex flex-col items-center text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <div className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-200">
                  {avatar}
                </div>
                <span>Me</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-800">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200">
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {userType === 'alumni' ? 'Alumni' : 'Student'}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className={desktopLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={desktopLinkClass}>
                Register
              </NavLink>
            </div>
          )}
          <button
            onClick={toggle}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="p-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <SearchField />
            <NavLink to="/feed" className={mobileLinkClass}>Feed</NavLink>
            {token && <NavLink to="/mentors" className={mobileLinkClass}>Mentors</NavLink>}
            {token && <NavLink to="/ai-search" className={mobileLinkClass}>🤖 AI Search</NavLink>}
            {token && <NavLink to="/chat" className={mobileLinkClass}>Chat</NavLink>}
            {token && (
              <NavLink to="/notifications" className={mobileLinkClass}>
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
            {token ? (
              <>
                <NavLink to="/profile" className={mobileLinkClass}>Profile</NavLink>
                <button onClick={handleLogout} className={`${mobileLinkClass} text-left`}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={mobileLinkClass}>Login</NavLink>
                <NavLink to="/register" className={mobileLinkClass}>Register</NavLink>
              </>
            )}
            <button
              onClick={toggle}
              className={`${mobileLinkClass} mt-2 text-left`}
              aria-label="Toggle theme"
            >
              Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
