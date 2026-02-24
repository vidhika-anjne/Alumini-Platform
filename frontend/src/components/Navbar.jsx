import { Link } from 'react-router-dom';
import SearchField from './SearchField';
import logo from '../images/White-Logos-for-Acropolis.png';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ toggleMobileMenu }) {
  const { token } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo on the left */}
        <div className="flex flex-shrink-0 items-center">
          <Link to="/feed" className="inline-flex gap-2">
            <img src={logo} alt="Company Logo" className="h-8 object-contain" />
          </Link>
        </div>

        {/* Search Field in the center */}
        <div className="flex flex-1 justify-center px-4">
          <div className="w-full max-w-sm">
            <SearchField />
          </div>
        </div>

        {/* Toggle Button on the right (or spacer for balance) */}
        <div className="flex flex-shrink-0 items-center">
          {token ? (
            <button
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 p-2 text-xl text-slate-600 shadow-sm transition hover:border-indigo-500 hover:text-indigo-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
          ) : (
            <div className="w-10" /> // Spacer to keep search centered
          )}
        </div>
      </div>
    </header>
  );
}

