import { Link, NavLink } from 'react-router-dom';
import { GitCompareArrows, Users } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
  }`;

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <img src="/pokeball.svg" alt="" className="w-7 h-7" />
          <span>Pokédex</span>
          <span className="text-red-600 dark:text-red-400">Competitiva</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/teams" className={navLinkClass}>
            <Users size={16} />
            <span className="hidden sm:inline">Times</span>
          </NavLink>
          <NavLink to="/compare" className={navLinkClass}>
            <GitCompareArrows size={16} />
            <span className="hidden sm:inline">Comparar</span>
          </NavLink>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
