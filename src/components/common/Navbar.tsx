import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bookmark,
  Compass,
  TrendingUp,
  Trophy,
  Calendar,
  Dices,
  X,
} from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import { searchAnimeAutocomplete } from '../../api/anilist';
import type { AnimeCardData } from '../../api/types';
import { RandomAnimeModal } from './RandomAnimeModal';

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState<AnimeCardData[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [randomModalOpen, setRandomModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { watchlist } = useWatchlist();
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  // Close autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
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
    { label: 'Top 100', path: '/discover?sort=SCORE_DESC', icon: Trophy },
    { label: 'Seasonal', path: '/discover?seasonal=true', icon: Calendar },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return (
      location.pathname + location.search === path ||
      (path.startsWith('/discover') &&
        location.pathname === '/discover' &&
        !path.includes('?') &&
        !location.search)
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full anilist-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* AniList Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3db4f2] to-[#0084ff] flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-[#3db4f2]/25 group-hover:scale-105 transition-transform border border-white/20">
                <span className="leading-none">AL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white leading-none">
                  Ani<span className="text-[#3db4f2]">Pulse</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Anime Tracker
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-[#151f2e]/80 border border-white/[0.06]">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#3db4f2] text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Section: Search Autocomplete, Randomizer & Watchlist */}
            <div className="flex items-center gap-2.5 flex-1 max-w-sm sm:max-w-md justify-end">
              {/* Search Bar with Autocomplete Dropdown */}
              <div ref={searchContainerRef} className="relative flex-1 max-w-[260px] sm:max-w-xs">
                <form onSubmit={handleSearchSubmit} className="relative items-center">
                  <input
                    type="text"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (autocompleteResults.length > 0) setShowAutocomplete(true);
                    }}
                    className="anilist-input w-full text-xs sm:text-sm pl-8 pr-7 py-2 placeholder-slate-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowAutocomplete(false);
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>

                {/* Autocomplete Dropdown Popover */}
                {showAutocomplete && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-xl anilist-card-static shadow-2xl border border-white/10 z-50 max-h-96 overflow-y-auto space-y-1 animate-fadeIn">
                    {isSearching ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Searching AniList...
                      </div>
                    ) : autocompleteResults.length > 0 ? (
                      <>
                        <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                          Quick Results
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
                                className="w-8 h-11 object-cover rounded bg-[#0b1622] flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-100 group-hover:text-[#3db4f2] truncate">
                                  {itemTitle}
                                </p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span>{item.format?.replace('_', ' ') || 'Anime'}</span>
                                  <span>·</span>
                                  <span>{item.seasonYear || 'TBA'}</span>
                                </p>
                              </div>
                              {item.averageScore && (
                                <div className="text-[11px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/15">
                                  {item.averageScore}%
                                </div>
                              )}
                            </Link>
                          );
                        })}
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full text-center text-xs text-[#3db4f2] hover:underline font-semibold py-1.5 border-t border-white/10 mt-1"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </>
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No matches found. Press enter to search.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Randomizer "Roll" Button */}
              <button
                onClick={() => setRandomModalOpen(true)}
                className="p-2 rounded-lg anilist-btn-secondary text-slate-300 hover:text-[#3db4f2] transition flex items-center justify-center"
                title="Roll a Random Anime"
              >
                <Dices className="w-4 h-4" />
              </button>

              {/* Watchlist Quick Button */}
              <Link
                to="/watchlist"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  location.pathname === '/watchlist'
                    ? 'anilist-btn-primary'
                    : 'anilist-btn-secondary'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
                {watchlist.length > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold text-white bg-[#0084ff] rounded-full">
                    {watchlist.length}
                  </span>
                )}
              </Link>
            </div>
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
