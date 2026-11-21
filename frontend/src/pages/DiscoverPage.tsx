import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Check,
  Plus,
  ArrowUpDown,
} from 'lucide-react';
import { searchAnime, GENRE_LIST, getCurrentSeason } from '../api/anilist';
import type { AnimeCardData, PageInfo, WatchlistStatus } from '../api/types';
import { AnimeCard } from '../components/common/AnimeCard';
import { CardSkeleton, TableRowSkeleton } from '../components/common/Skeleton';
import { useWatchlist } from '../context/WatchlistContext';
import { usePreferences } from '../context/PreferencesContext';
import { useSEO, SITE_URL } from '../utils/seo';

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
  const { getPreferredTitle } = usePreferences();

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [results, setResults] = useState<AnimeCardData[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<number | null>(null);

  // Dynamic SEO metadata
  let discoverTitle = 'Discover Anime • AnimeSenpai';
  let discoverDesc =
    'Discover anime, filter by genre, seasonal releases, format, and community ratings on AnimeSenpai.';
  let discoverCanonical = `${SITE_URL}/discover`;
  let discoverRobots: string | undefined = undefined;

  if (searchQuery.trim()) {
    discoverTitle = `Search: "${searchQuery.trim()}" • AnimeSenpai`;
    discoverDesc = `Search results for "${searchQuery.trim()}" on AnimeSenpai.`;
    discoverCanonical = `${SITE_URL}/discover`;
    discoverRobots = 'noindex, follow';
  } else if (selectedGenre) {
    discoverTitle = `${selectedGenre} Anime • AnimeSenpai`;
    discoverDesc = `Explore top-rated and trending ${selectedGenre} anime series and movies on AnimeSenpai.`;
    discoverCanonical = `${SITE_URL}/discover?genre=${encodeURIComponent(selectedGenre)}`;
  } else if (selectedSeason && selectedYear) {
    discoverTitle = `${selectedSeason} ${selectedYear} Anime • AnimeSenpai`;
    discoverDesc = `Discover anime broadcasting in ${selectedSeason} ${selectedYear} on AnimeSenpai.`;
    discoverCanonical = `${SITE_URL}/discover?season=${selectedSeason}&year=${selectedYear}`;
  } else if (selectedFormat) {
    discoverTitle = `${selectedFormat.replace('_', ' ')} Anime • AnimeSenpai`;
    discoverDesc = `Browse ${selectedFormat.replace('_', ' ')} anime with trailers and ratings on AnimeSenpai.`;
    discoverCanonical = `${SITE_URL}/discover?format=${selectedFormat}`;
  } else if (selectedSort === 'SCORE_DESC') {
    discoverTitle = 'Top 100 Highest Rated Anime • AnimeSenpai';
    discoverDesc = 'Browse the highest rated anime series and movies of all time on AnimeSenpai.';
    discoverCanonical = `${SITE_URL}/discover?sort=SCORE_DESC`;
  } else if (selectedSort === 'POPULARITY_DESC') {
    discoverTitle = 'All-Time Most Popular Anime • AnimeSenpai';
    discoverDesc = 'Explore the most popular anime series and movies on AnimeSenpai.';
    discoverCanonical = `${SITE_URL}/discover?sort=POPULARITY_DESC`;
  }

  const discoverBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: selectedGenre
          ? `${selectedGenre} Anime`
          : selectedSort === 'SCORE_DESC'
          ? 'Top 100 Anime'
          : 'Discover',
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

  // Sync state with URL params
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

  const goToPage = (pageNumber: number) => {
    if (!pageInfo) return;
    const target = Math.max(1, Math.min(pageNumber, pageInfo.lastPage || 1));
    if (target === currentPage) return;
    setCurrentPage(target);
    updateFiltersInUrl({ page: target });
  };

  const applyPreset = (
    preset: 'trending' | 'seasonal' | 'popular' | 'topRated' | 'upcoming' | 'movies' | 'tv'
  ) => {
    const { season, year } = getCurrentSeason();
    const base = {
      search: '',
      genre: '',
      format: '',
      status: '',
      season: '',
      year: '',
      sort: 'TRENDING_DESC',
      page: 1,
    };

    if (preset === 'seasonal') {
      updateFiltersInUrl({ ...base, season, year: year.toString(), sort: 'POPULARITY_DESC' });
    } else if (preset === 'popular') {
      updateFiltersInUrl({ ...base, sort: 'POPULARITY_DESC' });
    } else if (preset === 'topRated') {
      updateFiltersInUrl({ ...base, sort: 'SCORE_DESC' });
    } else if (preset === 'upcoming') {
      updateFiltersInUrl({ ...base, status: 'NOT_YET_RELEASED', sort: 'POPULARITY_DESC' });
    } else if (preset === 'movies') {
      updateFiltersInUrl({ ...base, format: 'MOVIE', sort: 'POPULARITY_DESC' });
    } else if (preset === 'tv') {
      updateFiltersInUrl({ ...base, format: 'TV', sort: 'TRENDING_DESC' });
    } else {
      updateFiltersInUrl(base);
    }
  };

  const currentYear = new Date().getFullYear() + 1;
  const yearsList = Array.from({ length: 45 }, (_, i) => (currentYear - i).toString());

  const activeFilterCount = [
    selectedGenre,
    selectedYear,
    selectedSeason,
    selectedFormat,
    selectedStatus,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

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

  const presets = [
    {
      id: 'trending' as const,
      label: 'Trending',
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
      label: 'This Season',
      active: Boolean(selectedSeason && selectedYear),
    },
    {
      id: 'popular' as const,
      label: 'Popular',
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
      label: 'Top 100',
      active: selectedSort === 'SCORE_DESC' && !selectedGenre && !searchQuery && !selectedFormat,
    },
    {
      id: 'upcoming' as const,
      label: 'Upcoming',
      active: selectedStatus === 'NOT_YET_RELEASED',
    },
    {
      id: 'movies' as const,
      label: 'Movies',
      active: selectedFormat === 'MOVIE',
    },
    {
      id: 'tv' as const,
      label: 'TV Series',
      active: selectedFormat === 'TV',
    },
  ];

  const headingTitle = selectedGenre
    ? `${selectedGenre} Anime`
    : searchQuery
    ? `Results for “${searchQuery}”`
    : selectedSeason && selectedYear
    ? `${selectedSeason} ${selectedYear}`
    : selectedFormat
    ? `${selectedFormat.replace('_', ' ')} Anime`
    : selectedSort === 'SCORE_DESC'
    ? 'Top 100 Anime'
    : selectedSort === 'POPULARITY_DESC'
    ? 'All-Time Popular'
    : selectedStatus === 'NOT_YET_RELEASED'
    ? 'Upcoming Releases'
    : 'Discover';

  return (
    <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 pt-4 pb-32 sm:py-7 space-y-4 animate-fadeIn min-w-0">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f7] tracking-[-0.03em]">
            {headingTitle}
          </h1>
          <p className="text-xs sm:text-[13px] text-[#9a9aa6]">
            Browse, filter, and track titles live from AniList
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-[#0c0c0f] px-3 py-2 min-h-[38px] rounded-full border border-[#23232b] text-xs">
            <ArrowUpDown aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6] flex-shrink-0" />
            <select
              value={selectedSort}
              aria-label="Sort results"
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setCurrentPage(1);
                updateFiltersInUrl({ sort: e.target.value, page: 1 });
              }}
              className="bg-transparent text-xs font-semibold text-[#f5f5f7] outline-none cursor-pointer pr-1"
            >
              <option value="TRENDING_DESC" className="bg-[#0c0c0f] text-[#f5f5f7]">Trending</option>
              <option value="POPULARITY_DESC" className="bg-[#0c0c0f] text-[#f5f5f7]">Most Popular</option>
              <option value="SCORE_DESC" className="bg-[#0c0c0f] text-[#f5f5f7]">Top Rated</option>
              <option value="START_DATE_DESC" className="bg-[#0c0c0f] text-[#f5f5f7]">Release Date</option>
              <option value="FAVOURITES_DESC" className="bg-[#0c0c0f] text-[#f5f5f7]">Most Favorited</option>
              <option value="TITLE_ROMAJI" className="bg-[#0c0c0f] text-[#f5f5f7]">Title (A–Z)</option>
            </select>
          </div>

          {/* Grid / List View Switcher */}
          <div className="flex items-center p-1 rounded-full bg-[#0c0c0f] border border-[#23232b]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              className={`p-1.5 rounded-full transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'btn-accent-active'
                  : 'text-[#9a9aa6] hover:text-[#f5f5f7]'
              }`}
              title="Grid View"
            >
              <LayoutGrid aria-hidden="true" className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="List View"
              className={`p-1.5 rounded-full transition cursor-pointer ${
                viewMode === 'table'
                  ? 'btn-accent-active'
                  : 'text-[#9a9aa6] hover:text-[#f5f5f7]'
              }`}
              title="List View"
            >
              <List aria-hidden="true" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Concise Quick Preset Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-scroll-smooth pb-0.5">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset.id)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap flex-shrink-0 cursor-pointer active:scale-95 ${
              preset.active
                ? 'btn-accent-active'
                : 'liquid-glass-pill text-[#9a9aa6] hover:text-[#f5f5f7]'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Compact Filter Bar */}
      <div className="space-y-3">
        {/* Mobile Search + Filter Drawer Button */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search aria-hidden="true" className="w-4 h-4 text-[#666672] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateFiltersInUrl({ search: e.target.value });
              }}
              placeholder="Search anime..."
              className="w-full bg-[#0c0c0f] text-[#f5f5f7] text-base pl-10 pr-8 py-2.5 rounded-full border border-[#23232b] focus:border-[#383844] outline-none placeholder-[#666672]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  updateFiltersInUrl({ search: '' });
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9aa6] hover:text-white"
              >
                <X aria-hidden="true" className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            aria-expanded={mobileFiltersOpen}
            className={`px-3.5 py-2.5 min-h-[44px] rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition cursor-pointer ${
              mobileFiltersOpen || activeFilterCount > 0
                ? 'btn-accent-active'
                : 'anilist-btn-secondary'
            }`}
          >
            <SlidersHorizontal aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/25">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Controls Grid */}
        <div
          className={`${
            mobileFiltersOpen ? 'grid' : 'hidden sm:grid'
          } grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5`}
        >
          <div className="hidden sm:block lg:col-span-2 relative">
            <Search aria-hidden="true" className="w-3.5 h-3.5 text-[#666672] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateFiltersInUrl({ search: e.target.value });
              }}
              placeholder="Search titles..."
              className="w-full bg-[#0c0c0f] text-[#f5f5f7] text-xs font-medium pl-9 pr-8 py-2.5 min-h-[40px] rounded-full border border-[#23232b] focus:border-[#383844] outline-none placeholder-[#666672]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  updateFiltersInUrl({ search: '' });
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9aa6] hover:text-white cursor-pointer"
              >
                <X aria-hidden="true" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedGenre}
            aria-label="Filter by genre"
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              updateFiltersInUrl({ genre: e.target.value });
            }}
            className="w-full bg-[#0c0c0f] text-[#f5f5f7] text-xs font-medium px-3.5 py-2.5 min-h-[40px] rounded-full border border-[#23232b] focus:border-[#383844] outline-none cursor-pointer"
          >
            <option value="">All Genres</option>
            {GENRE_LIST.map((g) => (
              <option key={g} value={g} className="bg-[#0c0c0f] text-[#f5f5f7]">
                {g}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            aria-label="Filter by year"
            onChange={(e) => {
              setSelectedYear(e.target.value);
              updateFiltersInUrl({ year: e.target.value });
            }}
            className="w-full bg-[#0c0c0f] text-[#f5f5f7] text-xs font-medium px-3.5 py-2.5 min-h-[40px] rounded-full border border-[#23232b] focus:border-[#383844] outline-none cursor-pointer"
          >
            <option value="">Any Year</option>
            {yearsList.map((y) => (
              <option key={y} value={y} className="bg-[#0c0c0f] text-[#f5f5f7]">
                {y}
              </option>
            ))}
          </select>

          <select
            value={selectedSeason}
            aria-label="Filter by season"
            onChange={(e) => {
              setSelectedSeason(e.target.value);
              updateFiltersInUrl({ season: e.target.value });
            }}
            className="w-full bg-[#0c0c0f] text-[#f5f5f7] text-xs font-medium px-3.5 py-2.5 min-h-[40px] rounded-full border border-[#23232b] focus:border-[#383844] outline-none cursor-pointer"
          >
            <option value="">Any Season</option>
            <option value="WINTER" className="bg-[#0c0c0f]">Winter</option>
            <option value="SPRING" className="bg-[#0c0c0f]">Spring</option>
            <option value="SUMMER" className="bg-[#0c0c0f]">Summer</option>
            <option value="FALL" className="bg-[#0c0c0f]">Fall</option>
          </select>

          <select
            value={selectedFormat}
            aria-label="Filter by format"
            onChange={(e) => {
              setSelectedFormat(e.target.value);
              updateFiltersInUrl({ format: e.target.value });
            }}
            className="w-full bg-[#0c0c0f] text-[#f5f5f7] text-xs font-medium px-3.5 py-2.5 min-h-[40px] rounded-full border border-[#23232b] focus:border-[#383844] outline-none cursor-pointer"
          >
            <option value="">All Formats</option>
            <option value="TV" className="bg-[#0c0c0f]">TV Series</option>
            <option value="MOVIE" className="bg-[#0c0c0f]">Movie</option>
            <option value="TV_SHORT" className="bg-[#0c0c0f]">TV Short</option>
            <option value="OVA" className="bg-[#0c0c0f]">OVA</option>
            <option value="ONA" className="bg-[#0c0c0f]">ONA</option>
            <option value="SPECIAL" className="bg-[#0c0c0f]">Special</option>
          </select>
        </div>

        {/* Active Filters Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {selectedGenre && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16161b] border border-[#23232b] text-xs text-[#f5f5f7]">
                {selectedGenre}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGenre('');
                    updateFiltersInUrl({ genre: '' });
                  }}
                  aria-label="Remove genre filter"
                  className="text-[#9a9aa6] hover:text-white cursor-pointer"
                >
                  <X aria-hidden="true" className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedYear && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16161b] border border-[#23232b] text-xs text-[#f5f5f7]">
                {selectedYear}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear('');
                    updateFiltersInUrl({ year: '' });
                  }}
                  aria-label="Remove year filter"
                  className="text-[#9a9aa6] hover:text-white cursor-pointer"
                >
                  <X aria-hidden="true" className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSeason && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16161b] border border-[#23232b] text-xs text-[#f5f5f7]">
                {selectedSeason}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSeason('');
                    updateFiltersInUrl({ season: '' });
                  }}
                  aria-label="Remove season filter"
                  className="text-[#9a9aa6] hover:text-white cursor-pointer"
                >
                  <X aria-hidden="true" className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedFormat && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16161b] border border-[#23232b] text-xs text-[#f5f5f7]">
                {selectedFormat.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('');
                    updateFiltersInUrl({ format: '' });
                  }}
                  aria-label="Remove format filter"
                  className="text-[#9a9aa6] hover:text-white cursor-pointer"
                >
                  <X aria-hidden="true" className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStatus && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16161b] border border-[#23232b] text-xs text-[#f5f5f7]">
                {selectedStatus.replace(/_/g, ' ')}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus('');
                    updateFiltersInUrl({ status: '' });
                  }}
                  aria-label="Remove status filter"
                  className="text-[#9a9aa6] hover:text-white cursor-pointer"
                >
                  <X aria-hidden="true" className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-medium text-[#9a9aa6] hover:text-white px-2 py-1 transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Results Grid / List */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 18 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </div>
        )
      ) : results.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((anime, index) => {
              const title = getPreferredTitle(anime.title, 'Anime');
              const inWatchlist = isInWatchlist(anime.id);
              const currentItem = getItem(anime.id);
              const rankNum = (currentPage - 1) * 24 + index + 1;
              const isMenuOpen = openStatusMenuId === anime.id;

              return (
                <div
                  key={anime.id}
                  className="flex items-center justify-between p-3 rounded-2xl anilist-table-row gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono text-[#666672] w-7 text-right flex-shrink-0 tabular-nums">
                      #{rankNum}
                    </span>

                    <Link
                      to={`/anime/${anime.id}`}
                      className="w-10 sm:w-12 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0 bg-[#16161b] border border-[#23232b]"
                    >
                      <img
                        src={anime.coverImage.medium || anime.coverImage.large}
                        alt={title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/anime/${anime.id}`}
                        className="font-semibold text-xs sm:text-sm text-[#f5f5f7] hover:underline truncate block"
                        title={title}
                      >
                        {title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-[#9a9aa6] mt-0.5 tabular-nums">
                        {anime.studios?.nodes?.[0]?.name && (
                          <>
                            <span className="truncate max-w-[120px] sm:max-w-none">
                              {anime.studios.nodes[0].name}
                            </span>
                            <span>·</span>
                          </>
                        )}
                        <span>{anime.format?.replace('_', ' ') || 'Anime'}</span>
                        <span>·</span>
                        <span>{anime.seasonYear || 'TBA'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {anime.averageScore ? (
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${getScoreBadgeClass(
                          anime.averageScore
                        )}`}
                      >
                        {anime.averageScore}%
                      </div>
                    ) : null}

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenStatusMenuId(isMenuOpen ? null : anime.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                          inWatchlist
                            ? 'bg-emerald-500 text-black'
                            : 'anilist-btn-secondary'
                        }`}
                        title="Set Status"
                        aria-label={`Manage watchlist status for ${title}`}
                      >
                        {inWatchlist ? (
                          <Check aria-hidden="true" className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <Plus aria-hidden="true" className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setOpenStatusMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1.5 z-40 w-40 p-1.5 rounded-2xl bg-[#0c0c0f] border border-[#23232b] shadow-2xl space-y-0.5 animate-fadeIn">
                            {statusLabels.map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  addToWatchlist(anime, st.id);
                                  setOpenStatusMenuId(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl flex items-center justify-between font-medium transition cursor-pointer ${
                                  currentItem?.status === st.id
                                    ? 'btn-accent-active font-semibold'
                                    : 'text-[#d2d2dc] hover:bg-[#16161b] hover:text-white'
                                }`}
                              >
                                <span>{st.label}</span>
                                {currentItem?.status === st.id && (
                                  <Check aria-hidden="true" className="w-3 h-3" />
                                )}
                              </button>
                            ))}
                            {inWatchlist && (
                              <button
                                type="button"
                                onClick={() => {
                                  removeFromWatchlist(anime.id);
                                  setOpenStatusMenuId(null);
                                }}
                                className="w-full text-left px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/15 rounded-xl transition font-medium border-t border-[#23232b] mt-1 cursor-pointer"
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
        <div className="p-12 rounded-2xl anilist-card-static text-center space-y-3">
          <Search aria-hidden="true" className="w-9 h-9 text-[#666672] mx-auto" />
          <h2 className="text-base font-bold text-[#f5f5f7]">No anime found</h2>
          <p className="text-xs text-[#9a9aa6] max-w-sm mx-auto">
            Try adjusting your search keywords or clearing active filters.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="anilist-btn-primary px-5 py-2.5 text-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Minimalist Numbered Pagination */}
      {pageInfo && pageInfo.lastPage > 1 && (
        <nav
          aria-label="Catalog pagination"
          className="pt-8 pb-4 border-t border-[#23232b] flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap"
        >
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="anilist-btn-secondary px-3 py-2 min-h-[38px] text-xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            aria-label="Previous Page"
          >
            <ChevronLeft aria-hidden="true" className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <div className="flex items-center gap-1">
            {getPaginationRange(currentPage, pageInfo.lastPage).map((item, idx) => {
              if (item === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1.5 py-1 text-[#666672] font-mono text-xs select-none"
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
                  className={`min-w-[36px] h-9 px-2 rounded-full text-xs font-semibold transition flex items-center justify-center font-mono tabular-nums cursor-pointer ${
                    isCurrent
                      ? 'btn-accent-active'
                      : 'bg-[#0c0c0f] text-[#9a9aa6] hover:text-white border border-[#23232b] hover:border-[#383844]'
                  }`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={!pageInfo.hasNextPage || loading}
            className="anilist-btn-secondary px-3 py-2 min-h-[38px] text-xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            aria-label="Next Page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight aria-hidden="true" className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
};
