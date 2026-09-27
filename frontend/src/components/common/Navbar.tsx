import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bookmark,
  Compass,
  TrendingUp,
  Dices,
  X,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import { useAuth } from '../../context/AuthContext';
import { searchAnimeAutocomplete } from '../../api/anilist';
import type { AnimeCardData } from '../../api/types';
import { RandomAnimeModal } from './RandomAnimeModal';
import { AppLogo } from './AppLogo';

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState<AnimeCardData[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { watchlist } = useWatchlist();
  const { user, isAuthenticated, logout } = useAuth();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowAutocomplete(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Global shortcut to focus search (/ or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement !== searchInputRef.current &&
        !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced autocomplete search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchAnimeAutocomplete(searchQuery.trim());
        setAutocompleteResults(results);
        setShowAutocomplete(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close autocomplete and user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowAutocomplete(false);
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: TrendingUp },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Watchlist', path: '/watchlist', icon: Bookmark, badge: watchlist.length },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full anilist-nav border-b border-white/[0.08] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            
            {/* Left: Brand Logo & Desktop Navigation */}
            <div className="flex items-center gap-5 lg:gap-8 flex-shrink-0">
              <Link to="/" className="flex items-center flex-shrink-0 transition-opacity hover:opacity-90">
                <AppLogo size="sm" subtitle="" />
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-[#151f2e]/60 border border-white/[0.06]">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                        active
                          ? 'bg-[#3db4f2] text-white shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{link.label}</span>
                      {typeof link.badge === 'number' && link.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                            active ? 'bg-white text-[#3db4f2]' : 'bg-[#3db4f2] text-white'
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Search, Randomizer, and Auth/Profile */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-xl">
              
              {/* Search Bar with Autocomplete */}
              <div ref={searchContainerRef} className="relative flex-1 min-w-[140px] max-w-[260px] sm:max-w-[320px] md:max-w-[360px]">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center group">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search 20,000+ anime... (/ or ⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (autocompleteResults.length > 0) setShowAutocomplete(true);
                    }}
                    className="w-full text-xs pl-8 pr-12 py-2 bg-[#141f2e]/90 hover:bg-[#182638] focus:bg-[#1a293d] border border-white/10 focus:border-[#3db4f2] rounded-lg text-slate-100 placeholder-slate-400/80 outline-none transition-all shadow-inner focus:ring-1 focus:ring-[#3db4f2]/40"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#3db4f2] absolute left-2.5 pointer-events-none transition-colors" />

                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowAutocomplete(false);
                      }}
                      className="absolute right-2.5 text-slate-400 hover:text-white transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 pointer-events-none">
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-slate-400">
                        /
                      </kbd>
                    </div>
                  )}
                </form>

                {/* Autocomplete Dropdown Popover */}
                {showAutocomplete && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-1.5 rounded-xl bg-[#111927]/98 backdrop-blur-2xl shadow-2xl border border-white/15 z-50 max-h-96 overflow-y-auto space-y-1 animate-fadeIn">
                    {isSearching ? (
                      <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-[#3db4f2] border-t-transparent rounded-full animate-spin" />
                        <span>Searching 20,000+ anime titles...</span>
                      </div>
                    ) : autocompleteResults.length > 0 ? (
                      <>
                        <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-[#8ba0b2] tracking-wider font-mono flex items-center justify-between border-b border-white/5">
                          <span>Top Matches</span>
                          <span className="text-[9px] text-[#3db4f2]">Live Catalog</span>
                        </div>
                        {autocompleteResults.map((item) => {
                          const itemTitle =
                            item.title.english ||
                            item.title.romaji ||
                            item.title.userPreferred;
                          return (
                            <Link
                              key={item.id}
                              to={`/anime/${item.id}`}
                              onClick={() => {
                                setShowAutocomplete(false);
                                setSearchQuery('');
                              }}
                              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/10 transition group"
                            >
                              <img
                                src={item.coverImage.medium || item.coverImage.large}
                                alt={itemTitle}
                                className="w-8 h-11 object-cover rounded bg-[#0b1622] flex-shrink-0 shadow-sm group-hover:ring-1 group-hover:ring-[#3db4f2]"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-100 group-hover:text-[#3db4f2] truncate">
                                  {itemTitle}
                                </p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span className="font-semibold text-slate-300">{item.format?.replace('_', ' ') || 'Anime'}</span>
                                  <span>·</span>
                                  <span>{item.seasonYear || 'TBA'}</span>
                                  {item.genres && item.genres.length > 0 && (
                                    <>
                                      <span>·</span>
                                      <span className="text-slate-400 truncate max-w-[90px]">{item.genres[0]}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                              {item.averageScore && (
                                <div className="text-[11px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                                  {item.averageScore}%
                                </div>
                              )}
                            </Link>
                          );
                        })}
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full text-center text-xs text-[#3db4f2] hover:text-[#70c9f7] font-bold py-2 border-t border-white/10 mt-1 hover:bg-white/5 rounded-b-lg transition"
                        >
                          View all results for "{searchQuery}" →
                        </button>
                      </>
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No matches found. Press <kbd className="font-mono text-[10px] bg-white/10 px-1 rounded">Enter</kbd> to search full catalog.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Randomizer "Roll" Button */}
              <button
                onClick={() => setRandomModalOpen(true)}
                className="p-2 sm:p-2.5 rounded-lg anilist-btn-secondary text-slate-300 hover:text-[#3db4f2] transition flex items-center justify-center flex-shrink-0 group"
                title="Roll a Random Anime"
              >
                <Dices className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </button>

              {/* Login & Sign Up or User Dropdown */}
              {!isAuthenticated || !user ? (
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 pl-1 sm:pl-2 border-l border-white/10">
                  <Link
                    to="/login"
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.08] transition whitespace-nowrap hidden sm:inline-block"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 sm:px-3.5 py-1.5 rounded-lg anilist-btn-primary text-xs font-bold whitespace-nowrap shadow-sm shadow-[#3db4f2]/25"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div ref={userMenuRef} className="relative pl-1 sm:pl-2 border-l border-white/10 flex-shrink-0">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 sm:p-1.5 rounded-lg bg-[#151f2e] border border-white/10 hover:border-[#3db4f2]/50 transition group"
                  >
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-6 h-6 rounded-md object-cover bg-[#0b1622] ring-1 ring-white/10"
                    />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline-block">
                      {user.username}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 p-1.5 rounded-xl anilist-card-static shadow-2xl border border-white/10 z-50 animate-fadeIn space-y-1">
                      <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/5 space-y-1">
                        <div className="flex items-center gap-2">
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-8 h-8 rounded-lg object-cover ring-2 ring-[#3db4f2]/40"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                              <span>{user.username}</span>
                              <Sparkles className="w-3 h-3 text-[#3db4f2]" />
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/watchlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#3db4f2]" />
                        <span>My Anime List</span>
                        <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-[#3db4f2]/20 text-[#3db4f2] font-bold">
                          {watchlist.length}
                        </span>
                      </Link>

                      <Link
                        to="/discover"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#3db4f2]" />
                        <span>Browse Catalog</span>
                      </Link>

                      <div className="border-t border-white/10 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg md:hidden text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-[#0b1622]/98 px-4 py-3 space-y-2 animate-fadeIn shadow-2xl">
            <div className="grid grid-cols-3 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#3db4f2] text-white shadow-sm'
                        : 'bg-[#151f2e] text-slate-300 border border-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {!isAuthenticated && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg bg-[#151f2e] text-xs font-bold text-slate-200 border border-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg anilist-btn-primary text-xs font-bold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Random Anime Modal */}
      <RandomAnimeModal
        isOpen={randomModalOpen}
        onClose={() => setRandomModalOpen(false)}
      />
    </>
  );
};
