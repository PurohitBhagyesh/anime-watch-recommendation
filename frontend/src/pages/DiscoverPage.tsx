import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Check,
  Plus,
} from 'lucide-react';
import { searchAnime, GENRE_LIST, getCurrentSeason } from '../api/anilist';
import type { AnimeCardData, PageInfo, WatchlistStatus } from '../api/types';
import { AnimeCard } from '../components/common/AnimeCard';
import { CardSkeleton } from '../components/common/Skeleton';
import { useWatchlist } from '../context/WatchlistContext';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isInWatchlist, getItem, addToWatchlist, removeFromWatchlist } = useWatchlist();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState<string>(searchParams.get('genre') || '');
  const [selectedFormat, setSelectedFormat] = useState<string>(searchParams.get('format') || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || '');
  const [selectedSeason, setSelectedSeason] = useState<string>(searchParams.get('season') || '');
  const [selectedYear, setSelectedYear] = useState<string>(searchParams.get('year') || '');
  const [selectedSort, setSelectedSort] = useState<string>(
    searchParams.get('sort') || 'TRENDING_DESC'
  );
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get('page')) || 1
  );

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [results, setResults] = useState<AnimeCardData[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<number | null>(null);

  // Sync state when URL params change
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const g = searchParams.get('genre') || '';
    const f = searchParams.get('format') || '';
    const st = searchParams.get('status') || '';
    const se = searchParams.get('season') || '';
    const y = searchParams.get('year') || '';
    const so = searchParams.get('sort') || 'TRENDING_DESC';
    const p = Number(searchParams.get('page')) || 1;

    if (searchParams.get('seasonal') === 'true') {
      const cur = getCurrentSeason();
      setSelectedSeason(cur.season);
      setSelectedYear(cur.year.toString());
    } else {
      setSelectedSeason(se);
      setSelectedYear(y);
    }

    setSearchQuery(s);
    setSelectedGenre(g);
    setSelectedFormat(f);
    setSelectedStatus(st);
    setSelectedSort(so);
    setCurrentPage(p);
  }, [searchParams]);

  // Fetch results whenever filters change
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await searchAnime({
          search: searchQuery || undefined,
          genres: selectedGenre ? [selectedGenre] : undefined,
          format: selectedFormat || undefined,
          status: selectedStatus || undefined,
          season: selectedSeason || undefined,
          seasonYear: selectedYear ? Number(selectedYear) : undefined,
          sort: [selectedSort],
          page: currentPage,
          perPage: 24,
        });

        setResults(res.media || []);
        setPageInfo(res.pageInfo);
      } catch (err) {
        console.error('Failed to search anime', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    searchQuery,
    selectedGenre,
    selectedFormat,
    selectedStatus,
    selectedSeason,
    selectedYear,
    selectedSort,
    currentPage,
  ]);

  const updateFiltersInUrl = (overrides: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams();

    const vals = {
      search: searchQuery,
      genre: selectedGenre,
      format: selectedFormat,
      status: selectedStatus,
      season: selectedSeason,
      year: selectedYear,
      sort: selectedSort,
      page: 1,
      ...overrides,
    };

    Object.entries(vals).forEach(([k, v]) => {
      if (
        v !== undefined &&
        v !== '' &&
        !(k === 'page' && v === 1) &&
        !(k === 'sort' && v === 'TRENDING_DESC')
      ) {
        newParams.set(k, v.toString());
      }
    });

    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedFormat('');
    setSelectedStatus('');
    setSelectedSeason('');
    setSelectedYear('');
    setSelectedSort('TRENDING_DESC');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFiltersInUrl({ search: searchQuery });
  };

  const currentYearNum = new Date().getFullYear();
  const yearsList = Array.from({ length: 35 }, (_, i) => (currentYearNum + 1 - i).toString());

  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedGenre ||
      selectedFormat ||
      selectedStatus ||
      selectedSeason ||
      selectedYear ||
      selectedSort !== 'TRENDING_DESC'
  );

  const statusLabels: { id: WatchlistStatus; label: string }[] = [
    { id: 'watching', label: 'Watching' },
    { id: 'plan_to_watch', label: 'Planning' },
    { id: 'completed', label: 'Completed' },
    { id: 'rewatching', label: 'Rewatching' },
    { id: 'paused', label: 'Paused' },
    { id: 'dropped', label: 'Dropped' },
  ];

  const getScoreBadgeClass = (score: number | null) => {
    if (!score) return '';
    if (score >= 80) return 'score-pill-gold';
    if (score >= 70) return 'score-pill-high';
    if (score >= 60) return 'score-pill-med';
    return 'score-pill-low';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header with Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Discover Anime
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Filter through over 15,000 anime by genres, format, season, and scores
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle (Grid vs Table) */}
          <div className="flex items-center p-1 rounded-xl bg-[#0e1528] border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-[#6366f1] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-[#6366f1] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile filter toggle button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl royal-btn-secondary text-xs font-bold"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#818cf8]" />
            <span>{showMobileFilters ? 'Hide Filters' : 'Filters'}</span>
          </button>
        </div>
      </div>

      {/* Main Filters Panel */}
      <div
        className={`space-y-4 p-4 sm:p-5 rounded-2xl royal-card-static ${
          showMobileFilters ? 'block' : 'hidden md:block'
        }`}
      >
        {/* Search Bar Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search anime title, e.g. Frieren, Demon Slayer, Jujutsu Kaisen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="anilist-input w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm placeholder-slate-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  updateFiltersInUrl({ search: '' });
                }}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="royal-btn-primary px-5 py-2.5 text-xs sm:text-sm font-bold"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
          {/* Genre */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                updateFiltersInUrl({ genre: e.target.value });
              }}
              className="anilist-input w-full text-xs px-2.5 py-2 cursor-pointer font-medium"
            >
              <option value="">All Genres</option>
              {GENRE_LIST.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                updateFiltersInUrl({ format: e.target.value });
              }}
              className="anilist-input w-full text-xs px-2.5 py-2 cursor-pointer font-medium"
            >
              <option value="">All Formats</option>
              <option value="TV">TV Series</option>
              <option value="MOVIE">Movie</option>
              <option value="TV_SHORT">TV Short</option>
              <option value="OVA">OVA</option>
              <option value="ONA">ONA</option>
              <option value="SPECIAL">Special</option>
            </select>
          </div>

          {/* Airing Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Airing Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                updateFiltersInUrl({ status: e.target.value });
              }}
              className="anilist-input w-full text-xs px-2.5 py-2 cursor-pointer font-medium"
            >
              <option value="">All Statuses</option>
              <option value="RELEASING">Airing</option>
              <option value="FINISHED">Finished</option>
              <option value="NOT_YET_RELEASED">Upcoming</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Season */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Season
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(e.target.value);
                updateFiltersInUrl({ season: e.target.value });
              }}
              className="anilist-input w-full text-xs px-2.5 py-2 cursor-pointer font-medium"
            >
              <option value="">All Seasons</option>
              <option value="WINTER">Winter</option>
              <option value="SPRING">Spring</option>
              <option value="SUMMER">Summer</option>
              <option value="FALL">Fall</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                updateFiltersInUrl({ year: e.target.value });
              }}
              className="anilist-input w-full text-xs px-2.5 py-2 cursor-pointer font-medium"
            >
              <option value="">All Years</option>
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Sort By
            </label>
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                updateFiltersInUrl({ sort: e.target.value });
              }}
              className="anilist-input w-full text-xs px-2.5 py-2 cursor-pointer text-[#818cf8] font-bold"
            >
              <option value="TRENDING_DESC">Trending</option>
              <option value="POPULARITY_DESC">Popularity</option>
              <option value="SCORE_DESC">Average Score</option>
              <option value="START_DATE_DESC">Release Date</option>
              <option value="FAVOURITES_DESC">Favourites</option>
              <option value="TITLE_ROMAJI">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Genre Chips & Reset */}
        <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 font-bold">
              <Filter className="w-3.5 h-3.5 text-[#818cf8]" /> Popular:
            </span>
            {['Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Comedy', 'Adventure', 'Sports'].map(
              (genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    const val = selectedGenre === genre ? '' : genre;
                    setSelectedGenre(val);
                    updateFiltersInUrl({ genre: val });
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg transition font-semibold ${
                    selectedGenre === genre
                      ? 'royal-btn-primary'
                      : 'bg-[#080d1a] hover:bg-[#141f38] text-slate-300 border border-white/10'
                  }`}
                >
                  {genre}
                </button>
              )
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold ml-auto transition"
            >
              <X className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-semibold text-slate-300">
          {loading ? (
            'Loading anime results...'
          ) : pageInfo ? (
            <span>
              <span className="text-white font-bold">{pageInfo.total.toLocaleString()}</span> anime
              found
            </span>
          ) : (
            'Results'
          )}
        </p>

        {pageInfo && pageInfo.lastPage > 1 && (
          <div className="text-xs text-slate-400 font-mono">
            Page {pageInfo.currentPage} of {pageInfo.lastPage}
          </div>
        )}
      </div>

      {/* Results Display: Grid Mode or Table Mode */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {Array.from({ length: 18 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          /* Classic Table View */
          <div className="space-y-2">
            {results.map((anime, index) => {
              const title =
                anime.title.english || anime.title.romaji || anime.title.userPreferred;
              const inWatchlist = isInWatchlist(anime.id);
              const currentItem = getItem(anime.id);
              const rankNum = (currentPage - 1) * 24 + index + 1;
              const isMenuOpen = openStatusMenuId === anime.id;

              return (
                <div
                  key={anime.id}
                  className="flex items-center justify-between p-3 rounded-xl anilist-table-row gap-3 sm:gap-4"
                >
                  {/* Rank & Poster Thumbnail */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-500 w-6 text-right flex-shrink-0">
                      #{rankNum}
                    </span>

                    <Link
                      to={`/anime/${anime.id}`}
                      className="w-12 sm:w-14 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-[#080d1a] relative group"
                    >
                      <img
                        src={anime.coverImage.medium || anime.coverImage.large}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/anime/${anime.id}`}
                        className="font-bold text-xs sm:text-sm text-slate-100 hover:text-[#818cf8] truncate block transition"
                        title={title}
                      >
                        {title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-[#818cf8] font-semibold">
                          {anime.studios?.nodes?.[0]?.name || 'Studio'}
                        </span>
                        <span>·</span>
                        <span>{anime.format?.replace('_', ' ') || 'Anime'}</span>
                        <span>·</span>
                        <span>{anime.seasonYear || 'TBA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score Pill */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {anime.averageScore ? (
                      <div
                        className={`px-2.5 py-1 rounded-md text-xs font-black ${getScoreBadgeClass(
                          anime.averageScore
                        )}`}
                      >
                        {anime.averageScore}%
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 font-mono">—</div>
                    )}

                    {/* Quick Add Button */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenStatusMenuId(isMenuOpen ? null : anime.id)
                        }
                        className={`p-2 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                          inWatchlist
                            ? 'bg-[#6366f1] text-white'
                            : 'royal-btn-secondary text-slate-300 hover:text-white'
                        }`}
                        title="Set Status"
                      >
                        {inWatchlist ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setOpenStatusMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1.5 z-40 w-44 p-1.5 rounded-xl anilist-surface-elevated border border-white/15 shadow-2xl space-y-0.5 animate-fadeIn">
                            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider border-b border-white/10 font-mono">
                              Set Status
                            </div>
                            {statusLabels.map((st) => (
                              <button
                                key={st.id}
                                onClick={() => {
                                  addToWatchlist(anime, st.id);
                                  setOpenStatusMenuId(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between font-semibold transition ${
                                  currentItem?.status === st.id
                                    ? 'bg-[#6366f1] text-white'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                  }`}
                              >
                                <span>{st.label}</span>
                                {currentItem?.status === st.id && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </button>
                            ))}
                            {inWatchlist && (
                              <button
                                onClick={() => {
                                  removeFromWatchlist(anime.id);
                                  setOpenStatusMenuId(null);
                                }}
                                className="w-full text-left px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/20 rounded-lg transition font-medium border-t border-white/10 mt-1"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="p-12 rounded-2xl royal-card-static text-center space-y-3">
          <Search className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No anime found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No matching anime for the current filter criteria. Try adjusting your search query or
            resetting filters.
          </p>
          <button
            onClick={resetAllFilters}
            className="royal-btn-primary px-4 py-2 text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {pageInfo && pageInfo.lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => {
              const newPage = Math.max(1, currentPage - 1);
              setCurrentPage(newPage);
              updateFiltersInUrl({ page: newPage });
            }}
            disabled={currentPage <= 1 || loading}
            className="royal-btn-secondary flex items-center gap-1 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="px-3 py-1 rounded-lg bg-[#0e1528] border border-white/10 text-xs font-mono text-slate-300">
            {currentPage} / {pageInfo.lastPage}
          </span>

          <button
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              updateFiltersInUrl({ page: newPage });
            }}
            disabled={!pageInfo.hasNextPage || loading}
            className="royal-btn-secondary flex items-center gap-1 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
