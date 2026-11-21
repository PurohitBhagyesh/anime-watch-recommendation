import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bookmark,
  Compass,
  Dices,
  X,
  LogOut,
  ChevronDown,
  Menu,
  User,
  Settings,
} from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { searchAnimeAutocomplete, GENRE_LIST } from '../../api/anilist';
import type { AnimeCardData } from '../../api/types';
import { RandomAnimeModal } from './RandomAnimeModal';
import { AppLogo } from './AppLogo';
import { Spinner } from './Skeleton';
import { UserAvatar } from './UserAvatar';

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState<AnimeCardData[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileGenresOpen, setMobileGenresOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { watchlist } = useWatchlist();
  const { user, isAuthenticated, logout } = useAuth();
  const { getPreferredTitle } = usePreferences();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileGenresOpen(false);
    setMobileSearchOpen(false);
    setShowAutocomplete(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.search]);

  // Auto-focus mobile search input when expanded
  useEffect(() => {
    if (mobileSearchOpen) {
      const t = setTimeout(() => mobileSearchInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
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
    }, 240);

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
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
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
    { label: 'Home', path: '/' },
    { label: 'Discover', path: '/discover' },
    { label: 'Watchlist', path: '/watchlist', badge: watchlist.length },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderAutocompleteDropdown = (isMobile = false) => {
    if (!showAutocomplete) return null;
    return (
      <div
        className={`absolute top-full left-0 right-0 mt-2 p-1.5 rounded-2xl bg-[#0b0b0d]/98 backdrop-blur-2xl shadow-2xl border border-[#232329] z-50 overflow-y-auto space-y-0.5 animate-fadeIn ${
          isMobile ? 'max-h-[58dvh]' : 'max-h-96'
        }`}
      >
        {isSearching ? (
          <div className="p-4 text-center text-xs text-[#9a9aa6] flex items-center justify-center gap-2.5">
            <Spinner size="sm" label="Searching anime" />
            <span>Searching catalog…</span>
          </div>
        ) : autocompleteResults.length > 0 ? (
          <>
            <div className="px-2.5 py-1.5 text-[10px] uppercase font-semibold text-[#9a9aa6] tracking-wider font-mono flex items-center justify-between border-b border-[#232329]">
              <span>Top Matches</span>
              <span className="text-[#9a9aa6]">AniList Live</span>
            </div>
            {autocompleteResults.map((item) => {
              const itemTitle = getPreferredTitle(item.title, 'Anime');
              return (
                <Link
                  key={item.id}
                  to={`/anime/${item.id}`}
                  onClick={() => {
                    setShowAutocomplete(false);
                    setMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#151519] transition group"
                >
                  <img
                    src={item.coverImage.medium || item.coverImage.large}
                    alt={itemTitle}
                    loading="lazy"
                    className="w-8 h-11 object-cover rounded-md bg-[#151519] flex-shrink-0 border border-[#232329]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {itemTitle}
                    </p>
                    <p className="text-[11px] text-[#9a9aa6] flex items-center gap-1.5 mt-0.5 truncate tabular-nums">
                      <span>{item.format?.replace('_', ' ') || 'Anime'}</span>
                      <span>·</span>
                      <span>{item.seasonYear || 'TBA'}</span>
                      {item.genres && item.genres.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-[#9a9aa6] truncate max-w-[90px]">{item.genres[0]}</span>
                        </>
                      )}
                    </p>
                  </div>
                  {item.averageScore && (
                    <div className="text-[11px] font-semibold text-[#4ade80] px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex-shrink-0 tabular-nums">
                      {item.averageScore}%
                    </div>
                  )}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="w-full text-center text-xs text-white hover:bg-[#151519] font-semibold py-2.5 border-t border-[#232329] mt-1 rounded-b-xl transition cursor-pointer"
            >
              View all results for “{searchQuery}” →
            </button>
          </>
        ) : (
          <div className="p-3.5 text-center text-xs text-[#9a9aa6]">
            No matches found. Press <kbd className="font-mono text-[10px] bg-[#151519] border border-[#232329] px-1.5 py-0.5 rounded text-white">Enter</kbd> to search full catalog.
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full anilist-nav safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-x">
          <div className="flex items-center justify-between h-[56px] sm:h-16 gap-3 sm:gap-5">
            {/* Left: Brand */}
            <Link
              to="/"
              className="flex items-center flex-shrink-0 transition-opacity hover:opacity-90"
            >
              <AppLogo size="sm" subtitle="" />
            </Link>

            {/* Center: Clean OpenLid-style Desktop Nav Links */}
            <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex items-center gap-1.5 text-[13.5px] font-medium transition-colors ${
                      active ? 'text-white' : 'text-[#9a9aa6] hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {typeof link.badge === 'number' && link.badge > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded-full bg-[#151519] border border-[#232329] text-white tabular-nums">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search + Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              {/* Desktop Inline Search */}
              <div ref={searchContainerRef} className="hidden md:block relative w-52 lg:w-64">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center group">
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (autocompleteResults.length > 0) setShowAutocomplete(true);
                    }}
                    className="w-full text-[13px] pl-8 pr-9 py-1.5 bg-[#0b0b0d] hover:bg-[#121216] focus:bg-[#151519] border border-[#232329] focus:border-[#3a3a44] rounded-full text-white placeholder-[#9a9aa6] outline-none transition-all"
                  />
                  <Search
                    aria-hidden="true"
                    className="w-3.5 h-3.5 text-[#9a9aa6] group-focus-within:text-white absolute left-3 pointer-events-none transition-colors"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowAutocomplete(false);
                      }}
                      className="absolute right-2.5 text-[#9a9aa6] hover:text-white transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X aria-hidden="true" className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="absolute right-2.5 text-[10px] font-mono px-1.5 py-0.2 bg-[#151519] border border-[#232329] rounded text-[#9a9aa6] pointer-events-none">
                      /
                    </kbd>
                  )}
                </form>

                {renderAutocompleteDropdown(false)}
              </div>

              {/* Desktop Randomizer & Settings Buttons */}
              <button
                type="button"
                onClick={() => setRandomModalOpen(true)}
                className="hidden md:flex w-8 h-8 rounded-full bg-[#0c0c0f] hover:bg-[#16161b] border border-[#23232b] hover:border-[#383844] text-[#9a9aa6] hover:text-white transition items-center justify-center flex-shrink-0 group cursor-pointer"
                title="Roll a Random Anime"
                aria-label="Roll a Random Anime"
              >
                <Dices aria-hidden="true" className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
              </button>

              <Link
                to="/settings"
                className={`hidden md:flex w-8 h-8 rounded-full border transition items-center justify-center flex-shrink-0 ${
                  isActive('/settings')
                    ? 'btn-accent-active'
                    : 'bg-[#0c0c0f] hover:bg-[#16161b] border-[#23232b] hover:border-[#383844] text-[#9a9aa6] hover:text-white'
                }`}
                title="Settings"
                aria-label="Settings"
              >
                <Settings aria-hidden="true" className="w-3.5 h-3.5" />
              </Link>

              {/* Desktop Auth / User Profile */}
              {!isAuthenticated || !user ? (
                <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-full text-[13px] font-medium text-[#9a9aa6] hover:text-white transition whitespace-nowrap"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="anilist-btn-primary px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap inline-flex items-center"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div ref={userMenuRef} className="hidden md:block relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="Account menu"
                    aria-expanded={userMenuOpen}
                    className="flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-full bg-[#0b0b0d] border border-[#232329] hover:border-[#3a3a44] transition group cursor-pointer"
                  >
                    <UserAvatar src={user.avatar} name={user.username} size="xs" />
                    <span className="text-[13px] font-medium text-white max-w-[100px] truncate">
                      {user.username}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 text-[#9a9aa6] transition-transform ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 max-w-[calc(100dvw-1.5rem)] p-1.5 rounded-2xl bg-[#0b0b0d] shadow-2xl border border-[#232329] z-50 animate-fadeIn space-y-0.5">
                      <div className="p-2.5 rounded-xl bg-[#151519] border border-[#232329] mb-1">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar src={user.avatar} name={user.username} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">
                              {user.username}
                            </p>
                            <p className="text-[11px] text-[#9a9aa6] truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/watchlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#c8c8d2] hover:text-white hover:bg-[#151519] transition"
                      >
                        <Bookmark aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                        <span>My Watchlist</span>
                        <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-[#151519] border border-[#232329] text-white font-semibold tabular-nums">
                          {watchlist.length}
                        </span>
                      </Link>

                      <Link
                        to="/discover"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#c8c8d2] hover:text-white hover:bg-[#151519] transition"
                      >
                        <Compass aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                        <span>Browse Catalog</span>
                      </Link>

                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#c8c8d2] hover:text-white hover:bg-[#151519] transition"
                      >
                        <User aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                        <span>Account</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#c8c8d2] hover:text-white hover:bg-[#151519] transition"
                      >
                        <Settings aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                        <span>Settings</span>
                      </Link>

                      <div className="border-t border-[#232329] my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <LogOut aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Controls (Ultra-minimal OpenLid-style: Search + Hamburger only) */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.CoffeeUPI?.close();
                  window.ShareLink?.close();
                  setMobileSearchOpen((prev) => !prev);
                }}
                className={`md:hidden w-9 h-9 rounded-full border transition flex items-center justify-center flex-shrink-0 cursor-pointer ${
                  mobileSearchOpen
                    ? 'btn-accent-active'
                    : 'bg-[#0c0c0f] text-[#d2d2dc] border-[#23232b] hover:border-[#383844]'
                }`}
                aria-label={mobileSearchOpen ? 'Close search' : 'Search anime'}
                aria-expanded={mobileSearchOpen}
              >
                {mobileSearchOpen ? (
                  <X aria-hidden="true" className="w-4 h-4" />
                ) : (
                  <Search aria-hidden="true" className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false);
                  window.CoffeeUPI?.close();
                  window.ShareLink?.close();
                  setMobileMenuOpen((prev) => !prev);
                }}
                className={`md:hidden w-9 h-9 rounded-full border transition flex items-center justify-center flex-shrink-0 cursor-pointer ${
                  mobileMenuOpen
                    ? 'btn-accent-active'
                    : 'bg-[#0c0c0f] text-[#f5f5f7] border-[#23232b] hover:border-[#383844]'
                }`}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X aria-hidden="true" className="w-4 h-4" />
                ) : (
                  <Menu aria-hidden="true" className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Smooth-Sliding Search Bar */}
        <div
          className="md:hidden mobile-drawer-shell border-t border-[#232329] bg-[#0b0b0d]/98 backdrop-blur-2xl"
          data-open={mobileSearchOpen ? 'true' : 'false'}
          aria-hidden={!mobileSearchOpen}
        >
          <div className="mobile-drawer-inner">
            <div ref={mobileSearchContainerRef} className="px-4 py-3">
              <div className="relative">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    ref={mobileSearchInputRef}
                    type="search"
                    placeholder="Search anime titles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (autocompleteResults.length > 0) setShowAutocomplete(true);
                    }}
                    tabIndex={mobileSearchOpen ? 0 : -1}
                    className="w-full text-base pl-10 pr-10 py-2.5 bg-[#151519] border border-[#232329] focus:border-[#3a3a44] rounded-full text-white placeholder-[#9a9aa6] outline-none transition"
                  />
                  <Search aria-hidden="true" className="w-4 h-4 text-[#9a9aa6] absolute left-3.5 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowAutocomplete(false);
                        mobileSearchInputRef.current?.focus();
                      }}
                      className="absolute right-3 p-1 text-[#9a9aa6] hover:text-white transition"
                      aria-label="Clear search"
                    >
                      <X aria-hidden="true" className="w-4 h-4" />
                    </button>
                  )}
                </form>
                {renderAutocompleteDropdown(true)}
              </div>
            </div>
          </div>
        </div>

        {/* OpenLid-Style Clean Sliding Mobile Drawer */}
        <div
          className="md:hidden mobile-drawer-shell border-t border-[#232329] bg-[#0b0b0d]/98 backdrop-blur-2xl shadow-2xl"
          data-open={mobileMenuOpen ? 'true' : 'false'}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="mobile-drawer-inner">
            <nav aria-label="Mobile menu" className="px-4 pt-1 pb-4 flex flex-col">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-3 text-[15px] font-medium border-b border-[#232329] transition ${
                      active ? 'text-white' : 'text-[#9a9aa6] hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {typeof link.badge === 'number' && link.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#151519] border border-[#232329] text-white tabular-nums">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Mobile Genres Accordion inside Menu */}
              <div className="border-b border-[#23232b]">
                <button
                  type="button"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  aria-expanded={mobileGenresOpen}
                  onClick={() => setMobileGenresOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between py-3 text-[15px] font-medium text-[#9a9aa6] hover:text-white transition text-left cursor-pointer"
                >
                  <span>Genres</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`w-4 h-4 text-[#9a9aa6] transition-transform duration-200 ${
                      mobileGenresOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {mobileGenresOpen && (
                  <div className="pb-3.5 pt-0.5 flex flex-wrap gap-1.5 animate-fadeIn">
                    {GENRE_LIST.slice(0, 12).map((genre) => (
                      <Link
                        key={genre}
                        to={`/discover?genre=${encodeURIComponent(genre)}`}
                        tabIndex={mobileMenuOpen ? 0 : -1}
                        onClick={() => {
                          setMobileGenresOpen(false);
                          setMobileMenuOpen(false);
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#151519] hover:bg-[#1e1e26] border border-[#23232b] text-[#d2d2dc] hover:text-white transition"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRandomModalOpen(true);
                }}
                className="flex items-center justify-between py-3 text-[15px] font-medium text-[#9a9aa6] hover:text-white border-b border-[#23232b] transition text-left cursor-pointer"
              >
                <span>Random Anime Picker</span>
                <Dices aria-hidden="true" className="w-4 h-4 text-[#9a9aa6]" />
              </button>

              <Link
                to="/settings"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-3 text-[15px] font-medium border-b border-[#23232b] transition ${
                  isActive('/settings') ? 'text-white' : 'text-[#9a9aa6] hover:text-white'
                }`}
              >
                <span>Settings</span>
                <Settings aria-hidden="true" className="w-4 h-4 text-[#9a9aa6]" />
              </Link>

              <Link
                to="/about"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 text-[15px] font-medium text-[#9a9aa6] hover:text-white transition"
              >
                <span>About & Legal</span>
                <span className="text-xs text-[#9a9aa6]">MIT</span>
              </Link>

              {/* Auth Actions */}
              {!isAuthenticated || !user ? (
                <div className="grid grid-cols-2 gap-2.5 pt-3 mt-1 border-t border-[#232329]">
                  <Link
                    to="/login"
                    tabIndex={mobileMenuOpen ? 0 : -1}
                    onClick={() => setMobileMenuOpen(false)}
                    className="anilist-btn-secondary py-2.5 text-center text-xs font-semibold flex items-center justify-center min-h-[42px]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    tabIndex={mobileMenuOpen ? 0 : -1}
                    onClick={() => setMobileMenuOpen(false)}
                    className="anilist-btn-primary py-2.5 text-center text-xs font-bold flex items-center justify-center min-h-[42px]"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="pt-3 mt-1 border-t border-[#232329] space-y-2.5">
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[#151519] border border-[#232329]">
                    <UserAvatar src={user.avatar} name={user.username} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{user.username}</p>
                      <p className="text-[11px] text-[#9a9aa6] truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/account"
                      tabIndex={mobileMenuOpen ? 0 : -1}
                      onClick={() => setMobileMenuOpen(false)}
                      className="anilist-btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[40px]"
                    >
                      <User aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>Account</span>
                    </Link>
                    <Link
                      to="/settings"
                      tabIndex={mobileMenuOpen ? 0 : -1}
                      onClick={() => setMobileMenuOpen(false)}
                      className="anilist-btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[40px]"
                    >
                      <Settings aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Random Anime Modal */}
      <RandomAnimeModal
        isOpen={randomModalOpen}
        onClose={() => setRandomModalOpen(false)}
      />
    </>
  );
};
