import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bookmark, Compass, TrendingUp, Trophy, PlaySquare } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { watchlist } = useWatchlist();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Explore', path: '/', icon: TrendingUp },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Top 100', path: '/discover?sort=SCORE_DESC', icon: Trophy },
    { label: 'Seasonal', path: '/discover?seasonal=true', icon: PlaySquare },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname + location.search === path || (path.startsWith('/discover') && location.pathname === '/discover' && !path.includes('?'));
  };

  return (
    <header className="sticky top-0 z-40 w-full apple-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#0071e3] to-[#005bb5] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 border border-white/20 group-hover:scale-105 transition-transform">
              ✦
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                Anime<span className="text-[#0071e3]">Pulse</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-md">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white/10 text-white shadow-sm border border-white/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#0071e3]' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search Form & Watchlist Action */}
          <div className="flex items-center gap-2.5 flex-1 max-w-xs sm:max-w-sm justify-end">
            <form
              onSubmit={handleSearchSubmit}
              className="relative items-center flex-1 max-w-[240px] sm:max-w-xs"
            >
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="apple-input w-full text-xs sm:text-sm pl-8 pr-3 py-1.5 placeholder-slate-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            </form>

            <Link
              to="/watchlist"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                location.pathname === '/watchlist'
                  ? 'apple-btn-primary'
                  : 'apple-btn-secondary'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist</span>
              {watchlist.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold text-white bg-blue-500 rounded-full">
                  {watchlist.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
