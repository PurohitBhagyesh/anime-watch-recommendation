import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  Search,
  RotateCcw,
  X,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import type { WatchlistItem, WatchlistStatus } from '../api/types';
import { eventBus } from '../utils/pubsub';
import { useSEO, SITE_URL } from '../utils/seo';

type SortOption = 'updated' | 'title' | 'score' | 'progress';

interface ActivityToast {
  id: number;
  text: string;
  tone: 'neutral' | 'success' | 'danger';
  undoItem?: WatchlistItem;
}

const STATUS_LABELS: Record<WatchlistStatus, string> = {
  watching: 'Watching',
  plan_to_watch: 'Planning',
  completed: 'Completed',
  rewatching: 'Rewatching',
  paused: 'Paused',
  dropped: 'Dropped',
  favorite: 'Favorite',
};

const STATUS_THEMES: Record<
  WatchlistStatus,
  { bg: string; text: string; dot: string }
> = {
  watching: {
    bg: 'bg-emerald-500/15 border-emerald-500/35',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  plan_to_watch: {
    bg: 'bg-sky-500/15 border-sky-500/35',
    text: 'text-sky-400',
    dot: 'bg-sky-400',
  },
  completed: {
    bg: 'bg-purple-500/15 border-purple-500/35',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
  },
  rewatching: {
    bg: 'bg-blue-500/15 border-blue-500/35',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  paused: {
    bg: 'bg-amber-500/15 border-amber-500/35',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  dropped: {
    bg: 'bg-rose-500/15 border-rose-500/35',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
  },
  favorite: {
    bg: 'bg-pink-500/15 border-pink-500/35',
    text: 'text-pink-400',
    dot: 'bg-pink-400',
  },
};

export const WatchlistPage: React.FC = () => {
  useSEO({
    title: 'My Watchlist • Anime Tracker | AnimeSenpai',
    description:
      'Track your anime episode progress, organize watching status, and manage your personal anime list on AnimeSenpai.',
    canonicalUrl: `${SITE_URL}/watchlist`,
  });

  const { user } = useAuth();
  const { getPreferredTitle } = usePreferences();

  const {
    watchlist,
    restoreWatchlistItem,
    removeFromWatchlist,
    updateStatus,
    updateProgress,
    updateRating,
    clearWatchlist,
    exportWatchlist,
    importWatchlist,
  } = useWatchlist();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [toast, setToast] = useState<ActivityToast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (next: Omit<ActivityToast, 'id'>, durationMs = 3400) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ ...next, id: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), durationMs);
  };

  // Pub/Sub Subscriber: listen to watchlist domain events & cross-tab broadcasts
  useEffect(() => {
    const unsubs = [
      eventBus.subscribe('watchlist:progress', (ev) => {
        showToast({
          text: ev.autoCompleted
            ? `Completed ${ev.title} (${ev.currentEpisode}/${ev.totalEpisodes ?? ev.currentEpisode})`
            : `${ev.title} · Episode ${ev.currentEpisode}${ev.totalEpisodes ? ` / ${ev.totalEpisodes}` : ''}`,
          tone: ev.autoCompleted ? 'success' : 'neutral',
        });
      }),
      eventBus.subscribe('watchlist:status', (ev) => {
        showToast({
          text: `${ev.title} moved to ${STATUS_LABELS[ev.status]}`,
          tone: ev.status === 'completed' ? 'success' : 'neutral',
        });
      }),
      eventBus.subscribe('watchlist:rated', (ev) => {
        showToast({
          text:
            ev.rating > 0
              ? `Rated ${ev.title} · ${ev.rating}/10`
              : `Cleared rating for ${ev.title}`,
          tone: 'neutral',
        });
      }),
      eventBus.subscribe('watchlist:removed', (ev) => {
        const title =
          ev.item.anime.title.english ||
          ev.item.anime.title.userPreferred ||
          ev.item.anime.title.romaji ||
          'Anime';
        showToast(
          {
            text: `Removed ${title}`,
            tone: 'danger',
            undoItem: ev.item,
          },
          5000
        );
      }),
      eventBus.subscribe('watchlist:imported', (ev) => {
        showToast({
          text: `Imported ${ev.count} ${ev.count === 1 ? 'title' : 'titles'}${
            ev.added !== undefined ? ` (${ev.added} added, ${ev.updated} updated)` : ''
          }.`,
          tone: 'success',
        });
      }),
      eventBus.subscribe('watchlist:exported', (ev) => {
        showToast({
          text: `Exported ${ev.count} ${ev.count === 1 ? 'title' : 'titles'} (${ev.filename}).`,
          tone: 'success',
        });
      }),
      eventBus.subscribe('watchlist:cleared', () => {
        showToast({
          text: 'Watchlist cleared.',
          tone: 'neutral',
        });
      }),
      eventBus.subscribe('watchlist:synced', (_ev, meta) => {
        if (!meta.isRemote) return;
        showToast({
          text: 'Watchlist synced live from another tab.',
          tone: 'success',
        });
      }),
    ];

    return () => {
      unsubs.forEach((fn) => fn());
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const tabs: { id: string; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Bookmark },
    { id: 'watching', label: 'Watching', icon: Clock },
    { id: 'plan_to_watch', label: 'Planning', icon: Sparkles },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'rewatching', label: 'Rewatching', icon: Repeat },
    { id: 'paused', label: 'Paused', icon: PauseCircle },
    { id: 'dropped', label: 'Dropped', icon: XCircle },
  ];

  const activeTab = tabs.find((t) => t.id === filterStatus) || tabs[0];
  const ActiveTabIcon = activeTab.icon;

  // Derived stats
  const totalAnime = watchlist.length;
  const watchingCount = watchlist.filter((i) => i.status === 'watching').length;
  const completedCount = watchlist.filter((i) => i.status === 'completed').length;
  const totalEpisodesWatched = watchlist.reduce(
    (sum, i) => sum + (i.currentEpisode || 0),
    0
  );
  const daysWatched = ((totalEpisodesWatched * 24) / 1440).toFixed(1);

  const ratedItems = useMemo(
    () => watchlist.filter((i) => i.userRating && i.userRating > 0),
    [watchlist]
  );

  const meanScore =
    ratedItems.length > 0
      ? (
          (ratedItems.reduce((sum, i) => sum + (i.userRating || 0), 0) /
            ratedItems.length) *
          10
        ).toFixed(0)
      : null;

  const scoreDistribution = useMemo(() => {
    const dist: Record<number, number> = {
      10: 0,
      9: 0,
      8: 0,
      7: 0,
      6: 0,
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    ratedItems.forEach((item) => {
      const r = item.userRating || 0;
      if (r >= 1 && r <= 10) dist[r] = (dist[r] || 0) + 1;
    });
    return dist;
  }, [ratedItems]);

  const maxScoreCount = Math.max(...Object.values(scoreDistribution), 1);

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

  // Filtered + sorted items
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = watchlist.filter((item) => {
      // When user is typing a search query, search across ALL statuses so the anime is immediately found!
      if (!q && filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (selectedGenre && !item.anime.genres?.includes(selectedGenre)) return false;
      if (q) {
        const preferred = getPreferredTitle(item.anime.title, '').toLowerCase();
        const english = (item.anime.title.english || '').toLowerCase();
        const romaji = (item.anime.title.romaji || '').toLowerCase();
        const userPref = (item.anime.title.userPreferred || '').toLowerCase();
        const native = (item.anime.title.native || '').toLowerCase();
        const genres = (item.anime.genres || []).join(' ').toLowerCase();
        const synonyms = ((item.anime as any).synonyms || []).join(' ').toLowerCase();

        const matches =
          preferred.includes(q) ||
          english.includes(q) ||
          romaji.includes(q) ||
          userPref.includes(q) ||
          native.includes(q) ||
          genres.includes(q) ||
          synonyms.includes(q);

        if (!matches) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'title') {
        return getPreferredTitle(a.anime.title, '').localeCompare(
          getPreferredTitle(b.anime.title, '')
        );
      }
      if (sortBy === 'score') {
        return (b.userRating || 0) - (a.userRating || 0);
      }
      if (sortBy === 'progress') {
        const pctA = a.anime.episodes ? (a.currentEpisode || 0) / a.anime.episodes : 0;
        const pctB = b.anime.episodes ? (b.currentEpisode || 0) / b.anime.episodes : 0;
        return pctB - pctA;
      }
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });
  }, [watchlist, filterStatus, selectedGenre, searchQuery, sortBy, getPreferredTitle]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importWatchlist(content);
        if (!ok) {
          showToast({ text: 'Failed to import: Invalid JSON backup file.', tone: 'danger' });
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!user && watchlist.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-24 space-y-6 animate-fadeIn flex flex-col items-center justify-center min-h-[60dvh] text-center min-w-0">
        <div className="w-16 h-16 bg-[#0c0c0f] rounded-2xl flex items-center justify-center border border-[#23232b] shadow-lg shadow-black/40">
          <Bookmark aria-hidden="true" className="w-7 h-7 text-[#f5f5f7]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f7] tracking-tight">
          Track Your Anime
        </h1>
        <p className="text-[#9a9aa6] max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
          Sign in to build your personal anime watchlist, track episode progress, rate series, and sync live across your phone, tablet, and PC.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
          <Link
            to="/login"
            className="anilist-btn-primary px-7 py-3 sm:py-2.5 text-xs sm:text-sm inline-flex items-center justify-center min-h-[44px]"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="anilist-btn-secondary px-7 py-3 sm:py-2.5 text-xs sm:text-sm inline-flex items-center justify-center min-h-[44px]"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 pb-24 sm:py-8 sm:pb-24 space-y-3.5 sm:space-y-5 animate-fadeIn min-w-0 overflow-x-hidden">
      {/* Guest Device Banner if not logged in */}
      {!user && watchlist.length > 0 && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#0c0c0f] border border-[#23232b] flex items-center justify-between gap-3 text-xs text-[#9a9aa6]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="truncate">
              Device Watchlist (saved on this browser). Sign in to sync across all devices.
            </span>
          </div>
          <Link
            to="/login"
            className="anilist-btn-primary px-3 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0 min-h-[32px] inline-flex items-center"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Header & Mobile-Optimized Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#23232b] w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#f5f5f7] tracking-[-0.03em] leading-tight">
              My Watchlist
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#16161b] border border-[#23232b] text-[#d2d2dc] tabular-nums">
              {totalAnime}
            </span>
          </div>
          <p className="text-xs text-[#9a9aa6] mt-0.5 hidden min-[400px]:block">
            Track episode progress, personal scores, and real-time synced status
          </p>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto min-w-0">
          {/* List / Grid View Switcher */}
          <div className="inline-flex items-center p-0.5 rounded-full bg-[#0c0c0f] border border-[#23232b] flex-shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="List view"
              aria-pressed={viewMode === 'table'}
              className={`p-2 rounded-full transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
                viewMode === 'table'
                  ? 'btn-accent-active'
                  : 'text-[#9a9aa6] hover:text-[#f5f5f7]'
              }`}
              title="List view"
            >
              <List aria-hidden="true" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={`p-2 rounded-full transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'btn-accent-active'
                  : 'text-[#9a9aa6] hover:text-[#f5f5f7]'
              }`}
              title="Grid view"
            >
              <LayoutGrid aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="anilist-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] text-xs font-semibold cursor-pointer"
              title="Import JSON backup"
              aria-label="Import JSON backup"
            >
              <Upload aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
              <span className="hidden min-[480px]:inline">Import</span>
            </button>

            <button
              type="button"
              onClick={exportWatchlist}
              disabled={watchlist.length === 0}
              className="anilist-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
              title="Export JSON backup"
              aria-label="Export JSON backup"
            >
              <Download aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
              <span className="hidden min-[480px]:inline">Export</span>
            </button>

            {watchlist.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear your entire watchlist?')) {
                    clearWatchlist();
                  }
                }}
                aria-label="Clear watchlist"
                className="w-9 h-9 rounded-full bg-[#0c0c0f] hover:bg-rose-500/15 text-[#9a9aa6] hover:text-rose-300 border border-[#23232b] hover:border-rose-500/35 transition flex items-center justify-center cursor-pointer flex-shrink-0"
                title="Clear all"
              >
                <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pub/Sub Live Activity Toast */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`px-3.5 py-2.5 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 animate-fadeIn ${
            toast.tone === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
              : toast.tone === 'danger'
              ? 'bg-rose-500/15 border-rose-500/35 text-rose-300'
              : 'bg-[#16161b] border-[#383844] text-[#f5f5f7]'
          }`}
        >
          <span className="truncate">{toast.text}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {toast.undoItem && (
              <button
                type="button"
                onClick={() => {
                  restoreWatchlistItem(toast.undoItem!);
                  setToast(null);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0c0c0f] border border-[#383844] text-[#f5f5f7] hover:bg-[#1e1e26] text-[11px] font-semibold transition cursor-pointer"
              >
                <RotateCcw aria-hidden="true" className="w-3 h-3" />
                <span>Undo</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="opacity-70 hover:opacity-100 cursor-pointer p-1"
            >
              <X aria-hidden="true" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* High-Contrast Mobile Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full min-w-0 tabular-nums">
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl anilist-card-static min-w-0">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9a9aa6] block truncate">
            Total Anime
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-[#f5f5f7] mt-0.5 leading-tight">
            {totalAnime}
          </p>
          <span className="text-[11px] text-[#9a9aa6] mt-1 block truncate">
            {completedCount} completed
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl anilist-card-static min-w-0">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9a9aa6] block truncate">
            Watching
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-[#f5f5f7] mt-0.5 leading-tight">
            {watchingCount}
          </p>
          <span className="text-[11px] text-[#9a9aa6] mt-1 block truncate">
            Active {watchingCount === 1 ? 'series' : 'series'}
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl anilist-card-static min-w-0">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9a9aa6] block truncate">
            Mean Score
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-[#f5f5f7] mt-0.5 leading-tight">
            {meanScore ? `${meanScore}%` : '—'}
          </p>
          <span className="text-[11px] text-[#9a9aa6] mt-1 block truncate">
            {ratedItems.length} {ratedItems.length === 1 ? 'rated' : 'rated'}
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl anilist-card-static min-w-0">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9a9aa6] block truncate">
            Watch Time
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-[#f5f5f7] mt-0.5 leading-tight">
            {daysWatched}
            <span className="text-xs font-medium text-[#9a9aa6] ml-1">days</span>
          </p>
          <span className="text-[11px] text-[#9a9aa6] mt-1 block truncate">
            {totalEpisodesWatched} {totalEpisodesWatched === 1 ? 'ep' : 'eps'}
          </span>
        </div>
      </div>

      {/* Analytics (Score Distribution & Top Genres) */}
      {(ratedItems.length > 0 || genreBreakdown.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ratedItems.length > 0 && (
            <div className="p-3.5 sm:p-5 rounded-2xl anilist-card-static space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#f5f5f7] flex items-center gap-2">
                  <BarChart3 aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                  Score Distribution
                </span>
                <span className="text-[11px] font-mono text-[#9a9aa6]">1–10 scale</span>
              </div>

              {/* Scroll-safe score distribution graph on narrow mobile */}
              <div className="overflow-x-auto no-scrollbar pb-1">
                <div className="grid grid-cols-10 gap-1.5 items-end h-20 pt-2 min-w-[280px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                    const count = scoreDistribution[score] || 0;
                    const barHeight = count > 0 ? Math.max(20, (count / maxScoreCount) * 100) : 6;
                    return (
                      <div
                        key={score}
                        className="flex flex-col items-center justify-end h-full gap-1"
                        title={`Score ${score}/10: ${count} anime`}
                      >
                        <span
                          className={`text-[10px] font-mono tabular-nums leading-none ${
                            count > 0 ? 'text-[#f5f5f7] font-semibold' : 'text-transparent select-none'
                          }`}
                        >
                          {count}
                        </span>
                        <div className="w-full flex justify-center items-end flex-1">
                          <div
                            className={`w-full max-w-[18px] rounded-t-md transition-all duration-300 ${
                              count > 0 ? 'bg-[#5360e6]' : 'bg-[#1c1c24]'
                            }`}
                            style={{ height: `${barHeight}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[#9a9aa6] tabular-nums leading-none">
                          {score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {genreBreakdown.length > 0 && (
            <div className="p-3.5 sm:p-5 rounded-2xl anilist-card-static space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#f5f5f7] flex items-center gap-2">
                  <Tag aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
                  Top List Genres
                </span>
                {selectedGenre && (
                  <button
                    type="button"
                    onClick={() => setSelectedGenre('')}
                    className="text-[11px] text-[#9a9aa6] hover:text-[#f5f5f7] cursor-pointer"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {genreBreakdown.map(([genre, count]) => {
                  const isActive = selectedGenre === genre;
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setSelectedGenre((prev) => (prev === genre ? '' : genre))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer min-h-[34px] ${
                        isActive
                          ? 'btn-accent-active'
                          : 'bg-[#16161b] hover:bg-[#1d1d24] border border-[#23232b] text-[#d2d2dc] hover:text-[#f5f5f7]'
                      }`}
                    >
                      <span>{genre}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums ${
                          isActive ? 'bg-black/25 text-white' : 'bg-[#0c0c0f] text-[#9a9aa6]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Filter: Mobile Options Menu (< sm) & Desktop Horizontal Status Tabs (>= sm) */}
      <div className="space-y-3 w-full min-w-0">
        {/* Mobile Status Options Menu (< 640px) */}
        <div className="sm:hidden w-full min-w-0">
          <div className="relative w-full">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
              <ActiveTabIcon aria-hidden="true" className="w-4 h-4 text-[#5360e6] flex-shrink-0" />
            </div>
            <select
              id="mobile-watchlist-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter watchlist by status"
              className="anilist-input w-full pl-10 pr-10 py-2.5 text-xs font-bold text-[#f5f5f7] appearance-none min-h-[44px] cursor-pointer bg-[#0c0c0f] border border-[#23232b] rounded-2xl focus:border-[#5360e6] shadow-sm"
            >
              {tabs.map((tab) => {
                const count =
                  tab.id === 'all'
                    ? watchlist.length
                    : watchlist.filter((i) => i.status === tab.id).length;
                return (
                  <option key={tab.id} value={tab.id} className="bg-[#121217] text-[#f5f5f7] py-2 font-medium">
                    {tab.label} ({count})
                  </option>
                );
              })}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="w-4 h-4 text-[#9a9aa6] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Desktop Horizontal Status Tabs (>= 640px) */}
        <div className="hidden sm:block w-full max-w-full min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar touch-scroll-smooth flex-wrap w-full max-w-full min-w-0 border-b border-[#23232b]">
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
                  type="button"
                  onClick={() => setFilterStatus(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition flex-shrink-0 whitespace-nowrap active:scale-95 cursor-pointer min-h-[38px] ${
                    isActive
                      ? 'btn-accent-active font-bold shadow-md'
                      : 'bg-[#0c0c0f] hover:bg-[#16161b] text-[#d2d2dc] hover:text-[#f5f5f7] border border-[#23232b]'
                  }`}
                >
                  <Icon aria-hidden="true" className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono tabular-nums leading-none ${
                      isActive ? 'bg-white/25 text-white font-bold' : 'bg-[#18181f] text-[#d2d2dc]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {watchlist.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full min-w-0">
            <div className="relative flex-1 sm:max-w-xs min-w-0">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles in list..."
                aria-label="Filter your watchlist"
                className="anilist-input w-full pl-9 pr-8 py-2.5 sm:py-2 text-sm sm:text-xs text-[#f5f5f7] placeholder:text-[#9a9aa6] min-h-[40px] sm:min-h-[36px]"
              />
              <Search
                aria-hidden="true"
                className="w-3.5 h-3.5 text-[#9a9aa6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#9a9aa6] hover:text-white cursor-pointer"
                >
                  <X aria-hidden="true" className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 min-w-0">
              <label htmlFor="watchlist-sort" className="text-xs text-[#9a9aa6] whitespace-nowrap">
                Sort by
              </label>
              <select
                id="watchlist-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="anilist-input px-3 py-2 text-xs font-semibold text-[#f5f5f7] min-h-[40px] sm:min-h-[36px] cursor-pointer transition-all duration-200 hover:border-[#383844] focus:border-[#5360e6]"
              >
                <option value="updated">Recently Updated</option>
                <option value="title">Title (A–Z)</option>
                <option value="score">Highest Rated</option>
                <option value="progress">Progress</option>
              </select>
            </div>
          </div>
        )}

        {/* Real-time search feedback badge */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between text-xs text-[#9a9aa6] px-1 py-0.5 animate-fadeIn">
            <span>
              Found <strong className="text-[#f5f5f7]">{filteredItems.length}</strong>{' '}
              {filteredItems.length === 1 ? 'title' : 'titles'} matching &ldquo;{searchQuery.trim()}&rdquo; across your library
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#5360e6] hover:underline cursor-pointer font-medium"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Watchlist Items */}
      {filteredItems.length > 0 ? (
        viewMode === 'table' ? (
          <div className="space-y-3 sm:space-y-2 w-full min-w-0 transition-opacity duration-300 animate-fadeIn">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#9a9aa6]">
              <span className="col-span-5">Anime</span>
              <span className="col-span-2 text-center">Score</span>
              <span className="col-span-2 text-center">Progress</span>
              <span className="col-span-3 text-right">Status</span>
            </div>

            {filteredItems.map((item) => {
              const anime = item.anime;
              const title = getPreferredTitle(anime.title, 'Anime');
              const currentEp = item.currentEpisode || 0;
              const totalEps = anime.episodes || null;
              const maxEpisodes = totalEps || 9999;
              const progressPct = totalEps
                ? Math.min(100, Math.round((currentEp / totalEps) * 100))
                : currentEp > 0
                ? 35
                : 0;
              const isCompleted = totalEps ? currentEp >= totalEps : false;
              const statusTheme = STATUS_THEMES[item.status] || STATUS_THEMES.watching;

              return (
                <div
                  key={anime.id}
                  className="rounded-2xl anilist-table-row transition-all duration-200 w-full min-w-0"
                >
                  {/* Mobile Layout (< 768px): Rich Native App Card */}
                  <div className="md:hidden p-3 sm:p-3.5 space-y-2.5 w-full min-w-0">
                    {/* Top Row: Poster, Title, Meta, Delete */}
                    <div className="flex items-start gap-2.5 sm:gap-3 w-full min-w-0">
                      <Link
                        to={`/anime/${anime.id}`}
                        className="w-16 min-[380px]:w-18 aspect-[185/265] rounded-xl overflow-hidden flex-shrink-0 bg-[#16161b] border border-[#23232b] shadow-md relative block active:scale-95 transition-transform"
                      >
                        <img
                          src={anime.coverImage.medium || anime.coverImage.large}
                          alt={title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </Link>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <Link
                            to={`/anime/${anime.id}`}
                            className="font-bold text-xs min-[380px]:text-sm text-[#f5f5f7] hover:text-[#5360e6] line-clamp-2 leading-snug transition-colors"
                            title={title}
                          >
                            {title}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromWatchlist(anime.id)}
                            className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 rounded-full text-[#9a9aa6] hover:text-rose-300 hover:bg-rose-500/15 transition flex items-center justify-center cursor-pointer flex-shrink-0"
                            title="Remove from list"
                            aria-label={`Remove ${title}`}
                          >
                            <Trash2 aria-hidden="true" className="w-3.5 h-3.5 min-[380px]:w-4 min-[380px]:h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] min-[380px]:text-[11px] text-[#9a9aa6]">
                          <span className="px-1.5 py-0.5 rounded-md bg-[#16161b] border border-[#23232b] text-[#d2d2dc] font-medium">
                            {anime.format?.replace('_', ' ') || 'Anime'}
                          </span>
                          <span>·</span>
                          <span>{anime.seasonYear || 'TBA'}</span>
                          <span>·</span>
                          <span>{totalEps ? `${totalEps} eps` : 'Airing'}</span>
                        </div>

                        {/* Status + Score Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusTheme.bg} ${statusTheme.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                            <span>{STATUS_LABELS[item.status]}</span>
                          </span>
                          {item.userRating && item.userRating > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 tabular-nums">
                              ★ {item.userRating}/10
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Progress Control Box */}
                    <div className="p-2.5 rounded-xl bg-[#131317] border border-[#23232b] space-y-2 w-full min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-semibold text-[#9a9aa6]">
                          Episode Progress
                        </span>
                        <span className="font-mono font-bold text-[#f5f5f7] text-xs tabular-nums">
                          {currentEp} / {totalEps ?? '—'}{' '}
                          <span className="text-[#9a9aa6] font-normal">
                            ({progressPct}%)
                          </span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-[#1e1e26] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-400' : 'bg-[#5360e6]'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Stepper + Status & Rating Dropdowns */}
                      <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 w-full min-w-0">
                        {/* Tactile +1 Quick Increment Pill */}
                        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-[#0c0c0f] border border-[#23232b] flex-shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              updateProgress(anime.id, Math.max(0, currentEp - 1))
                            }
                            aria-label={`Decrease episode for ${title}`}
                            className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 rounded-lg text-[#9a9aa6] hover:text-[#f5f5f7] hover:bg-[#1a1a20] flex items-center justify-center active:scale-90 transition cursor-pointer"
                          >
                            <Minus aria-hidden="true" className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateProgress(anime.id, Math.min(maxEpisodes, currentEp + 1))
                            }
                            aria-label={`Increase episode for ${title}`}
                            className="px-2 min-[380px]:px-2.5 h-7 min-[380px]:h-8 rounded-lg bg-[#5360e6] hover:bg-[#6470f2] text-white font-bold text-xs flex items-center gap-0.5 min-[380px]:gap-1 active:scale-95 transition shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            <Plus aria-hidden="true" className="w-3.5 h-3.5 stroke-[3]" />
                            <span>+1</span>
                          </button>
                        </div>

                        {/* Status Select */}
                        <div className="flex-1 min-w-0">
                          <select
                            value={item.status}
                            aria-label={`Watch status for ${title}`}
                            onChange={(e) =>
                              updateStatus(anime.id, e.target.value as WatchlistStatus)
                            }
                            className="anilist-input text-[11px] min-[380px]:text-xs px-2 min-[380px]:px-2.5 py-1.5 font-semibold text-[#f5f5f7] w-full min-h-[34px] min-[380px]:min-h-[38px] cursor-pointer"
                          >
                            <option value="watching">Watching</option>
                            <option value="plan_to_watch">Planning</option>
                            <option value="completed">Completed</option>
                            <option value="rewatching">Rewatching</option>
                            <option value="paused">Paused</option>
                            <option value="dropped">Dropped</option>
                          </select>
                        </div>

                        {/* Score Select */}
                        <div className="w-20 min-[380px]:w-24 min-w-0 flex-shrink-0">
                          <select
                            value={item.userRating || 0}
                            aria-label={`Rating for ${title}`}
                            onChange={(e) =>
                              updateRating(anime.id, Number(e.target.value))
                            }
                            className="anilist-input text-[11px] min-[380px]:text-xs px-1.5 min-[380px]:px-2 py-1.5 font-semibold text-[#f5f5f7] w-full min-h-[34px] min-[380px]:min-h-[38px] cursor-pointer"
                          >
                            <option value="0">Score</option>
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                              <option key={r} value={r}>
                                ★ {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table Row (>= 768px) */}
                  <div className="hidden md:grid md:grid-cols-12 gap-3 items-center p-3.5">
                    <div className="flex items-center gap-3.5 col-span-5 min-w-0">
                      <Link
                        to={`/anime/${anime.id}`}
                        className="w-11 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0 bg-[#16161b] border border-[#23232b]"
                      >
                        <img
                          src={anime.coverImage.medium || anime.coverImage.large}
                          alt={title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </Link>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Link
                          to={`/anime/${anime.id}`}
                          className="font-semibold text-sm text-[#f5f5f7] hover:underline truncate block"
                          title={title}
                        >
                          {title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-[#9a9aa6]">
                          <span>{anime.format?.replace('_', ' ') || 'Anime'}</span>
                          <span>·</span>
                          <span>{anime.seasonYear || 'TBA'}</span>
                          <span>·</span>
                          <span>{totalEps ? `${totalEps} eps` : 'Airing'}</span>
                        </div>
                        <div className="w-full max-w-[220px] h-1 rounded-full bg-[#1e1e26] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-400' : 'bg-[#5360e6]'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center col-span-2">
                      <select
                        value={item.userRating || 0}
                        aria-label={`Rating for ${title}`}
                        onChange={(e) => updateRating(anime.id, Number(e.target.value))}
                        className="anilist-input text-xs px-2.5 py-1.5 font-medium text-[#f5f5f7] cursor-pointer"
                      >
                        <option value="0">Unrated</option>
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            ★ {r} / 10
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 col-span-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateProgress(anime.id, Math.max(0, currentEp - 1))
                        }
                        aria-label={`Decrease episode for ${title}`}
                        className="w-7 h-7 rounded-full bg-[#16161b] hover:bg-[#1d1d24] text-[#f5f5f7] border border-[#23232b] flex items-center justify-center active:scale-95 transition cursor-pointer"
                        title="Previous episode"
                      >
                        <Minus aria-hidden="true" className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-semibold text-[#f5f5f7] min-w-[3.5rem] text-center text-xs tabular-nums">
                        {currentEp} / {totalEps ?? '—'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateProgress(anime.id, Math.min(maxEpisodes, currentEp + 1))
                        }
                        aria-label={`Increase episode for ${title}`}
                        className="w-7 h-7 rounded-full bg-[#16161b] hover:bg-[#1d1d24] text-[#f5f5f7] border border-[#23232b] flex items-center justify-center active:scale-95 transition cursor-pointer"
                        title="Next episode"
                      >
                        <Plus aria-hidden="true" className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-2 col-span-3">
                      <select
                        value={item.status}
                        aria-label={`Watch status for ${title}`}
                        onChange={(e) =>
                          updateStatus(anime.id, e.target.value as WatchlistStatus)
                        }
                        className="anilist-input text-xs px-2.5 py-1.5 font-medium text-[#f5f5f7] cursor-pointer"
                      >
                        <option value="watching">Watching</option>
                        <option value="plan_to_watch">Planning</option>
                        <option value="completed">Completed</option>
                        <option value="rewatching">Rewatching</option>
                        <option value="paused">Paused</option>
                        <option value="dropped">Dropped</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => removeFromWatchlist(anime.id)}
                        className="w-8 h-8 rounded-full text-[#9a9aa6] hover:text-rose-300 hover:bg-rose-500/15 transition flex items-center justify-center cursor-pointer flex-shrink-0"
                        title="Remove"
                        aria-label={`Remove ${title}`}
                      >
                        <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Mobile-Optimized Grid View (2-col mobile, 3-4 col desktop) */
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
            {filteredItems.map((item) => {
              const anime = item.anime;
              const title = getPreferredTitle(anime.title, 'Anime');
              const currentEp = item.currentEpisode || 0;
              const totalEps = anime.episodes || null;
              const maxEpisodes = totalEps || 9999;
              const progressPct = totalEps
                ? Math.min(100, Math.round((currentEp / totalEps) * 100))
                : currentEp > 0
                ? 35
                : 0;
              const isCompleted = totalEps ? currentEp >= totalEps : false;
              const statusTheme = STATUS_THEMES[item.status] || STATUS_THEMES.watching;

              return (
                <div
                  key={anime.id}
                  className="flex flex-col bg-[#0c0c0f] rounded-2xl overflow-hidden border border-[#23232b] hover:border-[#383844] transition-all group"
                >
                  {/* Poster Image with Status + Score + Stepper Overlays */}
                  <div className="relative aspect-[185/265] w-full bg-[#16161b] overflow-hidden">
                    <Link to={`/anime/${anime.id}`} className="block w-full h-full">
                      <img
                        src={anime.coverImage.large || anime.coverImage.medium}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>

                    {/* Top Status & Score badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] min-[400px]:text-[10px] font-bold border backdrop-blur-md ${statusTheme.bg} ${statusTheme.text} truncate max-w-[65%]`}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                      {item.userRating && item.userRating > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] min-[400px]:text-[10px] font-bold bg-black/85 text-amber-400 border border-amber-500/30 backdrop-blur-md tabular-nums flex-shrink-0">
                          ★ {item.userRating}
                        </span>
                      ) : null}
                    </div>

                    {/* Bottom Floating Episode Overlay + Quick +1 Button */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-auto">
                      <span className="px-2 py-1 rounded-lg bg-black/85 border border-white/15 text-white text-[10px] min-[400px]:text-[11px] font-mono font-bold backdrop-blur-md tabular-nums">
                        {currentEp}/{totalEps ?? '—'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateProgress(anime.id, Math.min(maxEpisodes, currentEp + 1))
                        }
                        aria-label={`Increase episode for ${title}`}
                        className="w-7 h-7 rounded-lg bg-[#5360e6] hover:bg-[#6470f2] active:scale-90 text-white font-bold flex items-center justify-center shadow-lg transition cursor-pointer"
                        title="Next episode"
                      >
                        <Plus aria-hidden="true" className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* Info Body */}
                  <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-2">
                    <div>
                      <Link
                        to={`/anime/${anime.id}`}
                        className="font-bold text-xs sm:text-sm text-[#f5f5f7] line-clamp-2 hover:text-[#5360e6] leading-snug transition-colors"
                        title={title}
                      >
                        {title}
                      </Link>
                      <p className="text-[10px] sm:text-[11px] text-[#9a9aa6] mt-0.5 truncate">
                        {anime.format?.replace('_', ' ') || 'Anime'} · {anime.seasonYear || 'TBA'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 rounded-full bg-[#1e1e26] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-[#5360e6]'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Controls row */}
                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#23232b]">
                      <select
                        value={item.status}
                        aria-label={`Status for ${title}`}
                        onChange={(e) =>
                          updateStatus(anime.id, e.target.value as WatchlistStatus)
                        }
                        className="anilist-input text-[10px] sm:text-[11px] px-2 py-1 font-semibold text-[#f5f5f7] flex-1 min-w-0"
                      >
                        <option value="watching">Watching</option>
                        <option value="plan_to_watch">Planning</option>
                        <option value="completed">Completed</option>
                        <option value="rewatching">Rewatching</option>
                        <option value="paused">Paused</option>
                        <option value="dropped">Dropped</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeFromWatchlist(anime.id)}
                        className="w-7 h-7 rounded-lg text-[#9a9aa6] hover:text-rose-300 hover:bg-rose-500/15 transition flex items-center justify-center cursor-pointer flex-shrink-0"
                        title="Remove from list"
                        aria-label={`Remove ${title}`}
                      >
                        <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="w-full max-w-full min-w-0 p-8 sm:p-12 rounded-2xl anilist-card-static text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#16161b] border border-[#23232b] flex items-center justify-center text-[#9a9aa6] mx-auto shadow-inner">
            <Bookmark aria-hidden="true" className="w-6 h-6 text-[#9a9aa6]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#f5f5f7]">
            {watchlist.length === 0 ? 'Your watchlist is empty' : 'No matching titles'}
          </h3>
          <p className="text-xs text-[#9a9aa6] max-w-sm mx-auto leading-relaxed">
            {watchlist.length === 0
              ? 'Explore trending or seasonal anime to start tracking your progress.'
              : 'Try clearing your active status, genre, or search filter.'}
          </p>
          {watchlist.length === 0 ? (
            <Link
              to="/discover"
              className="anilist-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full min-h-[40px] mt-1"
            >
              <Compass aria-hidden="true" className="w-3.5 h-3.5" />
              <span>Browse Catalog</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all');
                setSelectedGenre('');
                setSearchQuery('');
              }}
              className="anilist-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full min-h-[40px] mt-1 cursor-pointer"
            >
              <RotateCcw aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
