import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AnimeCardData, WatchlistItem, WatchlistStatus } from '../api/types';

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (anime: AnimeCardData, status: WatchlistStatus) => void;
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

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('anime_pulse_watchlist_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load watchlist from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  const addToWatchlist = (anime: AnimeCardData, status: WatchlistStatus) => {
    setWatchlist((prev) => {
      const existing = prev.find((item) => item.anime.id === anime.id);
      const now = new Date().toISOString();
      if (existing) {
        return prev.map((item) =>
          item.anime.id === anime.id ? { ...item, status, updatedAt: now } : item
        );
      }
      return [
        {
          anime,
          status,
          currentEpisode: 0,
          addedAt: now,
          updatedAt: now,
        },
        ...prev,
      ];
    });
  };

  const removeFromWatchlist = (animeId: number) => {
    setWatchlist((prev) => prev.filter((item) => item.anime.id !== animeId));
  };

  const updateStatus = (animeId: number, status: WatchlistStatus) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.anime.id === animeId
          ? { ...item, status, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const updateProgress = (animeId: number, episode: number) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.anime.id === animeId
          ? { ...item, currentEpisode: episode, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const updateRating = (animeId: number, rating: number) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.anime.id === animeId
          ? { ...item, userRating: rating, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const getItem = (animeId: number) => {
    return watchlist.find((item) => item.anime.id === animeId);
  };

  const isInWatchlist = (animeId: number) => {
    return watchlist.some((item) => item.anime.id === animeId);
  };

  const clearWatchlist = () => {
    setWatchlist([]);
  };

  const exportWatchlist = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(watchlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `animesenpai-watchlist-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importWatchlist = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed)) {
        setWatchlist(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
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
