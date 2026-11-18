import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
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
import { useSEO, SITE_URL } from '../utils/seo';

// Helper to calculate responsive, windowed page numbers with ellipsis
function getPaginationRange(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

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
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Dynamic SEO metadata for catalog, genre, seasonal, and search views
  let discoverTitle = 'Discover Anime • Explore Thousands of Titles | AnimeSenpai';
  let discoverDesc = 'Discover anime, explore thousands of titles, filter by genre, seasonal releases, and ratings with AnimeSenpai.';
  let discoverCanonical = `${SITE_URL}/discover`;
  let discoverRobots: string | undefined = undefined;

  if (searchQuery.trim()) {
    discoverTitle = `Search: "${searchQuery.trim()}" • AnimeSenpai`;
    discoverDesc = `Search results for "${searchQuery.trim()}" in AnimeSenpai's catalog of 20,000+ anime titles.`;
    discoverCanonical = `${SITE_URL}/discover`;
    // Prevent search index pollution with thin query parameters while allowing link following
    discoverRobots = 'noindex, follow';
  } else if (selectedGenre) {
    discoverTitle = `${selectedGenre} Anime • AnimeSenpai`;
    discoverDesc = `Explore top-rated and trending ${selectedGenre} anime series and movies on AnimeSenpai. Browse characters, voice cast, and official trailers.`;
    discoverCanonical = `${SITE_URL}/discover?genre=${encodeURIComponent(selectedGenre)}`;
  } else if (selectedSeason && selectedYear) {
    discoverTitle = `${selectedSeason} ${selectedYear} Anime Schedule • AnimeSenpai`;
    discoverDesc = `Discover current and upcoming anime broadcasting in ${selectedSeason} ${selectedYear} with episode counters and live scores on AnimeSenpai.`;
    discoverCanonical = `${SITE_URL}/discover?season=${selectedSeason}&year=${selectedYear}`;
  } else if (selectedFormat) {
    discoverTitle = `${selectedFormat.replace('_', ' ')} Anime Catalog • AnimeSenpai`;
    discoverDesc = `Browse all ${selectedFormat.replace('_', ' ')} releases with official trailers and community ratings on AnimeSenpai.`;
    discoverCanonical = `${SITE_URL}/discover?format=${selectedFormat}`;
  } else if (selectedSort === 'SCORE_DESC') {
    discoverTitle = 'Top 100 Highest Rated Anime • AnimeSenpai';
    discoverDesc = 'Browse the top 100 highest rated anime series and movies of all time on AnimeSenpai.';
    discoverCanonical = `${SITE_URL}/discover?sort=SCORE_DESC`;
  } else if (selectedSort === 'POPULARITY_DESC') {
    discoverTitle = 'All-Time Most Popular Anime • AnimeSenpai';
    discoverDesc = 'Explore the most popular and recognized anime across the globe on AnimeSenpai.';
    discoverCanonical = `${SITE_URL}/discover?sort=POPULARITY_DESC`;
  }

  const discoverBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: selectedGenre ? `${selectedGenre} Anime` : selectedSort === 'SCORE_DESC' ? 'Top 100 Anime' : 'Discover',
        item: discoverCanonical,
      },
    ],
  };

  useSEO({
    title: discoverTitle,
    description: discoverDesc,
    canonicalUrl: discoverCanonical,
    robots: discoverRobots,
    jsonLd: discoverBreadcrumbs,
  });

  const currentGenreMeta = selectedGenre ? GENRE_METADATA[selectedGenre] : null;

  const goToPage = (pageNumber: number) => {
    if (!pageInfo) return;
    const target = Math.max(1, Math.min(pageNumber, pageInfo.lastPage || 1));
    if (target === currentPage) return;
    setCurrentPage(target);
    updateFiltersInUrl({ page: target });
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageInfo) return;
    const val = parseInt(jumpPageInput.trim(), 10);
    if (!isNaN(val) && val >= 1 && val <= pageInfo.lastPage) {
      goToPage(val);
      setJumpPageInput('');
    }
  };

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeDropdownCount = [
    selectedGenre,
    selectedYear,
    selectedSeason,
    selectedFormat,
    selectedStatus,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-fadeIn">
      {/* AniList Minimalist Filter Bar */}
      <div className="space-y-3">
        {/* Mobile Compact Search + Filter Toggle Bar (< sm) */}
        <div className="flex sm:hidden items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0">
            <Search aria-hidden="true" className="w-4 h-4 text-[#9a9aa6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateFiltersInUrl({ search: e.target.value });
              }}
              placeholder="Search anime..."
              className="w-full bg-[#0b0b0d] text-white text-base font-medium pl-9 pr-8 py-2.5 rounded-xl border border-[#232329] focus:border-[#3a3a44] focus:ring-1 focus:ring-white/15 outline-none transition placeholder-[#666672]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  updateFiltersInUrl({ search: '' });
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#9a9aa6] hover:text-white"
              >
                <X aria-hidden="true" className="w-4 h-4" />
              </button>
            )}
          </form>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            aria-expanded={mobileFiltersOpen}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl border text-xs font-bold flex-shrink-0 transition ${
              mobileFiltersOpen || activeDropdownCount > 0
                ? 'bg-white text-black border-white'
                : 'bg-[#0b0b0d] text-white border-[#232329]'
            }`}
          >
            <SlidersHorizontal aria-hidden="true" className="w-4 h-4" />
            <span>Filters</span>
            {activeDropdownCount > 0 && (
              <span
                className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
                  mobileFiltersOpen || activeDropdownCount > 0
                    ? 'bg-[#0b0b0d] text-white'
                    : 'bg-white text-black'
                }`}
              >
                {activeDropdownCount}
              </span>
            )}
          </button>
        </div>

        {/* Full Filter Grid (always visible on sm+, collapsible on mobile) */}
        <div
          className={`${
            mobileFiltersOpen ? 'grid' : 'hidden sm:grid'
          } grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-3 items-end`}
        >
          {/* 1. Search (hidden on mobile since shown in compact bar above) */}
          <div className="hidden sm:block sm:col-span-1 lg:col-span-2">
            <label className="block text-[11px] font-bold text-[#9a9aa6] tracking-wider mb-1">
              Search
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6] absolute left-3 top-3 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateFiltersInUrl({ search: e.target.value });
                }}
                placeholder="Any"
                className="w-full bg-[#0b0b0d] text-white text-xs font-semibold pl-9 pr-7 py-2.5 rounded-lg border border-[#232329] focus:border-[#3a3a44] focus:ring-1 focus:ring-white/15 outline-none transition placeholder-[#666672]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    updateFiltersInUrl({ search: '' });
                  }}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-2.5 text-[#9a9aa6] hover:text-white"
                >
                  <X aria-hidden="true" className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* 2. Genres & Tags */}
          <div>
            <label className="block text-[11px] font-bold text-[#9a9aa6] tracking-wider mb-1">
              Genres & Tags
            </label>
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => {
                  setSelectedGenre(e.target.value);
                  updateFiltersInUrl({ genre: e.target.value });
                }}
                className="w-full bg-[#0b0b0d] text-white text-xs font-semibold px-3 py-2.5 min-h-[40px] rounded-lg border border-[#232329] sm:border-[#232329] focus:border-[#3a3a44] outline-none appearance-none cursor-pointer pr-8"
              >
                <option value="">Any</option>
                {GENRE_LIST.map((g) => (
                  <option key={g} value={g} className="bg-[#0b0b0d] text-white">
                    {g}
                  </option>
                ))}
              </select>
              <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* 3. Year */}
          <div>
            <label className="block text-[11px] font-bold text-[#9a9aa6] tracking-wider mb-1">
              Year
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  updateFiltersInUrl({ year: e.target.value });
                }}
                className="w-full bg-[#0b0b0d] text-white text-xs font-semibold px-3 py-2.5 min-h-[40px] rounded-lg border border-[#232329] sm:border-[#232329] focus:border-[#3a3a44] outline-none appearance-none cursor-pointer pr-8"
              >
                <option value="">Any</option>
                {yearsList.map((y) => (
                  <option key={y} value={y} className="bg-[#0b0b0d] text-white">
                    {y}
                  </option>
                ))}
              </select>
              <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* 4. Season */}
          <div>
            <label className="block text-[11px] font-bold text-[#9a9aa6] tracking-wider mb-1">
              Season
            </label>
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(e.target.value);
                  updateFiltersInUrl({ season: e.target.value });
                }}
                className="w-full bg-[#0b0b0d] text-white text-xs font-semibold px-3 py-2.5 min-h-[40px] rounded-lg border border-[#232329] sm:border-[#232329] focus:border-[#3a3a44] outline-none appearance-none cursor-pointer pr-8"
              >
                <option value="">Any</option>
                <option value="WINTER" className="bg-[#0b0b0d] text-white">Winter</option>
                <option value="SPRING" className="bg-[#0b0b0d] text-white">Spring</option>
                <option value="SUMMER" className="bg-[#0b0b0d] text-white">Summer</option>
                <option value="FALL" className="bg-[#0b0b0d] text-white">Fall</option>
              </select>
              <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* 5. Format */}
          <div>
            <label className="block text-[11px] font-bold text-[#9a9aa6] tracking-wider mb-1">
              Format
            </label>
            <div className="relative">
              <select
                value={selectedFormat}
                onChange={(e) => {
                  setSelectedFormat(e.target.value);
                  updateFiltersInUrl({ format: e.target.value });
                }}
                className="w-full bg-[#0b0b0d] text-white text-xs font-semibold px-3 py-2.5 min-h-[40px] rounded-lg border border-[#232329] sm:border-[#232329] focus:border-[#3a3a44] outline-none appearance-none cursor-pointer pr-8"
              >
                <option value="">Any</option>
                <option value="TV" className="bg-[#0b0b0d] text-white">TV Show</option>
                <option value="MOVIE" className="bg-[#0b0b0d] text-white">Movie</option>
                <option value="TV_SHORT" className="bg-[#0b0b0d] text-white">TV Short</option>
                <option value="OVA" className="bg-[#0b0b0d] text-white">OVA</option>
                <option value="ONA" className="bg-[#0b0b0d] text-white">ONA</option>
                <option value="SPECIAL" className="bg-[#0b0b0d] text-white">Special</option>
              </select>
              <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* 6. Airing Status & 7. Toggle Filter Button (spans 2 cols on mobile so Status dropdown isn't cramped) */}
          <div className="col-span-2 sm:col-span-1 flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold text-[#9a9aa6] tracking-wider mb-1">
                Airing Status
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    updateFiltersInUrl({ status: e.target.value });
                  }}
                  className="w-full bg-[#0b0b0d] text-white text-xs font-semibold px-3 py-2.5 min-h-[40px] rounded-lg border border-[#232329] sm:border-[#232329] focus:border-[#3a3a44] outline-none appearance-none cursor-pointer pr-8"
                >
                  <option value="">Any</option>
                  <option value="RELEASING" className="bg-[#0b0b0d] text-white">Airing</option>
                  <option value="FINISHED" className="bg-[#0b0b0d] text-white">Finished</option>
                  <option value="NOT_YET_RELEASED" className="bg-[#0b0b0d] text-white">Not Yet Aired</option>
                  <option value="CANCELLED" className="bg-[#0b0b0d] text-white">Cancelled</option>
                </select>
                <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Options button */}
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              aria-label="Toggle advanced filter options"
              aria-expanded={showAdvancedOptions}
              className={`p-2.5 min-w-[40px] min-h-[40px] rounded-lg border transition flex items-center justify-center flex-shrink-0 ${
                showAdvancedOptions || hasActiveFilters
                  ? 'bg-white text-black border-white'
                  : 'bg-[#0b0b0d] text-[#9a9aa6] hover:text-white border-[#232329] sm:border-[#232329]'
              }`}
              title="Advanced Filter Options"
            >
              <SlidersHorizontal aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters & Popular Chips Drawer */}
        {showAdvancedOptions && (
          <div className="p-4 rounded-xl bg-[#0b0b0d]/95 border border-[#232329] space-y-3 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#9a9aa6]">Sort By:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    updateFiltersInUrl({ sort: e.target.value });
                  }}
                  className="bg-[#0b0b0d] text-white text-xs font-bold px-3 py-1.5 rounded border border-[#232329] outline-none cursor-pointer"
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
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#232329]">
              <span className="text-xs font-bold text-[#9a9aa6] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-white" /> Quick Genres:
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
                        ? 'bg-white text-black'
                        : 'bg-[#0b0b0d] text-[#9a9aa6] hover:text-white border border-[#232329]'
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
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#0b0b0d]/95 hover:bg-[#0b0b0d] border border-white/15 text-slate-300 hover:text-white items-center justify-center shadow-lg backdrop-blur-md opacity-0 group-hover/category:opacity-100 transition-opacity"
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
              color: 'text-white',
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
                className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer active:scale-95 ${
                  cat.active
                    ? 'bg-white text-black font-bold border border-white'
                    : 'liquid-glass-pill text-[#c8c8d2] hover:text-white'
                }`}
              >
                <Icon aria-hidden="true" className={`w-3.5 h-3.5 ${cat.active ? 'text-black' : 'text-[#9a9aa6]'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          onClick={() => scrollCategoryBar('right')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#0b0b0d]/95 hover:bg-[#0b0b0d] border border-white/15 text-slate-300 hover:text-white items-center justify-center shadow-lg backdrop-blur-md opacity-0 group-hover/category:opacity-100 transition-opacity"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-[#9a9aa6] uppercase tracking-wider mr-1">
            Active Filters:
          </span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#151519] border border-[#3a3a44] text-xs font-semibold text-white">
              Search: <strong className="text-white font-bold">"{searchQuery}"</strong>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  updateFiltersInUrl({ search: '' });
                }}
                className="text-[#9a9aa6] hover:text-white ml-1"
                aria-label="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedGenre && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#151519] border border-[#3a3a44] text-xs font-semibold text-white">
              Genre: <strong className="text-white font-bold">{selectedGenre}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedGenre('');
                  updateFiltersInUrl({ genre: '' });
                }}
                className="text-[#9a9aa6] hover:text-white ml-1"
                aria-label="Remove genre filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedYear && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#151519] border border-[#232329] text-xs font-semibold text-white">
              Year: <strong className="text-white font-bold">{selectedYear}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedYear('');
                  updateFiltersInUrl({ year: '' });
                }}
                className="text-[#9a9aa6] hover:text-white ml-1"
                aria-label="Remove year filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSeason && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#151519] border border-[#232329] text-xs font-semibold text-white">
              Season: <strong className="text-white font-bold">{selectedSeason}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedSeason('');
                  updateFiltersInUrl({ season: '' });
                }}
                className="text-[#9a9aa6] hover:text-white ml-1"
                aria-label="Remove season filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedFormat && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#151519] border border-[#232329] text-xs font-semibold text-white">
              Format: <strong className="text-white font-bold">{selectedFormat.replace('_', ' ')}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedFormat('');
                  updateFiltersInUrl({ format: '' });
                }}
                className="text-[#9a9aa6] hover:text-white ml-1"
                aria-label="Remove format filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#151519] border border-[#232329] text-xs font-semibold text-white">
              Status: <strong className="text-white font-bold">{selectedStatus.replace(/_/g, ' ')}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('');
                  updateFiltersInUrl({ status: '' });
                }}
                className="text-[#9a9aa6] hover:text-white ml-1"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#232329]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
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
            </h1>

            {!loading && pageInfo && (
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  onClick={() => setShowCountInfo(!showCountInfo)}
                  className="px-2.5 py-0.5 rounded-full bg-[#151519] hover:bg-white hover:text-black border border-[#3a3a44] text-white text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer group"
                  title="Click to view catalog details"
                >
                  <span>
                    {selectedGenre && currentGenreMeta
                      ? pageInfo.total >= 5000
                        ? `5,000+ ${selectedGenre} available (${currentGenreMeta.formattedCount} indexed)`
                        : `${pageInfo.total.toLocaleString()} ${selectedGenre} anime found`
                      : pageInfo.total >= 5000
                      ? '5,000+ ranked titles'
                      : `${pageInfo.total.toLocaleString()} anime found`}
                  </span>
                  <Info className="w-3 h-3" />
                </button>

                {/* Popover explaining query ranking & genre totals */}
                {showCountInfo && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/40 sm:hidden"
                      onClick={() => setShowCountInfo(false)}
                      aria-hidden="true"
                    />
                    <div className="fixed inset-x-4 top-20 sm:inset-x-auto sm:top-full sm:absolute sm:left-0 sm:mt-2 sm:w-84 p-3.5 rounded-2xl bg-[#0b0b0d]/98 backdrop-blur-2xl border border-[#3a3a44] shadow-2xl z-50 text-xs text-slate-200 animate-fadeIn space-y-2.5">
                      <div className="flex items-center justify-between font-bold text-white border-b border-[#232329] pb-1.5">
                        <span className="flex items-center gap-1.5 text-white">
                          <Sparkles aria-hidden="true" className="w-3.5 h-3.5" />{' '}
                          {selectedGenre ? `${selectedGenre} Anime Catalog` : 'AniList Live Catalog'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCountInfo(false)}
                          aria-label="Close catalog info"
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <X aria-hidden="true" className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {selectedGenre && currentGenreMeta ? (
                        <div className="space-y-1.5 text-[11px] leading-relaxed">
                          <p className="text-slate-200">
                            The AniList catalog indexes approximately{' '}
                            <strong className="text-white">{currentGenreMeta.formattedCount} {selectedGenre}</strong> anime titles ({currentGenreMeta.description}).
                          </p>
                          <p className="text-slate-400">
                            To maintain instant query speeds, AniList GraphQL API serves up to the top{' '}
                            <strong className="text-slate-200">5,000 ranked entries (208 pages)</strong> per query.
                          </p>
                          <p className="text-slate-400">
                            Tip: Use the <strong>Year</strong>, <strong>Season</strong>, or <strong>Format</strong> filters to narrow down exact subsets.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-[11px] leading-relaxed">
                          <p className="text-slate-300">
                            <strong>AnimeSenpai</strong> connects directly to the live AniList GraphQL catalog in real time.
                          </p>
                          <p className="text-slate-400">
                            Broad queries return the top <strong>5,000 ranked anime</strong> across 208 pages. Filter by <strong>Genre, Year, Format, or Search keywords</strong> to find any title.
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowCountInfo(false);
                          setShowGenreStatsModal(true);
                        }}
                        className="w-full text-center py-2 rounded-full bg-[#151519] hover:bg-white hover:text-black border border-[#3a3a44] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BarChart2 aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>View All 18 Genre Totals</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-[#9a9aa6] mt-0.5">
            {loading
              ? 'Searching anime catalog in real-time...'
              : pageInfo
              ? selectedGenre && currentGenreMeta && pageInfo.total >= 5000
                ? `Page ${pageInfo.currentPage} of ${pageInfo.lastPage.toLocaleString()} • ${results.length} on this page (Showing top 5,000 ${selectedGenre} anime from ${currentGenreMeta.formattedCount} in catalog)`
                : `Page ${pageInfo.currentPage} of ${pageInfo.lastPage.toLocaleString()} • ${results.length} on this page`
              : 'Browse AnimeSenpai Catalog'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0b0b0d] px-2.5 py-1.5 min-h-[38px] rounded-lg border border-[#232329] text-xs">
            <ArrowUpDown aria-hidden="true" className="w-3.5 h-3.5 text-white flex-shrink-0" />
            <span className="text-[11px] font-bold text-[#9a9aa6] hidden sm:inline">Sort:</span>
            <select
              value={selectedSort}
              aria-label="Sort results"
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setCurrentPage(1);
                updateFiltersInUrl({ sort: e.target.value, page: 1 });
              }}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1"
            >
              <option value="TRENDING_DESC" className="bg-[#0b0b0d] text-white">Trending</option>
              <option value="POPULARITY_DESC" className="bg-[#0b0b0d] text-white">Most Popular</option>
              <option value="SCORE_DESC" className="bg-[#0b0b0d] text-white">Top Rated</option>
              <option value="START_DATE_DESC" className="bg-[#0b0b0d] text-white">Release Date</option>
              <option value="FAVOURITES_DESC" className="bg-[#0b0b0d] text-white">Most Favorited</option>
              <option value="TITLE_ROMAJI" className="bg-[#0b0b0d] text-white">Title (A–Z)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
          {/* Top Mini-Pagination Switcher */}
          {pageInfo && pageInfo.lastPage > 1 && (
            <div className="flex items-center gap-1 bg-[#0b0b0d] p-1 min-h-[38px] rounded-lg border border-[#232329] text-xs font-mono">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[#9a9aa6] hover:text-white cursor-pointer"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft aria-hidden="true" className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] text-slate-300">
                <strong className="text-white">{currentPage}</strong>/{pageInfo.lastPage}
              </span>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={!pageInfo.hasNextPage || loading}
                className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[#9a9aa6] hover:text-white cursor-pointer"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight aria-hidden="true" className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex items-center p-0.5 min-h-[38px] rounded-lg bg-[#0b0b0d] border border-[#232329]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              className={`p-2 rounded text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#9a9aa6] hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid aria-hidden="true" className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="List View"
              className={`p-2 rounded text-xs font-bold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#9a9aa6] hover:text-white'
              }`}
              title="List View"
            >
              <List aria-hidden="true" className="w-3.5 h-3.5" />
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
          {Array.from({ length: 18 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
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
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg anilist-table-row gap-2 sm:gap-4"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <span className="text-[11px] sm:text-sm font-bold text-[#9a9aa6] w-6 sm:w-7 text-right flex-shrink-0">
                      #{rankNum}
                    </span>

                    <Link
                      to={`/anime/${anime.id}`}
                      className="w-10 sm:w-12 aspect-[3/4] rounded overflow-hidden flex-shrink-0 bg-[#0b0b0d] relative group"
                    >
                      <img
                        src={anime.coverImage.medium || anime.coverImage.large}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/anime/${anime.id}`}
                        className="font-semibold text-xs sm:text-sm text-white hover:text-white truncate block transition"
                        title={title}
                      >
                        {title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] sm:text-[11px] text-[#9a9aa6] mt-0.5">
                        <span className="text-white font-semibold truncate max-w-[110px] sm:max-w-none">
                          {anime.studios?.nodes?.[0]?.name || 'Studio'}
                        </span>
                        <span>·</span>
                        <span>{anime.format?.replace('_', ' ') || 'Anime'}</span>
                        <span>·</span>
                        <span>{anime.seasonYear || 'TBA'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {anime.averageScore ? (
                      <div
                        className={`px-2 py-0.5 rounded text-xs font-bold ${getScoreBadgeClass(
                          anime.averageScore
                        )}`}
                      >
                        {anime.averageScore}%
                      </div>
                    ) : (
                      <div className="text-xs text-[#9a9aa6]">—</div>
                    )}

                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenStatusMenuId(isMenuOpen ? null : anime.id)
                        }
                        className={`p-2 rounded text-xs font-bold transition flex items-center justify-center ${
                          inWatchlist
                            ? 'bg-[#7bd555] text-black'
                            : 'anilist-btn-secondary text-white hover:text-white border border-[#232329]'
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
                          <div className="absolute right-0 top-full mt-1.5 z-40 w-44 p-1.5 rounded-lg anilist-surface-elevated border border-[#232329] shadow-2xl space-y-0.5 animate-fadeIn">
                            <div className="text-[10px] uppercase font-bold text-[#9a9aa6] px-2 py-1 tracking-wider border-b border-[#232329]">
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
                                    ? 'bg-white text-black'
                                    : 'text-white hover:bg-white/10'
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
                                className="w-full text-left px-2.5 py-1 text-xs text-[#e85d75] hover:bg-[#e85d75]/20 rounded transition font-medium border-t border-[#232329] mt-1"
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
          <Search className="w-10 h-10 text-[#9a9aa6] mx-auto" />
          <h3 className="text-base font-bold text-white">No anime found</h3>
          <p className="text-xs text-[#9a9aa6] max-w-sm mx-auto">
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

      {/* Comprehensive Numbered Pagination & Range Stats */}
      {pageInfo && pageInfo.lastPage > 1 && (
        <div className="pt-8 pb-6 border-t border-[#232329] flex flex-col items-center gap-4">
          {/* Summary Text: Real range & real counts */}
          <div className="text-xs text-[#9a9aa6] font-mono text-center flex flex-wrap items-center justify-center gap-2">
            <span>
              Showing <strong className="text-white font-bold">{(currentPage - 1) * 24 + 1}–{Math.min(currentPage * 24, pageInfo.total >= 5000 ? 5000 : pageInfo.total)}</strong> of{' '}
              <strong className="text-white font-bold">
                {pageInfo.total >= 5000 ? '5,000+' : pageInfo.total.toLocaleString()}
              </strong>{' '}
              anime
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Page <strong className="text-white font-bold">{currentPage}</strong> of{' '}
              <strong className="text-white font-bold">{pageInfo.lastPage}</strong>
            </span>
          </div>

          {/* Numbered Controls Row */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {/* First Page */}
            <button
              type="button"
              onClick={() => goToPage(1)}
              disabled={currentPage <= 1 || loading}
              className="hidden sm:flex px-2.5 sm:px-3 py-2 rounded-lg bg-[#0b0b0d] border border-[#232329] text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold items-center gap-1 cursor-pointer"
              title="First Page"
              aria-label="First Page"
            >
              <ChevronsLeft aria-hidden="true" className="w-4 h-4" />
              <span className="hidden md:inline">First</span>
            </button>

            {/* Prev Page */}
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="px-2.5 sm:px-3 py-2 min-h-[38px] rounded-lg bg-[#0b0b0d] border border-[#232329] text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ChevronLeft aria-hidden="true" className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Number Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1">
              {getPaginationRange(currentPage, pageInfo.lastPage).map((item, idx) => {
                if (item === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 sm:px-2 py-1 text-slate-500 font-mono text-xs select-none"
                    >
                      …
                    </span>
                  );
                }

                const pageNum = item as number;
                const isCurrent = pageNum === currentPage;

                return (
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    disabled={loading}
                    className={`min-w-[34px] sm:min-w-[38px] h-9 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center font-mono cursor-pointer ${
                      isCurrent
                        ? 'bg-white text-black shadow-lg shadow-black/40 ring-1 ring-white'
                        : 'bg-[#0b0b0d] text-slate-300 hover:text-white hover:bg-white/10 border border-[#232329]'
                    }`}
                    aria-label={`Page ${pageNum}`}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={!pageInfo.hasNextPage || loading}
              className="px-2.5 sm:px-3 py-2 min-h-[38px] rounded-lg bg-[#0b0b0d] border border-[#232329] text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Next Page"
              aria-label="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight aria-hidden="true" className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => goToPage(pageInfo.lastPage)}
              disabled={currentPage >= pageInfo.lastPage || loading}
              className="hidden sm:flex px-2.5 sm:px-3 py-2 rounded-lg bg-[#0b0b0d] border border-[#232329] text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold items-center gap-1 cursor-pointer"
              title="Last Page"
              aria-label="Last Page"
            >
              <span className="hidden md:inline">Last</span>
              <ChevronsRight aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Jump to Page Form */}
          {pageInfo.lastPage > 5 && (
            <form onSubmit={handleJumpPage} className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <span>Go to page:</span>
              <input
                type="number"
                min={1}
                max={pageInfo.lastPage}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                placeholder={`${currentPage}`}
                className="w-16 px-2.5 py-1.5 rounded-lg bg-[#0b0b0d] border border-[#232329] text-white text-base sm:text-xs font-mono text-center focus:border-white outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 min-h-[36px] rounded-lg bg-[#151519] hover:bg-white text-white hover:text-black font-bold transition border border-[#3a3a44] cursor-pointer text-xs"
              >
                Go
              </button>
            </form>
          )}
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
            <div className="relative w-full max-w-2xl bg-[#0b0b0d] border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl z-10 space-y-4 max-h-[90dvh] overflow-y-auto my-auto pointer-events-auto">
              <div className="flex items-center justify-between gap-2 border-b border-[#232329] pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <BarChart2 aria-hidden="true" className="w-5 h-5 text-white flex-shrink-0" />
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    AniList Database: Anime Genre Counts
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGenreStatsModal(false)}
                  aria-label="Close genre statistics"
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0"
                >
                  <X aria-hidden="true" className="w-4 h-4" />
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
                          ? 'bg-white text-black border-white shadow-md shadow-black/40'
                          : 'bg-[#0b0b0d] border-[#232329] hover:border-[#3a3a44] hover:bg-[#151519]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent ? 'text-black' : 'text-white'
                          }`}
                        >
                          {meta.name}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full tabular-nums ${
                            isCurrent ? 'bg-black/15 text-black' : 'bg-[#151519] text-white border border-[#232329]'
                          }`}
                        >
                          {meta.formattedCount}
                        </span>
                      </div>
                      <p
                        className={`text-[10px] mt-1 line-clamp-1 ${
                          isCurrent ? 'text-black/70' : 'text-[#9a9aa6]'
                        }`}
                      >
                        {meta.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#232329] text-[11px] text-slate-400">
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
