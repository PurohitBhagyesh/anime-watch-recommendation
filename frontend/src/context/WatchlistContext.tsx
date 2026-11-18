import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { AnimeCardData, WatchlistItem, WatchlistStatus } from '../api/types';
import { eventBus } from '../utils/pubsub';

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (anime: AnimeCardData, status: WatchlistStatus) => void;
  restoreWatchlistItem: (item: WatchlistItem) => void;
  removeFromWatchlist: (animeId: number) => void;
  updateStatus: (animeId: number, status: WatchlistStatus) => void;
  updateProgress: (animeId: number, episode: number) => void;
  updateRating: (animeId: number, rating: number) => void;
  getItem: (animeId: number) => WatchlistItem | undefined;
  isInWatchlist: (animeId: number) => boolean;
  clearWatchlist: () => void;
  exportWatchlist: () => void;
  importWatchlist: (jsonData: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'animesenpai_watchlist_v1';

function readStoredWatchlist(): WatchlistItem[] {
  try {
    const saved =
      localStorage.getItem(LOCAL_STORAGE_KEY) ||
      localStorage.getItem('anime_pulse_watchlist_v1');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load watchlist from localStorage', e);
    return [];
  }
}

function getSafeTitle(anime: AnimeCardData): string {
  return anime.title?.english || anime.title?.userPreferred || anime.title?.romaji || 'Anime';
}

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(readStoredWatchlist);
  const watchlistRef = useRef<WatchlistItem[]>(watchlist);
  const skipNextBroadcastRef = useRef(false);

  useEffect(() => {
    watchlistRef.current = watchlist;
  }, [watchlist]);

  // Persist locally & publish cross-tab sync event
  const persistAndBroadcast = useCallback((nextItems: WatchlistItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextItems));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }

    if (skipNextBroadcastRef.current) {
      skipNextBroadcastRef.current = false;
      return;
    }

    eventBus.publish(
      'watchlist:synced',
      { items: nextItems, source: 'broadcast' },
      { broadcast: true }
    );
  }, []);

  // Subscriber: receive real-time watchlist updates published by other open tabs
  useEffect(() => {
    const unsubscribeBroadcast = eventBus.subscribe('watchlist:synced', (payload, meta) => {
      if (!meta.isRemote) return;
      skipNextBroadcastRef.current = true;
      setWatchlist(payload.items);
    });

    const handleStorageFallback = (e: StorageEvent) => {
      if (e.key !== LOCAL_STORAGE_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          skipNextBroadcastRef.current = true;
          setWatchlist(parsed);
        }
      } catch {
        // Ignore malformed storage updates
      }
    };

    window.addEventListener('storage', handleStorageFallback);
    return () => {
      unsubscribeBroadcast();
      window.removeEventListener('storage', handleStorageFallback);
    };
  }, []);

  // Publisher: add or update item in watchlist
  const addToWatchlist = useCallback(
    (anime: AnimeCardData, status: WatchlistStatus) => {
      const prev = watchlistRef.current;
      const existing = prev.find((item) => item.anime.id === anime.id);
      const now = new Date().toISOString();

      let next: WatchlistItem[];
      let savedItem: WatchlistItem;

      if (existing) {
        savedItem = { ...existing, status, updatedAt: now };
        next = prev.map((item) => (item.anime.id === anime.id ? savedItem : item));
      } else {
        savedItem = {
          anime,
          status,
          currentEpisode: 0,
          addedAt: now,
          updatedAt: now,
        };
        next = [savedItem, ...prev];
      }

      setWatchlist(next);
      persistAndBroadcast(next);
      eventBus.publish('watchlist:added', { item: savedItem, totalCount: next.length });
    },
    [persistAndBroadcast]
  );

  // Publisher: restore a previously removed item (for instant Undo)
  const restoreWatchlistItem = useCallback(
    (item: WatchlistItem) => {
      const prev = watchlistRef.current;
      if (prev.some((existing) => existing.anime.id === item.anime.id)) return;
      const next = [{ ...item, updatedAt: new Date().toISOString() }, ...prev];
      setWatchlist(next);
      persistAndBroadcast(next);
      eventBus.publish('watchlist:added', { item, totalCount: next.length });
    },
    [persistAndBroadcast]
  );

  // Publisher: remove item from watchlist
  const removeFromWatchlist = useCallback(
    (animeId: number) => {
      const prev = watchlistRef.current;
      const removed = prev.find((item) => item.anime.id === animeId);
      if (!removed) return;

      const next = prev.filter((item) => item.anime.id !== animeId);
      setWatchlist(next);
      persistAndBroadcast(next);
      eventBus.publish('watchlist:removed', { item: removed, totalCount: next.length });
    },
    [persistAndBroadcast]
  );

  // Publisher: change watching status
  const updateStatus = useCallback(
    (animeId: number, status: WatchlistStatus) => {
      const prev = watchlistRef.current;
      const target = prev.find((item) => item.anime.id === animeId);
      if (!target || target.status === status) return;

      const next = prev.map((item) =>
        item.anime.id === animeId
          ? {
              ...item,
              status,
              currentEpisode:
                status === 'completed' && item.anime.episodes
                  ? item.anime.episodes
                  : item.currentEpisode,
              updatedAt: new Date().toISOString(),
            }
          : item
      );

      setWatchlist(next);
      persistAndBroadcast(next);
      eventBus.publish('watchlist:status', {
        animeId,
        title: getSafeTitle(target.anime),
        previousStatus: target.status,
        status,
      });
    },
    [persistAndBroadcast]
  );

  // Publisher: update episode progress (auto-completes cleanly when reaching final episode)
  const updateProgress = useCallback(
    (animeId: number, episode: number) => {
      const prev = watchlistRef.current;
      const target = prev.find((item) => item.anime.id === animeId);
      if (!target) return;

      const totalEpisodes = target.anime.episodes ?? null;
      const clampedEpisode = Math.max(
        0,
        totalEpisodes ? Math.min(totalEpisodes, episode) : episode
      );
      if (clampedEpisode === (target.currentEpisode || 0)) return;

      const shouldAutoComplete =
        Boolean(totalEpisodes && clampedEpisode >= totalEpisodes) &&
        target.status !== 'completed' &&
        target.status !== 'rewatching';

      const nextStatus: WatchlistStatus = shouldAutoComplete ? 'completed' : target.status;

      const next = prev.map((item) =>
        item.anime.id === animeId
          ? {
              ...item,
              currentEpisode: clampedEpisode,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : item
      );

      setWatchlist(next);
      persistAndBroadcast(next);
      eventBus.publish('watchlist:progress', {
        animeId,
        title: getSafeTitle(target.anime),
        previousEpisode: target.currentEpisode || 0,
        currentEpisode: clampedEpisode,
        totalEpisodes,
        autoCompleted: shouldAutoComplete,
      });
    },
    [persistAndBroadcast]
  );

  // Publisher: update personal score (0..10)
  const updateRating = useCallback(
    (animeId: number, rating: number) => {
      const prev = watchlistRef.current;
      const target = prev.find((item) => item.anime.id === animeId);
      if (!target) return;

      const clamped = Math.max(0, Math.min(10, Math.round(rating)));
      const next = prev.map((item) =>
        item.anime.id === animeId
          ? { ...item, userRating: clamped, updatedAt: new Date().toISOString() }
          : item
      );

      setWatchlist(next);
      persistAndBroadcast(next);
      eventBus.publish('watchlist:rated', {
        animeId,
        title: getSafeTitle(target.anime),
        rating: clamped,
      });
    },
    [persistAndBroadcast]
  );

  const getItem = useCallback(
    (animeId: number) => watchlist.find((item) => item.anime.id === animeId),
    [watchlist]
  );

  const isInWatchlist = useCallback(
    (animeId: number) => watchlist.some((item) => item.anime.id === animeId),
    [watchlist]
  );

  // Publisher: clear entire list
  const clearWatchlist = useCallback(() => {
    const previousCount = watchlistRef.current.length;
    setWatchlist([]);
    persistAndBroadcast([]);
    eventBus.publish('watchlist:cleared', { previousCount });
  }, [persistAndBroadcast]);

  const exportWatchlist = useCallback(() => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(watchlistRef.current, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `animesenpai-watchlist-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, []);

  // Publisher: import backup JSON with item validation
  const importWatchlist = useCallback(
    (jsonData: string): boolean => {
      try {
        const parsed = JSON.parse(jsonData);
        if (!Array.isArray(parsed)) return false;

        const validItems = parsed.filter(
          (entry): entry is WatchlistItem =>
            Boolean(entry && typeof entry === 'object' && entry.anime && typeof entry.anime.id === 'number')
        );

        setWatchlist(validItems);
        persistAndBroadcast(validItems);
        eventBus.publish('watchlist:imported', { count: validItems.length });
        return true;
      } catch {
        return false;
      }
    },
    [persistAndBroadcast]
  );

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        restoreWatchlistItem,
        removeFromWatchlist,
        updateStatus,
        updateProgress,
        updateRating,
        getItem,
        isInWatchlist,
        clearWatchlist,
        exportWatchlist,
        importWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
