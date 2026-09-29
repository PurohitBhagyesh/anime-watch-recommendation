import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Sparkles,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Compass,
  Repeat,
  PauseCircle,
  XCircle,
  LayoutGrid,
  List,
  BarChart3,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import type { WatchlistStatus } from '../api/types';

export const WatchlistPage: React.FC = () => {
  const {
    watchlist,
    removeFromWatchlist,
    updateStatus,
    updateProgress,
    updateRating,
    clearWatchlist,
    exportWatchlist,
    importWatchlist,
  } = useWatchlist();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: string; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Bookmark },
    { id: 'watching', label: 'Watching', icon: Clock },
    { id: 'plan_to_watch', label: 'Planning', icon: Sparkles },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'rewatching', label: 'Rewatching', icon: Repeat },
    { id: 'paused', label: 'Paused', icon: PauseCircle },
    { id: 'dropped', label: 'Dropped', icon: XCircle },
  ];

  const filteredItems = watchlist.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  // Calculate detailed stats
  const totalAnime = watchlist.length;
  const watchingCount = watchlist.filter((i) => i.status === 'watching').length;
  const completedCount = watchlist.filter((i) => i.status === 'completed').length;
  const totalEpisodesWatched = watchlist.reduce(
    (sum, i) => sum + (i.currentEpisode || 0),
    0
  );
  const daysWatched = ((totalEpisodesWatched * 24) / 1440).toFixed(1);

  const ratedItems = watchlist.filter((i) => i.userRating && i.userRating > 0);
  const meanScore =
    ratedItems.length > 0
      ? (
          (ratedItems.reduce((sum, i) => sum + (i.userRating || 0), 0) /
            ratedItems.length) *
          10
        ).toFixed(0)
      : 'None';

  // Score distribution 1 to 10
  const scoreDistribution = useMemo(() => {
    const dist: Record<number, number> = { 10: 0, 9: 0, 8: 0, 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratedItems.forEach((item) => {
      const r = item.userRating || 0;
      if (r >= 1 && r <= 10) dist[r] = (dist[r] || 0) + 1;
    });
    return dist;
  }, [ratedItems]);

  const maxScoreCount = Math.max(...Object.values(scoreDistribution), 1);

  // Genre breakdown from watchlist
  const genreBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    watchlist.forEach((item) => {
      item.anime.genres?.forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [watchlist]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importWatchlist(content);
        if (success) {
          setImportMessage('Watchlist imported successfully!');
        } else {
          setImportMessage('Failed to import: Invalid JSON format.');
        }
        setTimeout(() => setImportMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getScoreBadgeClass = (score: number | null | undefined) => {
    if (!score) return '';
    if (score >= 75) return 'score-pill-high';
    if (score >= 60) return 'score-pill-med';
    return 'score-pill-low';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#edf1f5] tracking-tight">
            My Anime List
          </h1>
          <p className="text-xs sm:text-sm text-[#8ba0b2] mt-0.5">
            Track your watching progress, scores, and anime collection
          </p>
        </div>

        {/* View Mode Toggle & Export/Import actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded bg-[#151f2e] border border-white/10 mr-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-[#3db4f2] text-white shadow-sm'
                  : 'text-[#8ba0b2] hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-[#3db4f2] text-white shadow-sm'
                  : 'text-[#8ba0b2] hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="anilist-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-white/10"
            title="Import JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-[#3db4f2]" />
            <span>Import</span>
          </button>

          <button
            onClick={exportWatchlist}
            disabled={watchlist.length === 0}
            className="anilist-btn-secondary flex items-center gap-1.5 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold border border-white/10"
            title="Export JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-[#8ba0b2]" />
            <span>Export</span>
          </button>

          {watchlist.length > 0 && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to clear your entire anime list?'
                  )
                ) {
                  clearWatchlist();
                }
              }}
              className="p-1.5 rounded bg-[#151f2e] hover:bg-[#e85d75]/20 text-[#8ba0b2] hover:text-[#e85d75] border border-white/10 transition"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {importMessage && (
        <div className="p-3 rounded bg-[#3db4f2]/15 border border-[#3db4f2]/30 text-[#3db4f2] text-xs font-bold animate-fadeIn">
          {importMessage}
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl anilist-card-static">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8ba0b2]">
            Total Anime
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-[#edf1f5] mt-1">
            {totalAnime}
          </p>
          <span className="text-[10px] text-[#8ba0b2]">
            {completedCount} Completed
          </span>
        </div>

        <div className="p-4 rounded-xl anilist-card-static">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8ba0b2]">
            Days Watched
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-[#3db4f2] mt-1">
            {daysWatched} <span className="text-xs font-normal text-[#8ba0b2]">days</span>
          </p>
          <span className="text-[10px] text-[#8ba0b2]">
            {totalEpisodesWatched} Episodes total
          </span>
        </div>

        <div className="p-4 rounded-xl anilist-card-static">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8ba0b2]">
            Mean Score
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-[#7bd555] mt-1">
            {meanScore !== 'None' ? `${meanScore}%` : '—'}
          </p>
          <span className="text-[10px] text-[#8ba0b2]">
            {ratedItems.length} Rated titles
          </span>
        </div>

        <div className="p-4 rounded-xl anilist-card-static">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8ba0b2]">
            Currently Watching
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-[#e4a834] mt-1">
            {watchingCount}
          </p>
          <span className="text-[10px] text-[#8ba0b2]">Active series</span>
        </div>
      </div>

      {/* Score Distribution & Top Genres Mini Analytics */}
      {ratedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Score distribution bars */}
          <div className="p-4 rounded-xl anilist-card-static space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#edf1f5] flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#3db4f2]" /> Score Distribution
              </span>
              <span className="text-[10px] text-[#8ba0b2]">Scores 1-10</span>
            </div>
            <div className="flex items-end gap-1.5 h-16 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                const count = scoreDistribution[score] || 0;
                const heightPercent = count > 0 ? (count / maxScoreCount) * 100 : 4;
                return (
                  <div key={score} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                    <div
                      className={`w-full rounded-t transition-all ${
                        count > 0 ? 'bg-[#3db4f2] group-hover:bg-[#2ba2e0]' : 'bg-white/5'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`Score ${score}: ${count} anime`}
                    />
                    <span className="text-[9px] font-mono text-[#8ba0b2]">{score}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Genres Breakdown */}
          {genreBreakdown.length > 0 && (
            <div className="p-4 rounded-xl anilist-card-static space-y-2">
              <span className="text-xs font-bold uppercase text-[#edf1f5] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#e4a834]" /> Top List Genres
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {genreBreakdown.map(([genre, count]) => (
                  <div
                    key={genre}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1622] border border-white/10 text-xs"
                  >
                    <span className="font-semibold text-[#edf1f5]">{genre}</span>
                    <span className="text-[10px] font-mono text-[#3db4f2] px-1.5 py-0.2 rounded bg-[#3db4f2]/15 font-bold">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Filter Tabs (Horizontally swipeable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar touch-scroll-smooth flex-nowrap sm:flex-wrap border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.id === 'all'
              ? watchlist.length
              : watchlist.filter((i) => i.status === tab.id).length;
          const isActive = filterStatus === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition flex-shrink-0 whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'anilist-btn-primary'
                  : 'bg-[#151f2e] hover:bg-[#1f2c3f] text-[#edf1f5] border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded bg-black/40 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Watchlist Content */}
      {filteredItems.length > 0 ? (
        viewMode === 'table' ? (
          /* Responsive Table View (Card stack on mobile, 12-col table on tablet & desktop) */
          <div className="space-y-2 sm:space-y-1.5">
            {/* Desktop Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] uppercase font-bold text-[#8ba0b2]">
              <span className="col-span-6">Anime Title</span>
              <span className="col-span-2 text-center">Score</span>
              <span className="col-span-2 text-center">Progress</span>
              <span className="col-span-2 text-right">Status</span>
            </div>

            {filteredItems.map((item) => {
              const anime = item.anime;
              const title =
                anime.title.userPreferred || anime.title.english || anime.title.romaji;
              const maxEpisodes = anime.episodes || 9999;

              return (
                <div
                  key={anime.id}
                  className="p-3 sm:p-3 rounded-xl anilist-table-row border border-white/5 sm:border-transparent"
                >
                  {/* Mobile Layout (< 640px) */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/anime/${anime.id}`}
                        className="w-12 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-[#0b1622] shadow-sm"
                      >
                        <img
                          src={anime.coverImage.medium || anime.coverImage.large}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/anime/${anime.id}`}
                          className="font-bold text-xs text-[#edf1f5] hover:text-[#3db4f2] line-clamp-1 block"
                          title={title}
                        >
                          {title}
                        </Link>
                        <p className="text-[11px] text-[#8ba0b2] mt-0.5">
                          {anime.format?.replace('_', ' ') || 'Anime'} · {anime.seasonYear || 'TBA'} ·{' '}
                          {anime.episodes ? `${anime.episodes} eps` : 'Airing'}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromWatchlist(anime.id)}
                        className="p-1.5 rounded-lg text-[#8ba0b2] hover:text-[#e85d75] hover:bg-[#e85d75]/15 transition"
                        title="Remove from list"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile Controls Row */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 items-center">
                      {/* Status */}
                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateStatus(anime.id, e.target.value as WatchlistStatus)
                        }
                        className="anilist-input text-[11px] px-2 py-1 font-semibold capitalize w-full"
                      >
                        <option value="watching">Watching</option>
                        <option value="plan_to_watch">Planning</option>
                        <option value="completed">Completed</option>
                        <option value="rewatching">Rewatching</option>
                        <option value="paused">Paused</option>
                        <option value="dropped">Dropped</option>
                      </select>

                      {/* Episode Counter */}
                      <div className="flex items-center justify-center gap-1 bg-[#0b1622] py-0.5 px-1 rounded-lg border border-white/5">
                        <button
                          onClick={() =>
                            updateProgress(
                              anime.id,
                              Math.max(0, (item.currentEpisode || 0) - 1)
                            )
                          }
                          className="p-1 text-[#edf1f5] hover:text-[#3db4f2]"
                          title="Minus episode"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-[#3db4f2] text-[11px] min-w-[2.2rem] text-center">
                          {item.currentEpisode || 0}/{anime.episodes || '??'}
                        </span>
                        <button
                          onClick={() =>
                            updateProgress(
                              anime.id,
                              Math.min(maxEpisodes, (item.currentEpisode || 0) + 1)
                            )
                          }
                          className="p-1 text-[#edf1f5] hover:text-[#3db4f2]"
                          title="Plus episode"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Rating */}
                      <select
                        value={item.userRating || 0}
                        onChange={(e) => updateRating(anime.id, Number(e.target.value))}
                        className="anilist-input text-[11px] px-1.5 py-1 font-bold text-[#e4a834] w-full text-center"
                      >
                        <option value="0">★ Unrated</option>
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            ★ {r}/10
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tablet & Desktop Layout (>= 640px) */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                    {/* Title & Cover */}
                    <div className="flex items-center gap-3 col-span-6 min-w-0">
                      <Link
                        to={`/anime/${anime.id}`}
                        className="w-10 sm:w-12 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-[#0b1622]"
                      >
                        <img
                          src={anime.coverImage.medium || anime.coverImage.large}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/anime/${anime.id}`}
                          className="font-semibold text-xs sm:text-sm text-[#edf1f5] hover:text-[#3db4f2] truncate block"
                          title={title}
                        >
                          {title}
                        </Link>
                        <p className="text-[10px] text-[#8ba0b2] mt-0.5">
                          {anime.format?.replace('_', ' ') || 'Anime'} · {anime.seasonYear || 'TBA'} ·{' '}
                          {anime.episodes ? `${anime.episodes} eps` : 'Airing'}
                        </p>
                      </div>
                    </div>

                    {/* Personal Rating */}
                    <div className="flex items-center justify-center col-span-2">
                      <select
                        value={item.userRating || 0}
                        onChange={(e) => updateRating(anime.id, Number(e.target.value))}
                        className="anilist-input text-xs px-2 py-1 font-bold text-[#e4a834]"
                      >
                        <option value="0">Unrated</option>
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            {r} / 10 ({r * 10}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Episode Progress Counter */}
                    <div className="flex items-center justify-center gap-1.5 col-span-2">
                      <button
                        onClick={() =>
                          updateProgress(
                            anime.id,
                            Math.max(0, (item.currentEpisode || 0) - 1)
                          )
                        }
                        className="p-1 rounded bg-[#0b1622] hover:bg-[#1f2c3f] text-[#edf1f5] border border-white/10"
                        title="Decrement"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-[#3db4f2] min-w-[3rem] text-center text-xs">
                        {item.currentEpisode || 0} / {anime.episodes || '??'}
                      </span>
                      <button
                        onClick={() =>
                          updateProgress(
                            anime.id,
                            Math.min(maxEpisodes, (item.currentEpisode || 0) + 1)
                          )
                        }
                        className="p-1 rounded bg-[#0b1622] hover:bg-[#1f2c3f] text-[#edf1f5] border border-white/10"
                        title="Increment"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Status & Delete */}
                    <div className="flex items-center justify-end gap-2 col-span-2">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateStatus(anime.id, e.target.value as WatchlistStatus)
                        }
                        className="anilist-input text-xs px-2 py-1 font-semibold capitalize"
                      >
                        <option value="watching">Watching</option>
                        <option value="plan_to_watch">Planning</option>
                        <option value="completed">Completed</option>
                        <option value="rewatching">Rewatching</option>
                        <option value="paused">Paused</option>
                        <option value="dropped">Dropped</option>
                      </select>

                      <button
                        onClick={() => removeFromWatchlist(anime.id)}
                        className="p-1.5 rounded text-[#8ba0b2] hover:text-[#e85d75] hover:bg-[#e85d75]/15 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const anime = item.anime;
              const title =
                anime.title.userPreferred || anime.title.english || anime.title.romaji;
              const maxEpisodes = anime.episodes || 9999;

              return (
                <div
                  key={anime.id}
                  className="flex gap-3 p-3 rounded-lg anilist-card-static group"
                >
                  {/* Poster */}
                  <Link
                    to={`/anime/${anime.id}`}
                    className="w-20 sm:w-24 aspect-[185/265] rounded overflow-hidden bg-[#0b1622] flex-shrink-0 block relative"
                  >
                    <img
                      src={anime.coverImage.large || anime.coverImage.medium}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {anime.averageScore && (
                      <div
                        className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${getScoreBadgeClass(
                          anime.averageScore
                        )}`}
                      >
                        {anime.averageScore}%
                      </div>
                    )}
                  </Link>

                  {/* Details & Controls */}
                  <div className="flex flex-col justify-between flex-1 min-w-0 space-y-1.5">
                    <div>
                      <Link
                        to={`/anime/${anime.id}`}
                        className="font-semibold text-xs sm:text-sm text-[#edf1f5] group-hover:text-[#3db4f2] line-clamp-1 transition"
                        title={title}
                      >
                        {title}
                      </Link>
                      <p className="text-[11px] text-[#8ba0b2]">
                        {anime.format?.replace('_', ' ')} · {anime.seasonYear || 'TBA'}
                      </p>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateStatus(anime.id, e.target.value as WatchlistStatus)
                        }
                        className="anilist-input text-xs px-2 py-0.5 font-semibold capitalize flex-1"
                      >
                        <option value="watching">Watching</option>
                        <option value="plan_to_watch">Planning</option>
                        <option value="completed">Completed</option>
                        <option value="rewatching">Rewatching</option>
                        <option value="paused">Paused</option>
                        <option value="dropped">Dropped</option>
                      </select>

                      <button
                        onClick={() => removeFromWatchlist(anime.id)}
                        className="p-1 rounded text-[#8ba0b2] hover:text-[#e85d75] hover:bg-[#e85d75]/15 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Episode Progress Counter */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                      <span className="text-[#8ba0b2]">Episode:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateProgress(
                              anime.id,
                              Math.max(0, (item.currentEpisode || 0) - 1)
                            )
                          }
                          className="p-1 rounded bg-[#0b1622] hover:bg-[#1f2c3f] text-[#edf1f5] border border-white/10"
                          title="Decrement"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-[#3db4f2] min-w-[2.5rem] text-center text-xs">
                          {item.currentEpisode || 0} / {anime.episodes || '??'}
                        </span>
                        <button
                          onClick={() =>
                            updateProgress(
                              anime.id,
                              Math.min(maxEpisodes, (item.currentEpisode || 0) + 1)
                            )
                          }
                          className="p-1 rounded bg-[#0b1622] hover:bg-[#1f2c3f] text-[#edf1f5] border border-white/10"
                          title="Increment"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Rating Selector */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8ba0b2]">Rating:</span>
                      <select
                        value={item.userRating || 0}
                        onChange={(e) => updateRating(anime.id, Number(e.target.value))}
                        className="anilist-input text-xs px-1.5 py-0.5 font-bold text-[#e4a834]"
                      >
                        <option value="0">Unrated</option>
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            {r} / 10 ({r * 10}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="p-12 rounded-xl anilist-card-static text-center space-y-3">
          <Bookmark className="w-10 h-10 text-[#8ba0b2] mx-auto" />
          <h3 className="text-base font-bold text-[#edf1f5]">List is empty</h3>
          <p className="text-xs text-[#8ba0b2] max-w-sm mx-auto">
            {filterStatus === 'all'
              ? 'No anime saved in your list yet. Explore trending anime or search titles to build your list.'
              : `No anime currently marked as "${filterStatus.replace('_', ' ')}".`}
          </p>
          <Link
            to="/discover"
            className="anilist-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Anime</span>
          </Link>
        </div>
      )}
    </div>
  );
};
