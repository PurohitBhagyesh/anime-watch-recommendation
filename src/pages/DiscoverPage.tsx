import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { searchAnime, GENRE_LIST, getCurrentSeason } from '../api/anilist';
import type { AnimeCardData, PageInfo } from '../api/types';
import { AnimeCard } from '../components/common/AnimeCard';
import { CardSkeleton } from '../components/common/Skeleton';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState<string>(searchParams.get('genre') || '');
  const [selectedFormat, setSelectedFormat] = useState<string>(searchParams.get('format') || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || '');
  const [selectedSeason, setSelectedSeason] = useState<string>(searchParams.get('season') || '');
  const [selectedYear, setSelectedYear] = useState<string>(searchParams.get('year') || '');
  const [selectedSort, setSelectedSort] = useState<string>(searchParams.get('sort') || 'TRENDING_DESC');
  const [currentPage, setCurrentPage] = useState<number>(Number(searchParams.get('page')) || 1);

  const [results, setResults] = useState<AnimeCardData[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
  }, [searchQuery, selectedGenre, selectedFormat, selectedStatus, selectedSeason, selectedYear, selectedSort, currentPage]);

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
      if (v !== undefined && v !== '' && !(k === 'page' && v === 1) && !(k === 'sort' && v === 'TRENDING_DESC')) {
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

  const yearsList = Array.from({ length: 35 }, (_, i) => (new Date().getFullYear() + 1 - i).toString());

  const hasActiveFilters = Boolean(
    searchQuery || selectedGenre || selectedFormat || selectedStatus || selectedSeason || selectedYear || selectedSort !== 'TRENDING_DESC'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Discover Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Filter by genre, broadcast schedule, format, or search keywords
          </p>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl apple-btn-secondary text-xs font-semibold"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#2997ff]" />
          <span>{showMobileFilters ? 'Hide Filters' : 'Filter Options'}</span>
        </button>
      </div>

      {/* Main Search & Filters Panel (Glassmorphic Material) */}
      <div className={`space-y-4 p-4 sm:p-5 rounded-2xl apple-card-static ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
        {/* Search Bar Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title (e.g. Solo Leveling, Frieren, Attack on Titan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="apple-input w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm placeholder-slate-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  updateFiltersInUrl({ search: '' });
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="apple-btn-primary px-5 py-2.5 text-xs sm:text-sm"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
          {/* Genre */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                updateFiltersInUrl({ genre: e.target.value });
              }}
              className="apple-input w-full text-xs px-2.5 py-2 cursor-pointer"
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
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                updateFiltersInUrl({ format: e.target.value });
              }}
              className="apple-input w-full text-xs px-2.5 py-2 cursor-pointer"
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

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                updateFiltersInUrl({ status: e.target.value });
              }}
              className="apple-input w-full text-xs px-2.5 py-2 cursor-pointer"
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
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Season
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(e.target.value);
                updateFiltersInUrl({ season: e.target.value });
              }}
              className="apple-input w-full text-xs px-2.5 py-2 cursor-pointer"
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
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                updateFiltersInUrl({ year: e.target.value });
              }}
              className="apple-input w-full text-xs px-2.5 py-2 cursor-pointer"
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
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Sort By
            </label>
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                updateFiltersInUrl({ sort: e.target.value });
              }}
              className="apple-input w-full text-xs px-2.5 py-2 cursor-pointer text-[#2997ff] font-semibold"
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
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5 text-[#2997ff]" /> Popular:
            </span>
            {['Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Comedy', 'Adventure', 'Sports'].map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => {
                  const val = selectedGenre === genre ? '' : genre;
                  setSelectedGenre(val);
                  updateFiltersInUrl({ genre: val });
                }}
                className={`text-xs px-2.5 py-1 rounded-lg transition ${
                  selectedGenre === genre
                    ? 'apple-btn-primary text-xs'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium ml-auto transition"
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
            'Loading anime...'
          ) : pageInfo ? (
            <span>
              <span className="text-white font-bold">{pageInfo.total.toLocaleString()}</span> titles found
            </span>
          ) : (
            'Results'
          )}
        </p>

        {pageInfo && pageInfo.lastPage > 1 && (
          <div className="text-xs text-slate-400">
            Page {pageInfo.currentPage} of {pageInfo.lastPage}
          </div>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl apple-card-static text-center space-y-3">
          <Search className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No anime found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No matching anime for the current filter criteria. Try adjusting your query or resetting filters.
          </p>
          <button
            onClick={resetAllFilters}
            className="apple-btn-primary px-4 py-2 text-xs"
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
            className="apple-btn-secondary flex items-center gap-1 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-mono text-slate-400">
            {currentPage} / {pageInfo.lastPage}
          </span>

          <button
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              updateFiltersInUrl({ page: newPage });
            }}
            disabled={!pageInfo.hasNextPage || loading}
            className="apple-btn-secondary flex items-center gap-1 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
