import React, { useState, useRef } from 'react';
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
  Heart,
  Compass,
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
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: string; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Bookmark },
    { id: 'watching', label: 'Watching', icon: Clock },
    { id: 'plan_to_watch', label: 'Plan to Watch', icon: Sparkles },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'favorite', label: 'Favorites', icon: Heart },
  ];

  const filteredItems = watchlist.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  // Calculate statistics from genuine user data
  const totalAnime = watchlist.length;
  const watchingCount = watchlist.filter((i) => i.status === 'watching').length;
  const totalEpisodesWatched = watchlist.reduce((sum, i) => sum + (i.currentEpisode || 0), 0);
  const ratedItems = watchlist.filter((i) => i.userRating && i.userRating > 0);
  const meanScore = ratedItems.length > 0
    ? (ratedItems.reduce((sum, i) => sum + (i.userRating || 0), 0) / ratedItems.length).toFixed(1)
    : 'None';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importWatchlist(content);
        if (success) {
          setImportMessage('Watchlist imported successfully.');
        } else {
          setImportMessage('Failed to import: Invalid JSON format.');
        }
        setTimeout(() => setImportMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personal Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage your anime library and episode progress stored locally on your device
          </p>
        </div>

        {/* Export & Import actions */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="apple-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
            title="Import JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-[#2997ff]" />
            <span>Import</span>
          </button>

          <button
            onClick={exportWatchlist}
            disabled={watchlist.length === 0}
            className="apple-btn-secondary flex items-center gap-1.5 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
            title="Export JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export</span>
          </button>

          {watchlist.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
                  clearWatchlist();
                }
              }}
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {importMessage && (
        <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/50 text-blue-200 text-xs font-medium">
          {importMessage}
        </div>
      )}

      {/* Real Stats Summary (Apple Glass Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 rounded-xl apple-card-static">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Total Anime
          </span>
          <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalAnime}</p>
        </div>

        <div className="p-3.5 rounded-xl apple-card-static">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Currently Watching
          </span>
          <p className="text-xl sm:text-2xl font-bold text-[#2997ff] mt-0.5">{watchingCount}</p>
        </div>

        <div className="p-3.5 rounded-xl apple-card-static">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Episodes Watched
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">
            {totalEpisodesWatched}
          </p>
        </div>

        <div className="p-3.5 rounded-xl apple-card-static">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Mean Score
          </span>
          <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">
            {meanScore !== 'None' ? `${meanScore} / 10` : 'None'}
          </p>
        </div>
      </div>

      {/* Apple Segmented Control Bar for Tabs */}
      <div className="apple-segmented-container flex flex-wrap gap-1">
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
              className={`apple-segmented-item flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${
                isActive ? 'active' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/[0.08] font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Watchlist Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const anime = item.anime;
            const title = anime.title.english || anime.title.romaji || anime.title.userPreferred;
            const maxEpisodes = anime.episodes || 9999;

            return (
              <div
                key={anime.id}
                className="flex gap-3 p-3 rounded-xl apple-card-static group"
              >
                {/* Poster */}
                <Link
                  to={`/anime/${anime.id}`}
                  className="w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden bg-[#0a0d14] flex-shrink-0 block relative"
                >
                  <img
                    src={anime.coverImage.large || anime.coverImage.medium}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  {anime.averageScore && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-bold text-amber-300">
                      {(anime.averageScore / 10).toFixed(1)}
                    </div>
                  )}
                </Link>

                {/* Details & Controls */}
                <div className="flex flex-col justify-between flex-1 min-w-0 space-y-1.5">
                  <div>
                    <Link
                      to={`/anime/${anime.id}`}
                      className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-[#2997ff] line-clamp-1 transition"
                      title={title}
                    >
                      {title}
                    </Link>
                    <p className="text-[11px] text-slate-400">
                      {anime.format?.replace('_', ' ')} · {anime.seasonYear || 'TBA'}
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(anime.id, e.target.value as WatchlistStatus)}
                      className="apple-input text-xs px-2 py-1 capitalize"
                    >
                      <option value="watching">Watching</option>
                      <option value="plan_to_watch">Plan to Watch</option>
                      <option value="completed">Completed</option>
                      <option value="favorite">Favorite</option>
                    </select>

                    <button
                      onClick={() => removeFromWatchlist(anime.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition ml-auto"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Episode Progress Counter */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.08]">
                    <span className="text-slate-400 font-medium">Episode:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateProgress(anime.id, Math.max(0, (item.currentEpisode || 0) - 1))
                        }
                        className="p-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10"
                        title="Decrement"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-[#2997ff] min-w-[2.5rem] text-center text-xs">
                        {item.currentEpisode || 0} / {anime.episodes || '??'}
                      </span>
                      <button
                        onClick={() =>
                          updateProgress(
                            anime.id,
                            Math.min(maxEpisodes, (item.currentEpisode || 0) + 1)
                          )
                        }
                        className="p-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10"
                        title="Increment"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Rating:</span>
                    <select
                      value={item.userRating || 0}
                      onChange={(e) => updateRating(anime.id, Number(e.target.value))}
                      className="apple-input text-xs px-2 py-0.5"
                    >
                      <option value="0">Unrated</option>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} / 10
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl apple-card-static text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Watchlist is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filterStatus === 'all'
              ? 'No anime saved to your watchlist yet. Browse trending titles to start your list.'
              : `No anime currently marked as "${filterStatus.replace('_', ' ')}".`}
          </p>
          <Link
            to="/discover"
            className="apple-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Catalog</span>
          </Link>
        </div>
      )}
    </div>
  );
};
