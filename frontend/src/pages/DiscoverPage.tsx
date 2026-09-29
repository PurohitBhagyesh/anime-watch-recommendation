import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Flame,
  PlaySquare,
  TrendingUp,
  Trophy,
  Clock,
  Film,
  Tv,
  Zap,
  Heart,
  Swords,
  Ghost,
  Smile,
  Cpu,
  Sparkles,
  Info,
  Compass,
  BarChart2,
} from 'lucide-react';
import { searchAnime, GENRE_LIST, GENRE_METADATA, getCurrentSeason } from '../api/anilist';
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
  const [openStatusMenuId, setOpenStatusMenuId] = useState<number | null>(null);
  const [showCountInfo, setShowCountInfo] = useState(false);
  const [showGenreStatsModal, setShowGenreStatsModal] = useState(false);

  const currentGenreMeta = selectedGenre ? GENRE_METADATA[selectedGenre] : null;

  const categoryBarRef = useRef<HTMLDivElement>(null);

  const scrollCategoryBar = (direction: 'left' | 'right') => {
    if (categoryBarRef.current) {
      const offset = direction === 'left' ? -300 : 300;
      categoryBarRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Sync state when URL params change with case-insensitive genre normalization
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const rawGenre = searchParams.get('genre') || '';
    const matchedGenre = rawGenre
      ? GENRE_LIST.find((item) => item.toLowerCase() === rawGenre.toLowerCase()) || rawGenre
      : '';

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
    setSelectedGenre(matchedGenre);
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
          search: searchQuery.trim() || undefined,
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
        setPageInfo(null);
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

  const applyCategoryPreset = (
    preset:
      | 'all'
      | 'trending'
      | 'seasonal'
      | 'popular'
      | 'topRated'
      | 'upcoming'
      | 'movies'
      | 'tv'
      | 'ova'
      | 'action'
      | 'romance'
      | 'fantasy'
      | 'scifi'
      | 'comedy'
      | 'supernatural'
      | 'sports'
      | 'mystery'
      | 'sliceOfLife'
  ) => {
    const cur = getCurrentSeason();

    if (preset === 'all' || preset === 'trending') {
      resetAllFilters();
      return;
    }

    // Reset base parameters
    let nextGenre = '';
    let nextFormat = '';
    let nextStatus = '';
    let nextSeason = '';
    let nextYear = '';
    let nextSort = 'POPULARITY_DESC';

    if (preset === 'seasonal') {
      nextSeason = cur.season;
      nextYear = cur.year.toString();
    } else if (preset === 'popular') {
      nextSort = 'POPULARITY_DESC';
    } else if (preset === 'topRated') {
      nextSort = 'SCORE_DESC';
    } else if (preset === 'upcoming') {
      nextStatus = 'NOT_YET_RELEASED';
    } else if (preset === 'movies') {
      nextFormat = 'MOVIE';
    } else if (preset === 'tv') {
      nextFormat = 'TV';
    } else if (preset === 'ova') {
      nextFormat = 'OVA';
    } else if (preset === 'action') {
      nextGenre = 'Action';
    } else if (preset === 'romance') {
      nextGenre = 'Romance';
    } else if (preset === 'fantasy') {
      nextGenre = 'Fantasy';
    } else if (preset === 'scifi') {
      nextGenre = 'Sci-Fi';
    } else if (preset === 'comedy') {
      nextGenre = 'Comedy';
    } else if (preset === 'supernatural') {
      nextGenre = 'Supernatural';
    } else if (preset === 'sports') {
      nextGenre = 'Sports';
    } else if (preset === 'mystery') {
      nextGenre = 'Mystery';
    } else if (preset === 'sliceOfLife') {
      nextGenre = 'Slice of Life';
    }

    setSearchQuery('');
    setSelectedGenre(nextGenre);
    setSelectedFormat(nextFormat);
    setSelectedStatus(nextStatus);
    setSelectedSeason(nextSeason);
    setSelectedYear(nextYear);
    setSelectedSort(nextSort);
    setCurrentPage(1);

    updateFiltersInUrl({
      search: '',
      genre: nextGenre,
      format: nextFormat,
      status: nextStatus,
      season: nextSeason,
      year: nextYear,
      sort: nextSort,
      page: 1,
    });
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
    if (score >= 75) return 'score-pill-high';
    if (score >= 60) return 'score-pill-med';
    return 'score-pill-low';
  };

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* AniList Minimalist Filter Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-3 items-end">
          {/* 1. Search */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2">
            <label className="block text-[11px] font-bold text-[#8ba0b2] tracking-wider mb-1">
              Search
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-3.5 h-3.5 text-[#8ba0b2] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateFiltersInUrl({ search: e.target.value });
                }}
                placeholder="Any"
                className="w-full bg-[#151f2e] text-[#edf1f5] text-xs font-semibold pl-9 pr-7 py-2.5 rounded-lg border border-white/5 focus:border-[#3db4f2]/50 focus:ring-1 focus:ring-[#3db4f2]/50 outline-none transition placeholder-[#8ba0b2]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    updateFiltersInUrl({ search: '' });
                  }}
                  className="absolute right-2.5 top-2.5 text-[#8ba0b2] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* 2. Genres & Tags */}
          <div>
            <label className="block text-[11px] font-bold text-[#8ba0b2] tracking-wider mb-1">
              Genres & Tags
            </label>
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => {
                  setSelectedGenre(e.target.value);
                  updateFiltersInUrl({ genre: e.target.value });
                }}
                className="w-full bg-[#151f2e] text-[#edf1f5] text-xs font-semibold px-3 py-2.5 rounded-lg border border-white/5 focus:border-[#3db4f2]/50 outline-none appearance-none cursor-pointer pr-8"
              >
                <option value="">Any</option>
                {GENRE_LIST.map((g) => (
                  <option key={g} value={g} className="bg-[#151f2e] text-[#edf1f5]">
                    {g}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-[#8ba0b2] absolute right-3 top-3 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* 3. Year */}
          <div>
            <label className="block text-[11px] font-bold text-[#8ba0b2] tracking-wider mb-1">
              Year
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  updateFiltersInUrl({ year: e.target.value });
                }}
                className="w-full bg-[#151f2e] text-[#edf1f5] text-xs font-semibold px-3 py-2.5 rounded-lg border border-white/5 focus:border-[#3db4f2]/50 outline-none appearance-none cursor-pointer pr-8"
              >
                <option value="">Any</option>
                {yearsList.map((y) => (
                  <option key={y} value={y} className="bg-[#151f2e] text-[#edf1f5]">
                    {y}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-[#8ba0b2] absolute right-3 top-3 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* 4. Season */}
          <div>
            <label className="block text-[11px] font-bold text-[#8ba0b2] tracking-wider mb-1">
              Season
            </label>
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(e.target.value);
                  updateFiltersInUrl({ season: e.target.value });
                }}
                className="w-full bg-[#151f2e] text-[#edf1f5] text-xs font-semibold px-3 py-2.5 rounded-lg border border-white/5 focus:border-[#3db4f2]/50 outline-none appearance-none cursor-pointer pr-8"
              >
                <option value="">Any</option>
                <option value="WINTER" className="bg-[#151f2e] text-[#edf1f5]">Winter</option>
                <option value="SPRING" className="bg-[#151f2e] text-[#edf1f5]">Spring</option>
                <option value="SUMMER" className="bg-[#151f2e] text-[#edf1f5]">Summer</option>
                <option value="FALL" className="bg-[#151f2e] text-[#edf1f5]">Fall</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-[#8ba0b2] absolute right-3 top-3 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* 5. Format */}
          <div>
            <label className="block text-[11px] font-bold text-[#8ba0b2] tracking-wider mb-1">
              Format
            </label>
            <div className="relative">
              <select
                value={selectedFormat}
                onChange={(e) => {
                  setSelectedFormat(e.target.value);
                  updateFiltersInUrl({ format: e.target.value });
                }}
                className="w-full bg-[#151f2e] text-[#edf1f5] text-xs font-semibold px-3 py-2.5 rounded-lg border border-white/5 focus:border-[#3db4f2]/50 outline-none appearance-none cursor-pointer pr-8"
              >
                <option value="">Any</option>
                <option value="TV" className="bg-[#151f2e] text-[#edf1f5]">TV Show</option>
                <option value="MOVIE" className="bg-[#151f2e] text-[#edf1f5]">Movie</option>
                <option value="TV_SHORT" className="bg-[#151f2e] text-[#edf1f5]">TV Short</option>
                <option value="OVA" className="bg-[#151f2e] text-[#edf1f5]">OVA</option>
                <option value="ONA" className="bg-[#151f2e] text-[#edf1f5]">ONA</option>
                <option value="SPECIAL" className="bg-[#151f2e] text-[#edf1f5]">Special</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-[#8ba0b2] absolute right-3 top-3 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* 6. Airing Status & 7. Toggle Filter Button */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-[#8ba0b2] tracking-wider mb-1">
                Airing Status
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    updateFiltersInUrl({ status: e.target.value });
                  }}
                  className="w-full bg-[#151f2e] text-[#edf1f5] text-xs font-semibold px-3 py-2.5 rounded-lg border border-white/5 focus:border-[#3db4f2]/50 outline-none appearance-none cursor-pointer pr-8"
                >
                  <option value="">Any</option>
                  <option value="RELEASING" className="bg-[#151f2e] text-[#edf1f5]">Airing</option>
                  <option value="FINISHED" className="bg-[#151f2e] text-[#edf1f5]">Finished</option>
                  <option value="NOT_YET_RELEASED" className="bg-[#151f2e] text-[#edf1f5]">Not Yet Aired</option>
                  <option value="CANCELLED" className="bg-[#151f2e] text-[#edf1f5]">Cancelled</option>
                </select>
                <ChevronRight className="w-3.5 h-3.5 text-[#8ba0b2] absolute right-3 top-3 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Options button */}
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className={`p-2.5 rounded-lg border transition ${
                showAdvancedOptions || hasActiveFilters
                  ? 'bg-[#3db4f2] text-white border-[#3db4f2]'
                  : 'bg-[#151f2e] text-[#8ba0b2] hover:text-[#edf1f5] border-white/5'
              }`}
              title="Advanced Filter Options"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters & Popular Chips Drawer */}
        {showAdvancedOptions && (
          <div className="p-4 rounded-xl bg-[#151f2e]/90 border border-white/5 space-y-3 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8ba0b2]">Sort By:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    updateFiltersInUrl({ sort: e.target.value });
                  }}
                  className="bg-[#0b1622] text-[#3db4f2] text-xs font-bold px-3 py-1.5 rounded border border-white/10 outline-none cursor-pointer"
                >
                  <option value="TRENDING_DESC">Trending</option>
                  <option value="POPULARITY_DESC">Popularity</option>
                  <option value="SCORE_DESC">Average Score</option>
                  <option value="START_DATE_DESC">Release Date</option>
                  <option value="FAVOURITES_DESC">Favourites</option>
                  <option value="TITLE_ROMAJI">Title (A-Z)</option>
                </select>
              </div>

              {/* Reset button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-[#e85d75] hover:underline flex items-center gap-1 transition ml-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            {/* Popular Genres Row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
              <span className="text-xs font-bold text-[#8ba0b2] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#3db4f2]" /> Quick Genres:
              </span>
              {['Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Comedy', 'Adventure', 'Sports', 'Drama'].map(
                (g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      const nextGenre = selectedGenre === g ? '' : g;
                      setSelectedGenre(nextGenre);
                      updateFiltersInUrl({ genre: nextGenre });
                    }}
                    className={`text-xs px-2.5 py-1 rounded transition font-semibold ${
                      selectedGenre === g
                        ? 'bg-[#3db4f2] text-white'
                        : 'bg-[#0b1622] text-[#8ba0b2] hover:text-[#edf1f5] border border-white/5'
                    }`}
                  >
                    {g}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Presets Quick Bar (Scrollable with smooth navigation arrows) */}
      <div className="relative group/category">
        {/* Left Scroll Arrow */}
        <button
          type="button"
          onClick={() => scrollCategoryBar('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#0b1622]/90 hover:bg-[#151f2e] border border-white/15 text-slate-300 hover:text-white items-center justify-center shadow-lg backdrop-blur-md opacity-0 group-hover/category:opacity-100 transition-opacity"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={categoryBarRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar touch-scroll-smooth pt-1 scroll-smooth px-1"
        >
          {[
            {
              id: 'all' as const,
              label: 'All Anime',
              icon: Zap,
              color: 'text-sky-400',
              active:
                !selectedGenre &&
                !searchQuery &&
                !selectedStatus &&
                !selectedSeason &&
                !selectedFormat &&
                selectedSort === 'TRENDING_DESC',
            },
            {
              id: 'trending' as const,
              label: 'Trending',
              icon: Flame,
              color: 'text-amber-400',
              active:
                !selectedGenre &&
                !searchQuery &&
                !selectedStatus &&
                !selectedSeason &&
                !selectedFormat &&
                selectedSort === 'TRENDING_DESC',
            },
            {
              id: 'seasonal' as const,
              label: `${getCurrentSeason().season} ${getCurrentSeason().year}`,
              icon: PlaySquare,
              color: 'text-[#3db4f2]',
              active: Boolean(selectedSeason && selectedYear),
            },
            {
              id: 'popular' as const,
              label: 'All-Time Popular',
              icon: TrendingUp,
              color: 'text-emerald-400',
              active:
                !selectedSeason &&
                !selectedGenre &&
                !searchQuery &&
                !selectedStatus &&
                !selectedFormat &&
                selectedSort === 'POPULARITY_DESC',
            },
            {
              id: 'topRated' as const,
              label: 'Top 100 Rated',
              icon: Trophy,
              color: 'text-amber-300',
              active:
                selectedSort === 'SCORE_DESC' &&
                !selectedGenre &&
                !searchQuery &&
                !selectedFormat,
            },
            {
              id: 'upcoming' as const,
              label: 'Upcoming Next',
              icon: Clock,
              color: 'text-violet-400',
              active: selectedStatus === 'NOT_YET_RELEASED',
            },
            {
              id: 'movies' as const,
              label: 'Anime Movies',
              icon: Film,
              color: 'text-pink-400',
              active: selectedFormat === 'MOVIE',
            },
            {
              id: 'tv' as const,
              label: 'TV Series',
              icon: Tv,
              color: 'text-cyan-400',
              active: selectedFormat === 'TV',
            },
            {
              id: 'ova' as const,
              label: 'OVA & Shorts',
              icon: Sparkles,
              color: 'text-indigo-400',
              active: selectedFormat === 'OVA' || selectedFormat === 'TV_SHORT',
            },
            {
              id: 'action' as const,
              label: 'Action & Shonen',
              icon: Swords,
              color: 'text-rose-400',
              active: selectedGenre.toLowerCase() === 'action',
            },
            {
              id: 'romance' as const,
              label: 'Romance & Drama',
              icon: Heart,
              color: 'text-rose-300',
              active: selectedGenre.toLowerCase() === 'romance',
            },
            {
              id: 'fantasy' as const,
              label: 'Fantasy & Isekai',
              icon: Sparkles,
              color: 'text-purple-400',
              active: selectedGenre.toLowerCase() === 'fantasy',
            },
            {
              id: 'scifi' as const,
              label: 'Sci-Fi & Cyberpunk',
              icon: Cpu,
              color: 'text-cyan-300',
              active: selectedGenre.toLowerCase() === 'sci-fi',
            },
            {
              id: 'comedy' as const,
              label: 'Comedy',
              icon: Smile,
              color: 'text-yellow-400',
              active: selectedGenre.toLowerCase() === 'comedy',
            },
            {
              id: 'supernatural' as const,
              label: 'Supernatural & Horror',
              icon: Ghost,
              color: 'text-teal-400',
              active: selectedGenre.toLowerCase() === 'supernatural',
            },
            {
              id: 'sports' as const,
              label: 'Sports',
              icon: Trophy,
              color: 'text-orange-400',
              active: selectedGenre.toLowerCase() === 'sports',
            },
            {
              id: 'mystery' as const,
              label: 'Mystery & Thriller',
              icon: Compass,
              color: 'text-blue-400',
              active: selectedGenre.toLowerCase() === 'mystery',
            },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => applyCategoryPreset(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  cat.active
                    ? 'bg-[#3db4f2] text-white shadow-md shadow-[#3db4f2]/25 scale-[1.02]'
                    : 'bg-[#151f2e] text-[#8ba0b2] hover:text-[#edf1f5] hover:bg-[#1c2a3f] border border-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${cat.active ? 'text-white' : cat.color}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          onClick={() => scrollCategoryBar('right')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#0b1622]/90 hover:bg-[#151f2e] border border-white/15 text-slate-300 hover:text-white items-center justify-center shadow-lg backdrop-blur-md opacity-0 group-hover/category:opacity-100 transition-opacity"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-[#8ba0b2] uppercase tracking-wider mr-1">
            Active Filters:
          </span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1f2c3f] border border-[#3db4f2]/30 text-xs font-semibold text-[#edf1f5]">
              Search: <strong className="text-[#3db4f2] font-bold">"{searchQuery}"</strong>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  updateFiltersInUrl({ search: '' });
                }}
                className="text-[#8ba0b2] hover:text-white ml-1"
                aria-label="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedGenre && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1f2c3f] border border-[#3db4f2]/30 text-xs font-semibold text-[#edf1f5]">
              Genre: <strong className="text-[#3db4f2] font-bold">{selectedGenre}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedGenre('');
                  updateFiltersInUrl({ genre: '' });
                }}
                className="text-[#8ba0b2] hover:text-white ml-1"
                aria-label="Remove genre filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedYear && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-[#edf1f5]">
              Year: <strong className="text-[#3db4f2] font-bold">{selectedYear}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedYear('');
                  updateFiltersInUrl({ year: '' });
                }}
                className="text-[#8ba0b2] hover:text-white ml-1"
                aria-label="Remove year filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSeason && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-[#edf1f5]">
              Season: <strong className="text-[#3db4f2] font-bold">{selectedSeason}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedSeason('');
                  updateFiltersInUrl({ season: '' });
                }}
                className="text-[#8ba0b2] hover:text-white ml-1"
                aria-label="Remove season filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedFormat && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-[#edf1f5]">
              Format: <strong className="text-[#3db4f2] font-bold">{selectedFormat.replace('_', ' ')}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedFormat('');
                  updateFiltersInUrl({ format: '' });
                }}
                className="text-[#8ba0b2] hover:text-white ml-1"
                aria-label="Remove format filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1f2c3f] border border-white/10 text-xs font-semibold text-[#edf1f5]">
              Status: <strong className="text-[#3db4f2] font-bold">{selectedStatus.replace(/_/g, ' ')}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('');
                  updateFiltersInUrl({ status: '' });
                }}
                className="text-[#8ba0b2] hover:text-white ml-1"
                aria-label="Remove status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs font-bold text-[#e85d75] hover:underline ml-2 transition"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dynamic Results Header with Live Total Count & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-black text-[#edf1f5] uppercase tracking-wider">
              {selectedGenre
                ? `${selectedGenre} Anime`
                : searchQuery
                ? `Search: "${searchQuery}"`
                : selectedSeason && selectedYear
                ? `${selectedSeason} ${selectedYear} Anime`
                : selectedFormat
                ? `${selectedFormat.replace('_', ' ')} Anime`
                : selectedSort === 'TRENDING_DESC'
                ? 'Trending Now'
                : selectedSort === 'POPULARITY_DESC'
                ? 'All-Time Popular'
                : selectedSort === 'SCORE_DESC'
                ? 'Top 100 Highest Rated'
                : selectedStatus === 'NOT_YET_RELEASED'
                ? 'Upcoming Next Season'
                : 'Anime Discovery'}
            </h2>

            {!loading && pageInfo && (
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  onClick={() => setShowCountInfo(!showCountInfo)}
                  className="px-2.5 py-0.5 rounded-full bg-[#3db4f2]/15 hover:bg-[#3db4f2]/25 border border-[#3db4f2]/30 text-[#3db4f2] text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer"
                  title="Click to view database details"
                >
                  <span>
                    {selectedGenre && currentGenreMeta
                      ? pageInfo.total >= 5000
                        ? `5,000+ ${selectedGenre} available (from ${currentGenreMeta.formattedCount} in database)`
                        : `${pageInfo.total.toLocaleString()} ${selectedGenre} anime found`
                      : pageInfo.total >= 5000
                      ? '5,000+ available (from 20,000+ database)'
                      : `${pageInfo.total.toLocaleString()} anime found`}
                  </span>
                  <Info className="w-3 h-3 text-[#3db4f2]" />
                </button>

                {/* Popover explaining the 5,000 count & 20,000+ database */}
                {showCountInfo && (
                  <div className="absolute left-0 top-full mt-2 w-72 sm:w-84 p-3.5 rounded-xl bg-[#111927]/98 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn space-y-2.5">
                    <div className="flex items-center justify-between font-bold text-white border-b border-white/10 pb-1.5">
                      <span className="flex items-center gap-1.5 text-[#3db4f2]">
                        <Sparkles className="w-3.5 h-3.5" />{' '}
                        {selectedGenre
                          ? `${selectedGenre} Anime Catalog`
                          : '20,000+ Anime Database'}
                      </span>
                      <button
                        onClick={() => setShowCountInfo(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {selectedGenre && currentGenreMeta ? (
                      <div className="space-y-1.5 text-[11px] leading-relaxed">
                        <p className="text-slate-200">
                          The AniList database indexes approximately{' '}
                          <strong className="text-[#3db4f2]">{currentGenreMeta.formattedCount} {selectedGenre}</strong> anime titles ({currentGenreMeta.description}).
                        </p>
                        <p className="text-slate-400">
                          To maintain instant query speeds, AniList GraphQL API serves up to the top{' '}
                          <strong className="text-slate-200">5,000 ranked entries (208 pages)</strong> per query.
                        </p>
                        <p className="text-slate-400">
                          💡 <em>Tip: Use the <strong>Year</strong> (e.g. 2024), <strong>Season</strong>, or <strong>Format</strong> filters to browse specific subsets with exact counts.</em>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-[11px] leading-relaxed">
                        <p className="text-slate-300">
                          <strong>AnimeSenpai</strong> connects directly to the live AniList database containing over <strong className="text-[#3db4f2]">20,000+ indexed anime titles</strong>.
                        </p>
                        <p className="text-slate-400">
                          Broad queries return the top <strong>5,000 ranked anime</strong> across 208 pages. Filtering by <strong>Genre, Year, Format, or Search keywords</strong> queries the entire 20,000+ database!
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowCountInfo(false);
                        setShowGenreStatsModal(true);
                      }}
                      className="w-full text-center py-1.5 rounded-lg bg-[#3db4f2]/20 hover:bg-[#3db4f2]/30 border border-[#3db4f2]/40 text-[#3db4f2] text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>View All 18 Genre Totals</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-[#8ba0b2] mt-0.5">
            {loading
              ? 'Searching anime catalog in real-time...'
              : pageInfo
              ? selectedGenre && currentGenreMeta && pageInfo.total >= 5000
                ? `Page ${pageInfo.currentPage} of ${pageInfo.lastPage.toLocaleString()} • ${results.length} on this page (Showing top 5,000 ${selectedGenre} anime from ${currentGenreMeta.formattedCount} in catalog)`
                : `Page ${pageInfo.currentPage} of ${pageInfo.lastPage.toLocaleString()} • ${results.length} on this page`
              : 'Browse AnimeSenpai Catalog'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* View mode toggle */}
          <div className="flex items-center p-0.5 rounded bg-[#151f2e] border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-[#3db4f2] text-white shadow-sm'
                  : 'text-[#8ba0b2] hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-[#3db4f2] text-white shadow-sm'
                  : 'text-[#8ba0b2] hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Display */}
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
          /* Table View */
          <div className="space-y-1.5">
            {results.map((anime, index) => {
              const title =
                anime.title.userPreferred || anime.title.english || anime.title.romaji;
              const inWatchlist = isInWatchlist(anime.id);
              const currentItem = getItem(anime.id);
              const rankNum = (currentPage - 1) * 24 + index + 1;
              const isMenuOpen = openStatusMenuId === anime.id;

              return (
                <div
                  key={anime.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg anilist-table-row gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-[#8ba0b2] w-6 text-right flex-shrink-0">
                      #{rankNum}
                    </span>

                    <Link
                      to={`/anime/${anime.id}`}
                      className="w-10 sm:w-12 aspect-[3/4] rounded overflow-hidden flex-shrink-0 bg-[#0b1622] relative group"
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
                        className="font-semibold text-xs sm:text-sm text-[#edf1f5] hover:text-[#3db4f2] truncate block transition"
                        title={title}
                      >
                        {title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-[#8ba0b2] mt-0.5">
                        <span className="text-[#3db4f2] font-semibold">
                          {anime.studios?.nodes?.[0]?.name || 'Studio'}
                        </span>
                        <span>·</span>
                        <span>{anime.format?.replace('_', ' ') || 'Anime'}</span>
                        <span>·</span>
                        <span>{anime.seasonYear || 'TBA'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {anime.averageScore ? (
                      <div
                        className={`px-2 py-0.5 rounded text-xs font-bold ${getScoreBadgeClass(
                          anime.averageScore
                        )}`}
                      >
                        {anime.averageScore}%
                      </div>
                    ) : (
                      <div className="text-xs text-[#8ba0b2]">—</div>
                    )}

                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenStatusMenuId(isMenuOpen ? null : anime.id)
                        }
                        className={`p-2 rounded text-xs font-bold transition flex items-center justify-center ${
                          inWatchlist
                            ? 'bg-[#7bd555] text-[#0b1622]'
                            : 'anilist-btn-secondary text-[#edf1f5] hover:text-[#3db4f2] border border-white/10'
                        }`}
                        title="Set Status"
                      >
                        {inWatchlist ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
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
                          <div className="absolute right-0 top-full mt-1.5 z-40 w-44 p-1.5 rounded-lg anilist-surface-elevated border border-white/10 shadow-2xl space-y-0.5 animate-fadeIn">
                            <div className="text-[10px] uppercase font-bold text-[#8ba0b2] px-2 py-1 tracking-wider border-b border-white/10">
                              Set Status
                            </div>
                            {statusLabels.map((st) => (
                              <button
                                key={st.id}
                                onClick={() => {
                                  addToWatchlist(anime, st.id);
                                  setOpenStatusMenuId(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center justify-between font-semibold transition ${
                                  currentItem?.status === st.id
                                    ? 'bg-[#3db4f2] text-white'
                                    : 'text-[#edf1f5] hover:bg-white/10'
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
                                className="w-full text-left px-2.5 py-1 text-xs text-[#e85d75] hover:bg-[#e85d75]/20 rounded transition font-medium border-t border-white/10 mt-1"
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
        <div className="p-12 rounded-xl anilist-card-static text-center space-y-3">
          <Search className="w-10 h-10 text-[#8ba0b2] mx-auto" />
          <h3 className="text-base font-bold text-[#edf1f5]">No anime found</h3>
          <p className="text-xs text-[#8ba0b2] max-w-sm mx-auto">
            No matching anime for the current filter criteria. Try adjusting your search query or
            resetting filters.
          </p>
          <button
            onClick={resetAllFilters}
            className="anilist-btn-primary px-4 py-2 text-xs font-bold"
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
            className="anilist-btn-secondary flex items-center gap-1 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold border border-white/10"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="px-3 py-1 rounded bg-[#151f2e] border border-white/10 text-xs font-mono text-[#edf1f5]">
            {currentPage} / {pageInfo.lastPage}
          </span>

          <button
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              updateFiltersInUrl({ page: newPage });
            }}
            disabled={!pageInfo.hasNextPage || loading}
            className="anilist-btn-secondary flex items-center gap-1 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold border border-white/10"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* All Genre Statistics Breakdown Modal */}
      {showGenreStatsModal &&
        createPortal(
          <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 overscroll-contain animate-fadeIn">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer transition-opacity"
              onClick={() => setShowGenreStatsModal(false)}
              aria-hidden="true"
            />
            <div className="relative w-full max-w-2xl bg-[#0e1726] border border-white/15 rounded-2xl p-5 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto my-auto pointer-events-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#3db4f2]" />
                  <h3 className="text-base font-bold text-white">
                    AniList Database: Anime Genre Counts
                  </h3>
                </div>
                <button
                  onClick={() => setShowGenreStatsModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                The catalog indexes over <strong>20,000+ total anime entries</strong>. Below is the total count per genre. Select any genre to browse:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {Object.values(GENRE_METADATA).map((meta) => {
                  const isCurrent = selectedGenre.toLowerCase() === meta.name.toLowerCase();
                  return (
                    <button
                      key={meta.name}
                      type="button"
                      onClick={() => {
                        setSelectedGenre(meta.name);
                        updateFiltersInUrl({ genre: meta.name });
                        setShowGenreStatsModal(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all group cursor-pointer ${
                        isCurrent
                          ? 'bg-[#3db4f2] text-white border-[#3db4f2] shadow-md shadow-[#3db4f2]/30'
                          : 'bg-[#151f2e] border-white/10 hover:border-[#3db4f2]/50 hover:bg-[#1a273b]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent ? 'text-white' : 'text-slate-100 group-hover:text-[#3db4f2]'
                          }`}
                        >
                          {meta.name}
                        </span>
                        <span
                          className={`text-xs font-mono font-black px-2 py-0.5 rounded-full ${
                            isCurrent ? 'bg-white/20 text-white' : 'bg-[#3db4f2]/15 text-[#3db4f2]'
                          }`}
                        >
                          {meta.formattedCount}
                        </span>
                      </div>
                      <p
                        className={`text-[10px] mt-1 line-clamp-1 ${
                          isCurrent ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        {meta.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-400">
                <span>* Note: Anime can belong to multiple genres.</span>
                <button
                  onClick={() => setShowGenreStatsModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
