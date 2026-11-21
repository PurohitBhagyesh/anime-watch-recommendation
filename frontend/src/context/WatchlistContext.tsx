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

// Helper to normalize anime status across variations (AniList/MAL/AnimeSenpai)
function normalizeStatus(raw: unknown): WatchlistStatus {
  if (typeof raw !== 'string') return 'watching';
  const s = raw.toLowerCase().trim();
  if (s === 'current' || s === 'watching') return 'watching';
  if (s === 'planning' || s === 'plan_to_watch' || s === 'plantowatch') return 'plan_to_watch';
  if (s === 'completed') return 'completed';
  if (s === 'repeating' || s === 'rewatching') return 'rewatching';
  if (s === 'paused') return 'paused';
  if (s === 'dropped') return 'dropped';
  if (s === 'favorite' || s === 'favourites') return 'favorite';
  return 'watching';
}

function readStoredWatchlist(): WatchlistItem[] {
  try {
    const saved =
      localStorage.getItem(LOCAL_STORAGE_KEY) ||
      localStorage.getItem('anime_pulse_watchlist_v1');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    const sanitized: WatchlistItem[] = [];
    for (const raw of parsed) {
      if (!raw || typeof raw !== 'object') continue;
      const animeData = (raw as any).anime || (typeof (raw as any).id === 'number' ? raw : null);
      if (!animeData) continue;
      const id = typeof animeData.id === 'number' ? animeData.id : typeof (raw as any).id === 'number' ? (raw as any).id : 0;
      if (!id) continue;

      const titleObj = animeData.title || {};
      const romaji = typeof titleObj === 'string' ? titleObj : titleObj.romaji || titleObj.userPreferred || titleObj.english || 'Anime';
      const english = typeof titleObj === 'string' ? titleObj : titleObj.english || titleObj.userPreferred || titleObj.romaji || 'Anime';
      const cover = animeData.coverImage || {};
      const mediumCover = typeof cover === 'string' ? cover : cover.medium || cover.large || cover.extraLarge || '';
      const largeCover = typeof cover === 'string' ? cover : cover.large || cover.extraLarge || cover.medium || '';

      sanitized.push({
        anime: {
          ...animeData,
          id,
          title: {
            romaji,
            english,
            native: typeof titleObj === 'object' ? titleObj.native : undefined,
            userPreferred: typeof titleObj === 'object' ? titleObj.userPreferred : romaji,
          },
          coverImage: {
            medium: mediumCover,
            large: largeCover,
            extraLarge: typeof cover === 'object' ? cover.extraLarge : largeCover,
            color: typeof cover === 'object' ? cover.color : undefined,
          },
          format: animeData.format || 'TV',
          episodes: typeof animeData.episodes === 'number' ? animeData.episodes : null,
          genres: Array.isArray(animeData.genres) ? animeData.genres : [],
        },
        status: normalizeStatus((raw as any).status),
        currentEpisode: typeof (raw as any).currentEpisode === 'number' ? (raw as any).currentEpisode : typeof (raw as any).progress === 'number' ? (raw as any).progress : 0,
        userRating: typeof (raw as any).userRating === 'number' ? (raw as any).userRating : typeof (raw as any).score === 'number' ? (raw as any).score : 0,
        notes: typeof (raw as any).notes === 'string' ? (raw as any).notes : undefined,
        addedAt: typeof (raw as any).addedAt === 'string' ? (raw as any).addedAt : new Date().toISOString(),
        updatedAt: typeof (raw as any).updatedAt === 'string' ? (raw as any).updatedAt : new Date().toISOString(),
      });
    }

    return sanitized;
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
    const items = watchlistRef.current;
    if (items.length === 0) return;

    try {
      const filename = `animesenpai-watchlist-${new Date().toISOString().slice(0, 10)}.json`;
      const blob = new Blob([JSON.stringify(items, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = filename;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      setTimeout(() => {
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
      }, 200);

      eventBus.publish('watchlist:exported', { count: items.length, filename });
    } catch (e) {
      console.error('Failed to export watchlist:', e);
    }
  }, []);

  // Publisher: import backup JSON with item validation & smart merging
  const importWatchlist = useCallback(
    (jsonData: string): boolean => {
      try {
        const parsed = JSON.parse(jsonData);
        let rawList: unknown[] = [];

        if (Array.isArray(parsed)) {
          rawList = parsed;
        } else if (parsed && typeof parsed === 'object') {
          const obj = parsed as Record<string, unknown>;
          if (Array.isArray(obj.watchlist)) rawList = obj.watchlist;
          else if (Array.isArray(obj.items)) rawList = obj.items;
          else if (Array.isArray(obj.data)) rawList = obj.data;
          else if (Array.isArray(obj.list)) rawList = obj.list;
          else if (Array.isArray(obj.entries)) rawList = obj.entries;
        }

        if (!rawList.length) return false;

        const validImported: WatchlistItem[] = [];

        for (const entry of rawList) {
          if (!entry || typeof entry !== 'object') continue;
          const e = entry as Record<string, any>;

          const animeData = e.anime || e.media || (typeof e.id === 'number' ? e : null);
          if (!animeData || typeof animeData.id !== 'number') continue;

          const cover = animeData.coverImage || {};
          const mediumCover =
            typeof cover === 'string'
              ? cover
              : cover.medium || cover.large || cover.extraLarge || '';
          const largeCover =
            typeof cover === 'string'
              ? cover
              : cover.large || cover.extraLarge || cover.medium || '';

          const title = animeData.title || {};
          const romajiTitle =
            typeof title === 'string'
              ? title
              : title.romaji || title.userPreferred || title.english || 'Anime';
          const englishTitle =
            typeof title === 'string'
              ? title
              : title.english || title.userPreferred || title.romaji || 'Anime';

          const normalizedItem: WatchlistItem = {
            anime: {
              ...animeData,
              id: animeData.id,
              title: {
                romaji: romajiTitle,
                english: englishTitle,
                native: typeof title === 'object' ? title.native : undefined,
                userPreferred: typeof title === 'object' ? title.userPreferred : romajiTitle,
              },
              coverImage: {
                medium: mediumCover,
                large: largeCover,
                extraLarge: typeof cover === 'object' ? cover.extraLarge : largeCover,
                color: typeof cover === 'object' ? cover.color : undefined,
              },
              format: animeData.format || 'TV',
              episodes: typeof animeData.episodes === 'number' ? animeData.episodes : null,
              genres: Array.isArray(animeData.genres) ? animeData.genres : [],
            },
            status: normalizeStatus(e.status),
            currentEpisode:
              typeof e.currentEpisode === 'number'
                ? e.currentEpisode
                : typeof e.progress === 'number'
                ? e.progress
                : 0,
            userRating:
              typeof e.userRating === 'number'
                ? e.userRating
                : typeof e.score === 'number'
                ? e.score
                : undefined,
            addedAt: e.addedAt || new Date().toISOString(),
            updatedAt: e.updatedAt || new Date().toISOString(),
          };

          validImported.push(normalizedItem);
        }

        if (validImported.length === 0) return false;

        // Merge with existing items: preserves existing items and updates or appends imported ones
        const prevItems = watchlistRef.current;
        const map = new Map<number, WatchlistItem>();
        prevItems.forEach((item) => map.set(item.anime.id, item));

        let addedCount = 0;
        let updatedCount = 0;

        validImported.forEach((importedItem) => {
          if (map.has(importedItem.anime.id)) {
            const existing = map.get(importedItem.anime.id)!;
            map.set(importedItem.anime.id, {
              ...existing,
              ...importedItem,
              anime: { ...existing.anime, ...importedItem.anime },
              updatedAt: new Date().toISOString(),
            });
            updatedCount += 1;
          } else {
            map.set(importedItem.anime.id, importedItem);
            addedCount += 1;
          }
        });

        const merged = Array.from(map.values());
        setWatchlist(merged);
        persistAndBroadcast(merged);
        eventBus.publish('watchlist:imported', {
          count: validImported.length,
          added: addedCount,
          updated: updatedCount,
        });
        return true;
      } catch (err) {
        console.error('Watchlist import error:', err);
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
