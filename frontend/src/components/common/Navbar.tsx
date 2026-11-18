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
  User,
  Settings,
  Coffee,
  Share2,
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { watchlist } = useWatchlist();
  const { user, isAuthenticated, logout } = useAuth();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setShowAutocomplete(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Auto-focus mobile search input when expanded
  useEffect(() => {
    if (mobileSearchOpen) {
      mobileSearchInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  // Global shortcut to focus search (/ or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement !== searchInputRef.current &&
        document.activeElement !== mobileSearchInputRef.current &&
        !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setMobileMenuOpen(false);
          setMobileSearchOpen(true);
        } else {
          searchInputRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
        setMobileSearchOpen(false);
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
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
      const target = e.target as Node;
      const insideDesktopSearch = searchContainerRef.current?.contains(target);
      const insideMobileSearch = mobileSearchContainerRef.current?.contains(target);
      if (!insideDesktopSearch && !insideMobileSearch) {
        setShowAutocomplete(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
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
      setMobileSearchOpen(false);
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

  const renderAutocompleteDropdown = (isMobile = false) => {
    if (!showAutocomplete) return null;
    return (
      <div
        className={`absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-[#111927]/98 backdrop-blur-2xl shadow-2xl border border-white/15 z-50 overflow-y-auto space-y-1 animate-fadeIn ${
          isMobile ? 'max-h-[60dvh]' : 'max-h-96'
        }`}
      >
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
                    setMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 transition group"
                >
                  <img
                    src={item.coverImage.medium || item.coverImage.large}
                    alt={itemTitle}
                    loading="lazy"
                    className="w-8 h-11 object-cover rounded bg-[#0b1622] flex-shrink-0 shadow-sm group-hover:ring-1 group-hover:ring-[#3db4f2]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-100 group-hover:text-[#3db4f2] truncate">
                      {itemTitle}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
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
                    <div className="text-[11px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0">
                      {item.averageScore}%
                    </div>
                  )}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="w-full text-center text-xs text-[#3db4f2] hover:text-[#70c9f7] font-bold py-2.5 border-t border-white/10 mt-1 hover:bg-white/5 rounded-b-lg transition"
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
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full anilist-nav border-b border-white/[0.08] backdrop-blur-xl safe-area-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 safe-area-x">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 lg:gap-6">

            {/* Left: Brand Logo & Desktop Navigation */}
            <div className="flex items-center gap-4 lg:gap-8 min-w-0 flex-shrink-0">
              <Link to="/" className="flex items-center flex-shrink-0 transition-opacity hover:opacity-90">
                <AppLogo size="sm" subtitle="" />
              </Link>

              {/* Desktop Navigation Links */}
              <nav aria-label="Primary" className="hidden md:flex items-center gap-1 p-1 rounded-full liquid-glass">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all relative ${
                        active
                          ? 'bg-[#3db4f2] text-[#06101c] shadow-sm font-extrabold'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>{link.label}</span>
                      {typeof link.badge === 'number' && link.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                            active ? 'bg-[#0b1622] text-[#3db4f2]' : 'bg-[#3db4f2] text-[#0b1622]'
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
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 justify-end max-w-xl min-w-0">

              {/* Desktop / Tablet Inline Search Bar with Autocomplete */}
              <div ref={searchContainerRef} className="hidden md:block relative flex-1 min-w-[180px] max-w-[360px]">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center group">
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search 20,000+ anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (autocompleteResults.length > 0) setShowAutocomplete(true);
                    }}
                    className="w-full text-xs pl-8 pr-10 py-2 bg-[#141f2e]/90 hover:bg-[#182638] focus:bg-[#1a293d] border border-white/10 focus:border-[#3db4f2] rounded-lg text-slate-100 placeholder-slate-400/80 outline-none transition-all shadow-inner focus:ring-1 focus:ring-[#3db4f2]/40"
                  />
                  <Search aria-hidden="true" className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#3db4f2] absolute left-2.5 pointer-events-none transition-colors" />

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
                      <X aria-hidden="true" className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="absolute right-2.5 flex items-center gap-0.5 pointer-events-none">
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-slate-400">
                        /
                      </kbd>
                    </div>
                  )}
                </form>

                {renderAutocompleteDropdown(false)}
              </div>

              {/* Mobile Search Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.CoffeeUPI?.close();
                  window.ShareLink?.close();
                  setMobileSearchOpen((prev) => !prev);
                }}
                className={`md:hidden min-w-[38px] min-h-[38px] p-2 rounded-xl transition flex items-center justify-center flex-shrink-0 ${
                  mobileSearchOpen
                    ? 'bg-[#3db4f2] text-[#06101c]'
                    : 'anilist-btn-secondary text-slate-300 hover:text-[#3db4f2]'
                }`}
                aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
                aria-expanded={mobileSearchOpen}
              >
                {mobileSearchOpen ? <X aria-hidden="true" className="w-4 h-4" /> : <Search aria-hidden="true" className="w-4 h-4" />}
              </button>

              {/* Mobile Quick Trigger: Web Elements Buy Me a Coffee (UPI) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                  setMobileSearchOpen(false);
                  window.ShareLink?.close();
                  window.CoffeeUPI?.toggle();
                }}
                className="md:hidden min-w-[38px] min-h-[38px] p-2 rounded-xl anilist-btn-secondary text-amber-400 hover:text-amber-300 transition flex items-center justify-center flex-shrink-0"
                title="Buy me a coffee (UPI)"
                aria-label="Buy me a coffee via UPI"
              >
                <Coffee aria-hidden="true" className="w-4 h-4" />
              </button>

              {/* Mobile Quick Trigger: Web Elements Share Link */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                  setMobileSearchOpen(false);
                  window.CoffeeUPI?.close();
                  window.ShareLink?.toggle();
                }}
                className="md:hidden min-w-[38px] min-h-[38px] p-2 rounded-xl anilist-btn-secondary text-[#7dd3fc] hover:text-white transition flex items-center justify-center flex-shrink-0"
                title="Share page"
                aria-label="Share this page"
              >
                <Share2 aria-hidden="true" className="w-4 h-4" />
              </button>

              {/* Randomizer "Roll" Button (Desktop top bar; also available in Mobile Menu drawer) */}
              <button
                type="button"
                onClick={() => setRandomModalOpen(true)}
                className="hidden md:flex min-w-[40px] min-h-[40px] p-2.5 rounded-xl anilist-btn-secondary text-slate-300 hover:text-[#3db4f2] transition items-center justify-center flex-shrink-0 group"
                title="Roll a Random Anime"
                aria-label="Roll a Random Anime"
              >
                <Dices aria-hidden="true" className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </button>

              {/* Desktop Login & Sign Up or User Dropdown */}
              {!isAuthenticated || !user ? (
                <div className="hidden md:flex items-center gap-2 flex-shrink-0 pl-2 border-l border-white/10">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.08] transition whitespace-nowrap inline-flex items-center min-h-[36px]"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3.5 py-1.5 rounded-xl anilist-btn-primary text-xs font-bold whitespace-nowrap shadow-sm shadow-[#3db4f2]/25 inline-flex items-center min-h-[36px]"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div ref={userMenuRef} className="hidden md:block relative pl-2 border-l border-white/10 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="Account menu"
                    aria-expanded={userMenuOpen}
                    className="flex items-center gap-1.5 sm:gap-2 min-h-[40px] px-1.5 py-1 rounded-lg bg-[#151f2e] border border-white/10 hover:border-[#3db4f2]/50 transition group"
                  >
                    <img
                      src={user.avatar}
                      alt=""
                      loading="lazy"
                      className="w-6 h-6 rounded-md object-cover bg-[#0b1622] ring-1 ring-white/10"
                    />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline-block">
                      {user.username}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 max-w-[calc(100dvw-1.5rem)] p-1.5 rounded-xl anilist-card-static shadow-2xl border border-white/10 z-50 animate-fadeIn space-y-1">
                      <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/5 space-y-1">
                        <div className="flex items-center gap-2">
                          <img
                            src={user.avatar}
                            alt=""
                            loading="lazy"
                            className="w-8 h-8 rounded-lg object-cover ring-2 ring-[#3db4f2]/40"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                              <span>{user.username}</span>
                              <Sparkles aria-hidden="true" className="w-3 h-3 text-[#3db4f2]" />
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/watchlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
                      >
                        <Bookmark aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                        <span>My Anime List</span>
                        <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-[#3db4f2]/20 text-[#3db4f2] font-bold">
                          {watchlist.length}
                        </span>
                      </Link>

                      <Link
                        to="/discover"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
                      >
                        <Compass aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                        <span>Browse Catalog</span>
                      </Link>

                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
                      >
                        <User aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                        <span>Account</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
                      >
                        <Settings aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                        <span>Settings</span>
                      </Link>

                      <div className="border-t border-white/10 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                      >
                        <LogOut aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle button */}
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false);
                  window.CoffeeUPI?.close();
                  window.ShareLink?.close();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className="min-w-[38px] min-h-[38px] p-2 rounded-xl md:hidden anilist-btn-secondary text-slate-200 hover:text-white transition flex items-center justify-center flex-shrink-0"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X aria-hidden="true" className="w-4 h-4" /> : <Menu aria-hidden="true" className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Full-Width Expandable Search Bar */}
        {mobileSearchOpen && (
          <div
            ref={mobileSearchContainerRef}
            className="md:hidden border-t border-white/[0.08] bg-[#0b1622]/98 px-3 py-2.5 animate-fadeIn shadow-2xl"
          >
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  ref={mobileSearchInputRef}
                  type="search"
                  placeholder="Search 20,000+ anime titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (autocompleteResults.length > 0) setShowAutocomplete(true);
                  }}
                  className="w-full text-base pl-10 pr-10 py-2.5 bg-[#141f2e] border border-white/15 focus:border-[#3db4f2] rounded-xl text-slate-100 placeholder-slate-400 outline-none transition-all shadow-inner focus:ring-1 focus:ring-[#3db4f2]/40"
                />
                <Search aria-hidden="true" className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowAutocomplete(false);
                      mobileSearchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 p-1.5 text-slate-400 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <X aria-hidden="true" className="w-4 h-4" />
                  </button>
                )}
              </form>

              {renderAutocompleteDropdown(true)}
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile menu"
            className="md:hidden border-t border-white/[0.08] liquid-glass-strong px-3 py-3.5 space-y-3 animate-fadeIn"
          >
            <div className="grid grid-cols-3 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center justify-center min-h-[56px] py-2 px-2 rounded-2xl text-xs font-bold transition-all relative ${
                      active
                        ? 'bg-[#3db4f2] text-[#06101c] shadow-sm font-extrabold'
                        : 'bg-white/[0.05] text-slate-200 border border-white/10 hover:text-white'
                    }`}
                  >
                    <Icon aria-hidden="true" className="w-4 h-4 mb-1" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Tools Row (Randomizer + Web Elements triggers) */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRandomModalOpen(true);
                }}
                className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-slate-200 active:scale-95"
              >
                <Dices aria-hidden="true" className="w-4 h-4 text-[#3db4f2]" />
                <span>Random</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                  window.ShareLink?.close();
                  window.CoffeeUPI?.open();
                }}
                className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-slate-200 active:scale-95"
              >
                <Coffee aria-hidden="true" className="w-4 h-4 text-amber-400" />
                <span>Coffee UPI</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                  window.CoffeeUPI?.close();
                  window.ShareLink?.open();
                }}
                className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-slate-200 active:scale-95"
              >
                <Share2 aria-hidden="true" className="w-4 h-4 text-[#7dd3fc]" />
                <span>Share</span>
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 min-h-[42px] rounded-xl anilist-btn-secondary text-xs font-bold flex items-center justify-center"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 min-h-[42px] rounded-xl anilist-btn-primary text-xs font-bold flex items-center justify-center"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 min-h-[42px] rounded-xl anilist-btn-secondary text-xs font-bold"
                >
                  <User aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                  <span>Account</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 min-h-[42px] rounded-xl anilist-btn-secondary text-xs font-bold"
                >
                  <Settings aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                  <span>Settings</span>
                </Link>
              </div>
            )}
          </nav>
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
